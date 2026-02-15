import { describe, it, expect } from "vitest";
import { b } from "../index";

describe("parse", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Plain text
  // ──────────────────────────────────────────────────────────────────────────
  describe("plain text", () => {
    it("should parse a single line of plain text", () => {
      const doc = b.parse("hello world");
      expect(String(doc)).toBe("hello world");
    });

    it("should parse multi-line plain text", () => {
      const doc = b.parse("line one\nline two\nline three");
      expect(String(doc)).toBe("line one\nline two\nline three");
    });

    it("should parse an empty string", () => {
      const doc = b.parse("");
      expect(String(doc)).toBe("");
    });

    it("should parse a string with only whitespace", () => {
      const doc = b.parse("   ");
      expect(String(doc)).toBe("");
    });

    it("should preserve consecutive blank lines between text", () => {
      const doc = b.parse("before\n\n\nafter");
      expect(String(doc)).toBe("before\n\n\nafter");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Headings
  // ──────────────────────────────────────────────────────────────────────────
  describe("headings", () => {
    it("should parse a level 1 heading", () => {
      const doc = b.parse("# Hello");
      expect(String(doc)).toBe("# Hello");
    });

    it("should parse a level 2 heading", () => {
      const doc = b.parse("## Hello");
      expect(String(doc)).toBe("## Hello");
    });

    it("should parse a level 3 heading", () => {
      const doc = b.parse("### Hello");
      expect(String(doc)).toBe("### Hello");
    });

    it("should parse a level 4 heading", () => {
      const doc = b.parse("#### Hello");
      expect(String(doc)).toBe("#### Hello");
    });

    it("should parse a level 5 heading", () => {
      const doc = b.parse("##### Hello");
      expect(String(doc)).toBe("##### Hello");
    });

    it("should parse a level 6 heading", () => {
      const doc = b.parse("###### Hello");
      expect(String(doc)).toBe("###### Hello");
    });

    it("should parse a heading with a custom ID", () => {
      const doc = b.parse("# Hello {#my-id}");
      expect(String(doc)).toBe("# Hello {#my-id}");
    });

    it("should parse a heading with a custom ID at level 3", () => {
      const doc = b.parse("### Section Title {#section-title}");
      expect(String(doc)).toBe("### Section Title {#section-title}");
    });

    it("should parse headings and text interspersed", () => {
      const doc = b.parse("# Title\nsome text\n## Subtitle\nmore text");
      expect(String(doc)).toBe("# Title\nsome text\n## Subtitle\nmore text");
    });

    it("should auto-nest headings into section hierarchy", () => {
      const doc = b.parse("# A\n## B\n### C\ntext\n## D\n# E");
      expect(String(doc)).toBe("# A\n## B\n### C\ntext\n## D\n# E");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownSectionBlock");
      expect(tree).toContain("MarkdownHeadingBlock");
    });

    it("should shift heading levels when embedded in another document", () => {
      const inner = b.parse("# A\n## B\ntext");
      const outer = b.doc(b.sec(b.h("Top"), inner));
      expect(String(outer)).toBe("## Top\n### A\n#### B\ntext");
    });

    it("should shift heading levels when embedded in multiple places", () => {
      const inner = b.parse("# A\n## B\ntext");
      const outer = b.doc(b.sec(b.h("Top"), inner, b.sec(inner)), inner);
      expect(String(outer)).toBe(
        "## Top\n### A\n#### B\ntext\n#### A\n##### B\ntext\n## A\n### B\ntext",
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Inline formatting
  // ──────────────────────────────────────────────────────────────────────────
  describe("inline formatting", () => {
    describe("bold", () => {
      it("should parse **bold** with asterisks", () => {
        const doc = b.parse("**bold text**");
        expect(String(doc)).toBe("**bold text**");
      });

      it("should parse __bold__ with underscores and preserve style", () => {
        const doc = b.parse("__bold text__");
        expect(String(doc)).toBe("__bold text__");
      });

      it("should apply enforceStyles to parsed bold", () => {
        const doc = b.parse("**hello**");
        doc.setRenderingOptions({ enforceStyles: { bold: "__" } });
        expect(String(doc)).toBe("__hello__");
      });

      it("should apply enforceStyles to parsed underscore bold", () => {
        const doc = b.parse("__hello__");
        doc.setRenderingOptions({ enforceStyles: { bold: "**" } });
        expect(String(doc)).toBe("**hello**");
      });
    });

    describe("italic", () => {
      it("should parse *italic* with asterisks", () => {
        const doc = b.parse("*italic text*");
        expect(String(doc)).toBe("*italic text*");
      });

      it("should parse _italic_ with underscores and preserve style", () => {
        const doc = b.parse("_italic text_");
        expect(String(doc)).toBe("_italic text_");
      });

      it("should apply enforceStyles to parsed italic", () => {
        const doc = b.parse("*hello*");
        doc.setRenderingOptions({ enforceStyles: { italic: "_" } });
        expect(String(doc)).toBe("_hello_");
      });
    });

    describe("strikethrough", () => {
      it("should parse ~~strikethrough~~", () => {
        const doc = b.parse("~~deleted text~~");
        expect(String(doc)).toBe("~~deleted text~~");
      });
    });

    describe("highlight", () => {
      it("should parse ==highlight==", () => {
        const doc = b.parse("==highlighted text==");
        expect(String(doc)).toBe("==highlighted text==");
      });
    });

    describe("subscript", () => {
      it("should parse ~subscript~", () => {
        const doc = b.parse("H~2~O");
        expect(String(doc)).toBe("H~2~O");
      });
    });

    describe("superscript", () => {
      it("should parse ^superscript^", () => {
        const doc = b.parse("x^2^");
        expect(String(doc)).toBe("x^2^");
      });
    });

    describe("inline code", () => {
      it("should parse `inline code`", () => {
        const doc = b.parse("use `code` here");
        expect(String(doc)).toBe("use `code` here");
      });

      it("should parse inline code at the beginning of a line", () => {
        const doc = b.parse("`code` first");
        expect(String(doc)).toBe("`code` first");
      });

      it("should parse inline code at the end of a line", () => {
        const doc = b.parse("last `code`");
        expect(String(doc)).toBe("last `code`");
      });
    });

    describe("nested formatting", () => {
      it("should parse bold containing italic", () => {
        const doc = b.parse("**bold *italic* bold**");
        expect(String(doc)).toBe("**bold *italic* bold**");
      });

      it("should parse italic inside strikethrough", () => {
        const doc = b.parse("~~strike *italic*~~");
        expect(String(doc)).toBe("~~strike *italic*~~");
      });

      it("should parse multiple inline formats in one line", () => {
        const doc = b.parse("**bold** and *italic* and ~~strike~~");
        expect(String(doc)).toBe("**bold** and *italic* and ~~strike~~");
      });

      it("should parse highlight, subscript, and superscript together", () => {
        const doc = b.parse("==highlighted== and ~sub~ and ^sup^");
        expect(String(doc)).toBe("==highlighted== and ~sub~ and ^sup^");
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Links
  // ──────────────────────────────────────────────────────────────────────────
  describe("links", () => {
    it("should parse a standard link [text](url)", () => {
      const doc = b.parse("[click here](https://example.com)");
      expect(String(doc)).toBe("[click here](https://example.com)");
    });

    it("should parse an auto-link <url> within surrounding text", () => {
      const doc = b.parse("visit <https://example.com> now");
      expect(String(doc)).toBe("visit <https://example.com> now");
    });

    it("should parse an auto-link <url> as the sole inline content", () => {
      const doc = b.parse("[text](url) and <https://example.com>");
      expect(String(doc)).toBe("[text](url) and <https://example.com>");
    });

    it("should parse a link with nested bold formatting in label", () => {
      const doc = b.parse("[**bold link**](https://example.com)");
      expect(String(doc)).toBe("[**bold link**](https://example.com)");
    });

    it("should parse a link with nested italic formatting in label", () => {
      const doc = b.parse("[*italic link*](https://example.com)");
      expect(String(doc)).toBe("[*italic link*](https://example.com)");
    });

    it("should parse text with a link and surrounding text", () => {
      const doc = b.parse("before [link](url) after");
      expect(String(doc)).toBe("before [link](url) after");
    });

    it("should parse multiple links in one line", () => {
      const doc = b.parse("[a](url1) and [b](url2)");
      expect(String(doc)).toBe("[a](url1) and [b](url2)");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Images
  // ──────────────────────────────────────────────────────────────────────────
  describe("images", () => {
    it("should parse an image ![alt](src)", () => {
      const doc = b.parse("![alt text](image.png)");
      expect(String(doc)).toBe("![alt text](image.png)");
    });

    it("should parse an image with nested formatting in alt text", () => {
      const doc = b.parse("![**bold alt**](image.png)");
      expect(String(doc)).toBe("![**bold alt**](image.png)");
    });

    it("should parse an image with inline text surrounding it", () => {
      const doc = b.parse("before ![logo](logo.png) after");
      expect(String(doc)).toBe("before ![logo](logo.png) after");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Blockquotes
  // ──────────────────────────────────────────────────────────────────────────
  describe("blockquotes", () => {
    it("should parse a single-level blockquote", () => {
      const doc = b.parse("> quoted text");
      expect(String(doc)).toBe("> quoted text");
    });

    it("should parse a multi-line blockquote", () => {
      const doc = b.parse("> line 1\n> line 2");
      expect(String(doc)).toBe("> line 1\n> line 2");
    });

    it("should parse nested blockquotes", () => {
      const doc = b.parse("> line 1\n> line 2\n>> nested");
      expect(String(doc)).toBe("> line 1\n> line 2\n>> nested");
    });

    it("should parse deeply nested blockquotes", () => {
      const input = "> level 1\n>> level 2\n>>> level 3";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse blockquotes with inline formatting", () => {
      const doc = b.parse("> **bold** in quote");
      expect(String(doc)).toBe("> **bold** in quote");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Lists
  // ──────────────────────────────────────────────────────────────────────────
  describe("lists", () => {
    describe("unordered lists", () => {
      it("should parse - style list items", () => {
        const doc = b.parse("- Item 1\n- Item 2\n- Item 3");
        expect(String(doc)).toBe("- Item 1\n- Item 2\n- Item 3");
      });

      it("should parse * style list items and preserve style", () => {
        const doc = b.parse("* Item 1\n* Item 2");
        expect(String(doc)).toBe("* Item 1\n* Item 2");
      });

      it("should parse + style list items and preserve style", () => {
        const doc = b.parse("+ Item 1\n+ Item 2");
        expect(String(doc)).toBe("+ Item 1\n+ Item 2");
      });
    });

    describe("ordered lists", () => {
      it("should parse ordered list items", () => {
        const doc = b.parse("1. First\n2. Second\n3. Third");
        expect(String(doc)).toBe("1. First\n2. Second\n3. Third");
      });

      it("should preserve sequential indexing", () => {
        const doc = b.parse("3. Third\n4. Fourth\n5. Fifth");
        expect(String(doc)).toBe("3. Third\n4. Fourth\n5. Fifth");
      });
    });

    describe("task lists", () => {
      it("should parse checked task items with lowercase x", () => {
        const doc = b.parse("- [x] Done task");
        expect(String(doc)).toBe("- [x] Done task");
      });

      it("should parse unchecked task items", () => {
        const doc = b.parse("- [ ] Todo task");
        expect(String(doc)).toBe("- [ ] Todo task");
      });

      it("should parse checked task items with uppercase X and preserve style", () => {
        const doc = b.parse("- [X] Also done");
        expect(String(doc)).toBe("- [X] Also done");
      });

      it("should parse mixed task list", () => {
        const doc = b.parse("- [x] Done\n- [ ] Not done\n- [X] Also done");
        expect(String(doc)).toBe("- [x] Done\n- [ ] Not done\n- [X] Also done");
      });
    });

    describe("nested lists", () => {
      it("should parse nested unordered lists with indentation", () => {
        const doc = b.parse("- Item 1\n- Item 2\n  - Nested\n- Item 3");
        expect(String(doc)).toBe("- Item 1\n- Item 2\n  - Nested\n- Item 3");
      });

      it("should parse deeply nested lists", () => {
        const doc = b.parse("- Level 1\n  - Level 2\n    - Level 3");
        expect(String(doc)).toBe("- Level 1\n  - Level 2\n    - Level 3");
      });

      it("should parse mixed list types when nested", () => {
        const input = "- Unordered\n  1. Ordered nested\n  2. Ordered nested 2";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Code blocks
  // ──────────────────────────────────────────────────────────────────────────
  describe("code blocks", () => {
    it("should parse a fenced code block with language", () => {
      const input = "```js\nconst x = 1;\n```";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse a fenced code block without language as inline code when single line", () => {
      // A fenced code block without language and a single line of content
      // is rendered as inline code by the code block's render method
      const doc = b.parse("```\nsome code\n```");
      expect(String(doc)).toBe("`some code`");
    });

    it("should parse a fenced code block without language with multiple lines", () => {
      const input = "```\nline one\nline two\n```";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse a multi-line code block with language", () => {
      const input =
        "```python\ndef hello():\n    print('world')\n\nreturn 42\n```";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse code block with various languages", () => {
      const input = "```typescript\nconst x: number = 42;\n```";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should preserve code block content exactly", () => {
      const input = "```js\n  indented\n    more indented\nnot indented\n```";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Horizontal rules
  // ──────────────────────────────────────────────────────────────────────────
  describe("horizontal rules", () => {
    it("should parse --- horizontal rule", () => {
      const doc = b.parse("before\n\n---\n\nafter");
      expect(String(doc)).toBe("before\n\n---\n\nafter");
    });

    it("should parse *** horizontal rule", () => {
      const doc = b.parse("before\n\n***\n\nafter");
      expect(String(doc)).toBe("before\n\n***\n\nafter");
    });

    it("should parse ___ horizontal rule", () => {
      const doc = b.parse("before\n\n___\n\nafter");
      expect(String(doc)).toBe("before\n\n___\n\nafter");
    });

    it("should parse a long horizontal rule and preserve count", () => {
      const doc = b.parse("before\n\n----------------\n\nafter");
      expect(String(doc)).toBe("before\n\n----------------\n\nafter");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHorizontalRuleBlock");
    });

    it("should parse a long asterisk horizontal rule", () => {
      const doc = b.parse("before\n\n********\n\nafter");
      expect(String(doc)).toBe("before\n\n********\n\nafter");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHorizontalRuleBlock");
    });

    it("should consume surrounding blank lines as part of the rule", () => {
      const doc = b.parse("text\n\n---\n\nmore");
      expect(String(doc)).toBe("text\n\n---\n\nmore");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Tables
  // ──────────────────────────────────────────────────────────────────────────
  describe("tables", () => {
    it("should parse a basic table", () => {
      const input =
        "| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |";
      const doc = b.parse(input);
      expect(String(doc)).toBe(
        "| Name  | Age |\n| ----- | --- |\n| Alice | 30  |\n| Bob   | 25  |",
      );
    });

    it("should parse a table with left alignment", () => {
      const input = "| Col |\n| :--- |\n| data |";
      const doc = b.parse(input);
      const result = String(doc);
      expect(result).toContain(":---");
    });

    it("should parse a table with right alignment", () => {
      const input = "| Col |\n| ---: |\n| data |";
      const doc = b.parse(input);
      const result = String(doc);
      expect(result).toContain("---:");
    });

    it("should parse a table with center alignment", () => {
      const input = "| Col |\n| :---: |\n| data |";
      const doc = b.parse(input);
      const result = String(doc);
      expect(result).toContain(":---:");
    });

    it("should parse a table with mixed alignments", () => {
      const input =
        "| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |";
      const doc = b.parse(input);
      const result = String(doc);
      expect(result).toContain(":---");
      expect(result).toContain(":---:");
      expect(result).toContain("---:");
    });

    it("should parse escaped pipes in table cells", () => {
      const input = "| Expr |\n| --- |\n| a \\| b |";
      const doc = b.parse(input);
      expect(String(doc)).toBe("| Expr   |\n| ------ |\n| a \\| b |");
    });

    it("should parse inline formatting in table cells", () => {
      const input =
        "| Item | Status |\n| --- | --- |\n| **Important** | *pending* |";
      const doc = b.parse(input);
      expect(String(doc)).toBe(
        "| Item          | Status    |\n| ------------- | --------- |\n| **Important** | *pending* |",
      );
    });

    it("should parse a header-only table with no data rows", () => {
      const input = "| Name | Age |\n| --- | --- |";
      const doc = b.parse(input);
      const result = String(doc);
      expect(result).toContain("Name");
      expect(result).toContain("Age");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Footnotes
  // ──────────────────────────────────────────────────────────────────────────
  describe("footnotes", () => {
    it("should parse a simple footnote reference and definition", () => {
      const input = "Some text[^1]\n\n[^1]: footnote content";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse multiple footnotes", () => {
      const input =
        "First[^1] and second[^2]\n\n[^1]: first note\n[^2]: second note";
      const doc = b.parse(input);
      expect(String(doc)).toContain("[^1]");
      expect(String(doc)).toContain("[^2]");
    });

    it("should parse a named footnote identifier", () => {
      const input = "Some text[^bignote]\n\n[^bignote]: big note content";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should reset numeric IDs for embedding in host documents", () => {
      const input = "Text[^1]\n\n[^1]: note content";
      const parsed = b.parse(input);
      const host = b.doc(b.para("Host", b.footnote("host note")), parsed);
      const result = String(host);
      // The host footnote gets [^1], and the parsed one gets [^2]
      expect(result).toContain("[^1]");
      expect(result).toContain("[^2]");
    });

    it("should not render footnotes with unmatched references", () => {
      const input = "Some text[^1]\n\n[^2]: footnote content";
      const doc = b.parse(input);
      expect(String(doc)).toBe("Some text");
    });

    it("should not render footnotes with unmatched definitions", () => {
      const input = "Some text[^1]\n\n[^2]: orphan footnote";
      const doc = b.parse(input);
      expect(String(doc)).not.toContain("[^2]");
    });

    it("should parse footnotes with multi-line content", () => {
      const input = "Text[^1]\n\n[^1]: first line\nsecond line";
      const doc = b.parse(input);
      const result = String(doc);
      expect(result).toContain("first line");
      expect(result).toContain("second line");
    });

    it("should embed parsed footnotes naturally in host documents", () => {
      const input =
        "Some text[^1]\n\n[^1]: footnote content\n\nSome more text[^bignote]\n\n[^bignote]: footnote content\n\nFinal footnote[^3]\n\n[^3]: final footnote content";
      const doc = b.parse(input);
      const hostDoc = b.doc(
        b.para("Host text", b.footnote("host footnote content")),
        b.br(),
        b.sec(b.h("Heading"), b.sec(b.h("Nested heading"), doc)),
        b.br(),
        b.para("Host text 2", b.footnote("host footnote content 2")),
      );
      expect(String(hostDoc)).toBe(
        "Host text[^1]\n\n## Heading\n### Nested heading\nSome text[^2]\n\nSome more text[^bignote]\n\nFinal footnote[^3]\n\nHost text 2[^4]\n\n[^1]: host footnote content\n[^2]: footnote content\n[^bignote]: footnote content\n[^3]: final footnote content\n[^4]: host footnote content 2",
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Emoji
  // ──────────────────────────────────────────────────────────────────────────
  describe("emoji", () => {
    it("should parse an emoji shortcode", () => {
      const doc = b.parse("hello :waffle: world");
      expect(String(doc)).toBe("hello :waffle: world");
    });

    it("should parse an emoji at the beginning of text", () => {
      const doc = b.parse(":heart: love");
      expect(String(doc)).toBe(":heart: love");
    });

    it("should parse an emoji at the end of text", () => {
      const doc = b.parse("nice :thumbsup:");
      expect(String(doc)).toBe("nice :thumbsup:");
    });

    it("should parse multiple emojis in one line", () => {
      const doc = b.parse(":heart: and :sparkles:");
      expect(String(doc)).toBe(":heart: and :sparkles:");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Section nesting
  // ──────────────────────────────────────────────────────────────────────────
  describe("section nesting", () => {
    it("should place a top-level heading directly in the document without wrapping section", () => {
      // A level-1 heading at the top level does not create a section block;
      // sections are created to house deeper-level headings.
      const doc = b.parse("# Title\ncontent");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHeadingBlock");
      expect(tree).toContain('"content"');
    });

    it("should create section blocks for nested headings", () => {
      const doc = b.parse("# A\n## B\n### C\ntext\n## D\n# E");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownSectionBlock");
      expect(tree).toContain("MarkdownHeadingBlock");
    });

    it("should nest headings based on level hierarchy", () => {
      const doc = b.parse("# A\n## B\n### C\n## D\n# E");
      expect(String(doc)).toBe("# A\n## B\n### C\n## D\n# E");
    });

    it("should handle skipped heading levels", () => {
      const doc = b.parse("# Title\n### Skipped to 3");
      expect(String(doc)).toBe("# Title\n### Skipped to 3");
    });

    it("should handle heading level going back up", () => {
      const doc = b.parse("# First\n## Second\n# Third");
      expect(String(doc)).toBe("# First\n## Second\n# Third");
    });

    it("should place content under the correct section", () => {
      const doc = b.parse("# A\nunder A\n## B\nunder B\n# C\nunder C");
      expect(String(doc)).toBe("# A\nunder A\n## B\nunder B\n# C\nunder C");
    });

    it("should give each same-level heading its own section", () => {
      const doc = b.parse("# H1\n## A\nunder A\n## B\nunder B");
      const tree = b.inspect(doc);
      // Both ## headings should be in separate sections at the same depth
      const sectionMatches = tree.match(/MarkdownSectionBlock/g);
      expect(sectionMatches?.length).toBeGreaterThanOrEqual(2);
      // Round-trip should preserve
      expect(String(doc)).toBe("# H1\n## A\nunder A\n## B\nunder B");
    });

    it("should correctly nest the user's complex document example", () => {
      const input = [
        "# Heading 1",
        "| Table | Header 2 |",
        "| --- | --- |",
        "| Row 1 | Row 2 |",
        "- List item 1",
        "- List item 2",
        "## Header 2",
        "> Blockquote",
        "### Header 3",
        "- [ ] Task item 1",
        "## Header 2-2",
        "- [x] Task item 2-1",
        "### Header 3-1",
      ].join("\n");
      const doc = b.parse(input);
      const tree = b.inspect(doc);
      // Each ## heading should be in its own section
      // Count sections: 2 for ## headers + 2 for ### headers = 4
      const sectionCount = (tree.match(/MarkdownSectionBlock/g) || []).length;
      expect(sectionCount).toBe(4);
      // Verify the output contains all headings in the right order
      const output = String(doc);
      expect(output).toContain("# Heading 1");
      expect(output).toContain("## Header 2");
      expect(output).toContain("### Header 3");
      expect(output).toContain("## Header 2-2");
      expect(output).toContain("### Header 3-1");
    });

    it("should round-trip multiple same-level headings with content", () => {
      const input = "# A\n## B\nunder B\n## C\nunder C\n## D";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Round-trip tests
  // ──────────────────────────────────────────────────────────────────────────
  describe("round-trip", () => {
    it("should round-trip plain text", () => {
      const input = "just plain text\nmore text";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip headings with sections", () => {
      const input = "# A\n## B\n### C\ntext\n## D\n# E";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip inline formatting", () => {
      const input = "**bold** and *italic* and ~~strike~~";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip nested inline formatting", () => {
      const input = "**bold *italic* bold**";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip links and images", () => {
      const input = "[text](url) and ![alt](src) and <https://example.com>";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip unordered lists", () => {
      const input = "- Item 1\n- Item 2\n  - Nested\n- Item 3";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip ordered lists", () => {
      const input = "1. First\n2. Second\n3. Third";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip task lists", () => {
      const input = "- [x] Done\n- [ ] Not done\n- [X] Also done";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip code blocks with language", () => {
      const input = "```js\nconst x = 1;\n```";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip inline code", () => {
      const input = "use `code` here";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip blockquotes", () => {
      const input = "> line 1\n> line 2\n>> nested";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip horizontal rules with default style", () => {
      const input = "before\n\n---\n\nafter";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip horizontal rules with asterisk style", () => {
      const input = "before\n\n***\n\nafter";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip horizontal rules with underscore style", () => {
      const input = "before\n\n___\n\nafter";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip horizontal rules with custom length", () => {
      const input = "before\n\n----------------\n\nafter";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip footnotes", () => {
      const input = "Some text[^1]\n\n[^1]: footnote content";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip highlight, subscript, superscript", () => {
      const input = "==highlighted== and ~sub~ and ^sup^";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip emoji", () => {
      const input = "hello :waffle: world";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip a table with alignment", () => {
      const input =
        "| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |";
      const doc = b.parse(input);
      expect(String(doc)).toBe(
        "| Left | Center | Right |\n| :--- | :---:  |  ---: |\n| a    | b      | c     |",
      );
    });

    it("should round-trip a complex built document", () => {
      const input = String(
        b.doc(
          b.block(
            b.para(
              "Some text",
              b.footnote("footnote content"),
              b.p("text").b().i().st().hl().url("https://example.com"),
            ),
            b.list.ul(
              "Item 1",
              "Item 2",
              b.list.ol("Item 3", "Item 4").startingIndex(3),
            ),
          ),
        ),
      );
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should round-trip a document with headings, lists, code, and blockquotes", () => {
      const input = [
        "# Title",
        "Some intro text",
        "## Section",
        "- Item 1",
        "- Item 2",
        "  - Nested item",
        "```js",
        "const x = 1;",
        "```",
        "> A blockquote",
      ].join("\n");
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should round-trip underscore bold style", () => {
      const input = "__bold text__";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip underscore italic style", () => {
      const input = "_italic text_";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip * list style", () => {
      const input = "* Item 1\n* Item 2";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip + list style", () => {
      const input = "+ Item 1\n+ Item 2";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip multiple footnotes collecting definitions at the end", () => {
      const input =
        "Some text[^1]\n\nSome more text[^2]\n\nFinal footnote[^3]\n\n[^1]: footnote content\n[^2]: footnote content\n[^3]: final footnote content";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Edge cases
  // ──────────────────────────────────────────────────────────────────────────
  describe("edge cases", () => {
    it("should handle empty input", () => {
      const doc = b.parse("");
      expect(String(doc)).toBe("");
    });

    it("should handle input with only whitespace", () => {
      const doc = b.parse("   ");
      expect(String(doc)).toBe("");
    });

    it("should handle text with trailing newline", () => {
      const doc = b.parse("hello\n");
      expect(String(doc)).toBe("hello\n");
    });

    it("should handle text with leading newline", () => {
      const doc = b.parse("\nhello");
      expect(String(doc)).toBe("\nhello");
    });

    it("should treat only-newline input as empty document", () => {
      // Only blank lines parse into all-empty content which the document
      // considers empty, rendering as empty string
      const doc = b.parse("\n\n\n");
      expect(doc.isEmpty).toBe(true);
    });

    it("should treat a single newline as empty document", () => {
      const doc = b.parse("\n");
      expect(doc.isEmpty).toBe(true);
    });

    it("should handle a document with many different block types", () => {
      const input = [
        "# Heading",
        "Paragraph text with **bold** and *italic*",
        "- List item 1",
        "- List item 2",
        "1. Ordered 1",
        "2. Ordered 2",
        "> Blockquote",
        "```js",
        "code block",
        "```",
      ].join("\n");
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should correctly identify heading blocks in the tree", () => {
      const doc = b.parse("# Title\n## Subtitle");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHeadingBlock");
    });

    it("should correctly identify bold blocks in the tree", () => {
      const doc = b.parse("**bold**");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBoldBlock");
    });

    it("should correctly identify italic blocks in the tree", () => {
      const doc = b.parse("*italic*");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownItalicBlock");
    });

    it("should correctly identify code blocks in the tree", () => {
      const doc = b.parse("```js\ncode\n```");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownCodeBlock");
      expect(tree).toContain("language=js");
    });

    it("should correctly identify link blocks in the tree", () => {
      const doc = b.parse("[click](url)");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("url=url");
    });

    it("should correctly identify image blocks in the tree", () => {
      const doc = b.parse("![alt](src)");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownImageBlock");
      expect(tree).toContain("src=src");
    });

    it("should correctly identify list blocks in the tree", () => {
      const doc = b.parse("- item 1\n- item 2");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownListBlock");
    });

    it("should correctly identify blockquote blocks in the tree", () => {
      const doc = b.parse("> quoted");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBlockquoteBlock");
    });

    it("should correctly identify horizontal rule blocks in the tree", () => {
      const doc = b.parse("before\n\n---\n\nafter");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHorizontalRuleBlock");
    });

    it("should correctly identify strikethrough blocks in the tree", () => {
      const doc = b.parse("~~deleted~~");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownStrikethroughBlock");
    });

    it("should correctly identify highlight blocks in the tree", () => {
      const doc = b.parse("==highlighted==");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHighlightBlock");
    });

    it("should correctly identify subscript blocks in the tree", () => {
      const doc = b.parse("~sub~");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownSubscriptBlock");
    });

    it("should correctly identify superscript blocks in the tree", () => {
      const doc = b.parse("^sup^");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownSuperscriptBlock");
    });

    it("should correctly identify emoji blocks in the tree", () => {
      const doc = b.parse(":waffle:");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownEmojiBlock");
    });

    it("should correctly identify task item blocks in the tree", () => {
      const doc = b.parse("- [x] done\n- [ ] todo");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownTaskItemBlock");
    });

    it("should correctly identify table blocks in the tree", () => {
      const doc = b.parse("| A |\n| --- |\n| val |");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownTableBlock");
    });

    it("should correctly identify footnote blocks in the tree", () => {
      const doc = b.parse("text[^1]\n\n[^1]: note");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownFootnoteBlock");
    });

    it("should produce a MarkdownDocument instance", () => {
      const doc = b.parse("hello");
      expect(doc.constructor.name).toBe("MarkdownDocument");
    });

    it("should parse heading with inline formatting", () => {
      const doc = b.parse("# Hello **world**");
      expect(String(doc)).toBe("# Hello **world**");
    });

    it("should parse heading with strikethrough", () => {
      const doc = b.parse("###### heading ~~7 strikethrough text~~");
      expect(String(doc)).toBe("###### heading ~~7 strikethrough text~~");
    });
  });
});
