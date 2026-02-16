import { describe, it, expect } from "vitest";
import {
  b,
  MarkdownBlockquoteBlock,
  MarkdownCommentBlock,
  MarkdownDetailsBlock,
  MarkdownImageBlock,
  MarkdownLinkBlock,
  MarkdownUnderlineBlock,
} from "../index";

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

      it("should apply enforce to parsed bold", () => {
        const doc = b.parse("**hello**");
        doc.setRenderingOptions({ enforce: { bold: { style: "__" } } });
        expect(String(doc)).toBe("__hello__");
      });

      it("should apply enforce to parsed underscore bold", () => {
        const doc = b.parse("__hello__");
        doc.setRenderingOptions({ enforce: { bold: { style: "**" } } });
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

      it("should apply enforce to parsed italic", () => {
        const doc = b.parse("*hello*");
        doc.setRenderingOptions({ enforce: { italic: { style: "_" } } });
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

    describe("HTML links with target", () => {
      it("should parse <a> tag with href and target", () => {
        const input =
          '<a href="https://example.com" target="_blank">Example</a>';
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should set $target on the parsed MarkdownLinkBlock", () => {
        const doc = b.parse(
          '<a href="https://example.com" target="_blank">click</a>',
        );
        const para = doc.$lines[0] as any;
        const link = para.$content[0];
        expect(link).toBeInstanceOf(MarkdownLinkBlock);
        expect((link as MarkdownLinkBlock).$target).toBe("_blank");
      });

      it("should set $url on the parsed MarkdownLinkBlock", () => {
        const doc = b.parse(
          '<a href="https://example.com" target="_blank">click</a>',
        );
        const para = doc.$lines[0] as any;
        const link = para.$content[0] as MarkdownLinkBlock;
        expect(link.$url).toBe("https://example.com");
      });

      it("should parse _self target", () => {
        const input =
          '<a href="https://example.com" target="_self">Example</a>';
        const doc = b.parse(input);
        const para = doc.$lines[0] as any;
        const link = para.$content[0] as MarkdownLinkBlock;
        expect(link.$target).toBe("_self");
        expect(String(doc)).toBe(input);
      });

      it("should parse _parent target", () => {
        const input =
          '<a href="https://example.com" target="_parent">Example</a>';
        const doc = b.parse(input);
        const para = doc.$lines[0] as any;
        const link = para.$content[0] as MarkdownLinkBlock;
        expect(link.$target).toBe("_parent");
        expect(String(doc)).toBe(input);
      });

      it("should parse _top target", () => {
        const input = '<a href="https://example.com" target="_top">Example</a>';
        const doc = b.parse(input);
        const para = doc.$lines[0] as any;
        const link = para.$content[0] as MarkdownLinkBlock;
        expect(link.$target).toBe("_top");
        expect(String(doc)).toBe(input);
      });

      it("should parse <a> with surrounding text", () => {
        const input =
          'before <a href="https://example.com" target="_blank">link</a> after';
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse <a> with nested bold", () => {
        const input =
          '<a href="https://example.com" target="_blank">**bold link**</a>';
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should not confuse <a> tags with auto-links", () => {
        const doc = b.parse(
          '<a href="https://example.com" target="_blank">link</a> and <https://other.com>',
        );
        expect(String(doc)).toBe(
          '<a href="https://example.com" target="_blank">link</a> and <https://other.com>',
        );
      });

      it("should not confuse <a> tags with <ins> tags", () => {
        const doc = b.parse(
          '<a href="https://example.com" target="_blank">link</a> and <ins>underlined</ins>',
        );
        expect(String(doc)).toBe(
          '<a href="https://example.com" target="_blank">link</a> and <ins>underlined</ins>',
        );
      });

      it("should show target in inspect metadata", () => {
        const doc = b.parse(
          '<a href="https://example.com" target="_blank">click</a>',
        );
        const tree = b.inspect(doc);
        expect(tree).toContain("MarkdownLinkBlock");
        expect(tree).toContain("target=_blank");
        expect(tree).toContain("url=https://example.com");
      });

      it("should show target=_self in inspect metadata", () => {
        const doc = b.parse(
          '<a href="https://example.com" target="_self">click</a>',
        );
        const tree = b.inspect(doc);
        expect(tree).toContain("target=_self");
      });

      it("should round-trip an HTML link with target", () => {
        const input =
          '<a href="https://example.com" target="_blank">Example</a>';
        expect(String(b.parse(input))).toBe(input);
      });

      it("should round-trip HTML link mixed with markdown links", () => {
        const input =
          '[md link](url) and <a href="https://example.com" target="_blank">html link</a>';
        expect(String(b.parse(input))).toBe(input);
      });
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

    describe("figure with caption", () => {
      it("should parse a figure with img and figcaption", () => {
        const input =
          '<figure>\n  <img src="photo.png" alt="A photo">\n  <figcaption>A caption</figcaption>\n</figure>';
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should produce a MarkdownImageBlock with $caption set", () => {
        const doc = b.parse(
          '<figure>\n  <img src="photo.png" alt="alt">\n  <figcaption>caption</figcaption>\n</figure>',
        );
        const img = doc.$lines[0];
        expect(img).toBeInstanceOf(MarkdownImageBlock);
        expect((img as MarkdownImageBlock).$caption).toBeTruthy();
      });

      it("should set $src on the parsed image block", () => {
        const doc = b.parse(
          '<figure>\n  <img src="photo.png" alt="alt">\n  <figcaption>caption</figcaption>\n</figure>',
        );
        const img = doc.$lines[0] as MarkdownImageBlock;
        expect(img.$src).toBe("photo.png");
      });

      it("should parse alt text into $content", () => {
        const doc = b.parse(
          '<figure>\n  <img src="photo.png" alt="alt text">\n  <figcaption>caption</figcaption>\n</figure>',
        );
        const img = doc.$lines[0] as MarkdownImageBlock;
        expect(img.$content).toEqual(["alt text"]);
      });

      it("should parse caption content", () => {
        const doc = b.parse(
          '<figure>\n  <img src="photo.png" alt="alt">\n  <figcaption>My caption</figcaption>\n</figure>',
        );
        const img = doc.$lines[0] as MarkdownImageBlock;
        expect(img.$caption).toEqual(["My caption"]);
      });

      it("should parse figure without alt attribute", () => {
        const input =
          '<figure>\n  <img src="photo.png">\n  <figcaption>A caption</figcaption>\n</figure>';
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
        const img = doc.$lines[0] as MarkdownImageBlock;
        expect(img.$src).toBe("photo.png");
        expect(img.$content).toEqual([]);
      });

      it("should parse caption with inline formatting", () => {
        const input =
          '<figure>\n  <img src="photo.png" alt="alt">\n  <figcaption>Taken in **Paris**</figcaption>\n</figure>';
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse figure with surrounding content", () => {
        const input =
          'before\n<figure>\n  <img src="photo.png" alt="alt">\n  <figcaption>caption</figcaption>\n</figure>\nafter';
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should show alt and caption as distinct trees in inspect", () => {
        const doc = b.parse(
          '<figure>\n  <img src="photo.png" alt="alt text">\n  <figcaption>My caption</figcaption>\n</figure>',
        );
        const tree = b.inspect(doc);
        expect(tree).toContain("MarkdownImageBlock");
        expect(tree).toContain("src=photo.png");
        expect(tree).toContain("alt");
        expect(tree).toContain('"alt text"');
        expect(tree).toContain("caption");
        expect(tree).toContain('"My caption"');
      });

      it("should show only caption in inspect when no alt", () => {
        const doc = b.parse(
          '<figure>\n  <img src="photo.png">\n  <figcaption>My caption</figcaption>\n</figure>',
        );
        const tree = b.inspect(doc);
        expect(tree).not.toContain("├── alt");
        expect(tree).toContain("caption");
        expect(tree).toContain('"My caption"');
      });

      it("should round-trip a figure with caption", () => {
        const input =
          '<figure>\n  <img src="photo.png" alt="A photo">\n  <figcaption>A caption</figcaption>\n</figure>';
        expect(String(b.parse(input))).toBe(input);
      });

      it("should round-trip a figure without alt", () => {
        const input =
          '<figure>\n  <img src="photo.png">\n  <figcaption>A caption</figcaption>\n</figure>';
        expect(String(b.parse(input))).toBe(input);
      });
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

    describe("GitHub alerts", () => {
      it("should parse a [!NOTE] alert blockquote", () => {
        const input = "> [!NOTE]\n> This is a note";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse a [!TIP] alert blockquote", () => {
        const input = "> [!TIP]\n> This is a tip";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse a [!IMPORTANT] alert blockquote", () => {
        const input = "> [!IMPORTANT]\n> This is important";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse a [!WARNING] alert blockquote", () => {
        const input = "> [!WARNING]\n> This is a warning";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse a [!CAUTION] alert blockquote", () => {
        const input = "> [!CAUTION]\n> This is a caution";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse alert with multiple lines of content", () => {
        const input = "> [!NOTE]\n> line one\n> line two";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse alert with inline formatting", () => {
        const input = "> [!WARNING]\n> **bold** warning";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should set the alert property on the parsed block", () => {
        const doc = b.parse("> [!NOTE]\n> text");
        const tree = b.inspect(doc);
        expect(tree).toContain("MarkdownBlockquoteBlock");
        expect(tree).toContain("alert=note");
      });

      it("should set $alert on the MarkdownBlockquoteBlock instance", () => {
        const doc = b.parse("> [!WARNING]\n> be careful");
        const bq = doc.$lines[0];
        expect(bq).toBeInstanceOf(MarkdownBlockquoteBlock);
        expect((bq as MarkdownBlockquoteBlock).$alert).toBe("warning");
      });

      it("should parse case-insensitively", () => {
        const doc = b.parse("> [!note]\n> text");
        expect(String(doc)).toBe("> [!NOTE]\n> text");
      });

      it("should not treat unknown alert types as alerts", () => {
        const input = "> [!UNKNOWN]\n> text";
        const doc = b.parse(input);
        // Should be parsed as regular blockquote content, not as alert
        expect(String(doc)).toBe(input);
      });

      it("should parse alert blockquote with surrounding content", () => {
        const input = "before\n> [!TIP]\n> helpful tip\nafter";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should round-trip alert blockquotes", () => {
        const input = "> [!IMPORTANT]\n> Do not forget this";
        expect(String(b.parse(input))).toBe(input);
      });
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

    it("should be able to parse inline code blocks in middle of text", () => {
      const input = "text `code` text";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should be able to parse multi line code blocks in middle of text", () => {
      const input = "text ```code``` text";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should be able to parse code blocks with language in middle of text", () => {
      const input = "text ```js\ncode\n``` text";
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
  // 13. Math blocks
  // ──────────────────────────────────────────────────────────────────────────
  describe("math blocks", () => {
    describe("inline math", () => {
      it("should parse standalone inline math $...$", () => {
        const doc = b.parse("$x^2$");
        expect(String(doc)).toBe("$x^2$");
      });

      it("should parse inline math within text", () => {
        const doc = b.parse("the formula $E=mc^2$ is famous");
        expect(String(doc)).toBe("the formula $E=mc^2$ is famous");
      });

      it("should parse inline math at start of line", () => {
        const doc = b.parse("$x$ is a variable");
        expect(String(doc)).toBe("$x$ is a variable");
      });

      it("should parse inline math at end of line", () => {
        const doc = b.parse("value is $42$");
        expect(String(doc)).toBe("value is $42$");
      });

      it("should parse multiple inline math per line", () => {
        const doc = b.parse("$a$ plus $b$ equals $c$");
        expect(String(doc)).toBe("$a$ plus $b$ equals $c$");
      });
    });

    describe("block math", () => {
      it("should parse a block math fence with single-line content", () => {
        const doc = b.parse("$$\nx^2\n$$");
        // Single-line block math collapses to inline on round-trip
        expect(String(doc)).toBe("$x^2$");
      });

      it("should parse a block math fence with multi-line content", () => {
        const input = "$$\na + b\nc + d\n$$";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should dedent indentation in block math like code blocks", () => {
        const doc = b.parse("$$\n  indented\n    more indented\n$$");
        expect(String(doc)).toBe("$$\nindented\n  more indented\n$$");
      });

      it("should preserve empty lines within block math", () => {
        const input = "$$\nline 1\n\nline 3\n$$";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should parse block math with surrounding content", () => {
        const doc = b.parse("before\n$$\na + b\nc + d\n$$\nafter");
        expect(String(doc)).toBe("before\n$$\na + b\nc + d\n$$\nafter");
      });
    });

    describe("edge cases", () => {
      it("should not confuse $$ block delimiters with inline $", () => {
        const input = "$$\nx + y\nz + w\n$$";
        const doc = b.parse(input);
        expect(String(doc)).toBe(input);
      });

      it("should correctly identify MarkdownMathBlock in the tree for inline math", () => {
        const doc = b.parse("$x^2$");
        const tree = b.inspect(doc);
        expect(tree).toContain("MarkdownMathBlock");
      });

      it("should correctly identify MarkdownMathBlock in the tree for block math", () => {
        const doc = b.parse("$$\na + b\nc + d\n$$");
        const tree = b.inspect(doc);
        expect(tree).toContain("MarkdownMathBlock");
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Comments
  // ──────────────────────────────────────────────────────────────────────────
  describe("comments", () => {
    it("should parse a comment [content]: #", () => {
      const doc = b.parse("[this is a comment]: #");
      expect(String(doc)).toBe("[this is a comment]: #");
    });

    it("should produce a MarkdownCommentBlock instance", () => {
      const doc = b.parse("[comment text]: #");
      const block = doc.$lines[0];
      expect(block).toBeInstanceOf(MarkdownCommentBlock);
    });

    it("should preserve the comment content", () => {
      const doc = b.parse("[my hidden note]: #");
      const block = doc.$lines[0] as MarkdownCommentBlock;
      expect(block.$content).toEqual(["my hidden note"]);
    });

    it("should parse a comment with surrounding content", () => {
      const doc = b.parse("before\n[hidden]: #\nafter");
      expect(String(doc)).toBe("before\n[hidden]: #\nafter");
      expect(doc.$lines[1]).toBeInstanceOf(MarkdownCommentBlock);
    });

    it("should parse multiple comments", () => {
      const doc = b.parse("[comment 1]: #\n[comment 2]: #");
      expect(String(doc)).toBe("[comment 1]: #\n[comment 2]: #");
      expect(doc.$lines[0]).toBeInstanceOf(MarkdownCommentBlock);
      expect(doc.$lines[1]).toBeInstanceOf(MarkdownCommentBlock);
    });

    it("should not confuse comments with footnote definitions", () => {
      const doc = b.parse("text[^1]\n\n[^1]: footnote content");
      expect(String(doc)).not.toContain("]: #");
    });

    it("should not confuse footnote definitions with comments", () => {
      const input = "[not a footnote]: #";
      const doc = b.parse(input);
      expect(doc.$lines[0]).toBeInstanceOf(MarkdownCommentBlock);
      expect(String(doc)).toBe(input);
    });

    it("should correctly identify MarkdownCommentBlock in the tree", () => {
      const doc = b.parse("[hidden]: #");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownCommentBlock");
    });

    it("should round-trip a comment", () => {
      const input = "[this is hidden]: #";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip comments mixed with other content", () => {
      const input = "visible\n[hidden]: #\nmore visible";
      expect(String(b.parse(input))).toBe(input);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Underlines
  // ──────────────────────────────────────────────────────────────────────────
  describe("underlines", () => {
    it("should parse inline <ins>content</ins>", () => {
      const doc = b.parse("<ins>underlined</ins>");
      expect(String(doc)).toBe("<ins>underlined</ins>");
    });

    it("should produce a MarkdownUnderlineBlock instance", () => {
      const doc = b.parse("<ins>text</ins>");
      const para = doc.$lines[0] as any;
      // The paragraph wraps the underline block in $content
      expect(para.$content[0]).toBeInstanceOf(MarkdownUnderlineBlock);
    });

    it("should parse underline within surrounding text", () => {
      const doc = b.parse("before <ins>underlined</ins> after");
      expect(String(doc)).toBe("before <ins>underlined</ins> after");
    });

    it("should parse underline at start of line", () => {
      const doc = b.parse("<ins>start</ins> rest");
      expect(String(doc)).toBe("<ins>start</ins> rest");
    });

    it("should parse underline at end of line", () => {
      const doc = b.parse("rest <ins>end</ins>");
      expect(String(doc)).toBe("rest <ins>end</ins>");
    });

    it("should parse multiple underlines in one line", () => {
      const doc = b.parse("<ins>one</ins> and <ins>two</ins>");
      expect(String(doc)).toBe("<ins>one</ins> and <ins>two</ins>");
    });

    it("should parse underline with nested bold", () => {
      const doc = b.parse("<ins>**bold underline**</ins>");
      expect(String(doc)).toBe("<ins>**bold underline**</ins>");
    });

    it("should parse underline with nested italic", () => {
      const doc = b.parse("<ins>*italic underline*</ins>");
      expect(String(doc)).toBe("<ins>*italic underline*</ins>");
    });

    it("should not confuse <ins> with auto-links", () => {
      const doc = b.parse("<ins>text</ins> and <https://example.com>");
      expect(String(doc)).toBe("<ins>text</ins> and <https://example.com>");
    });

    it("should correctly identify MarkdownUnderlineBlock in the tree", () => {
      const doc = b.parse("<ins>underlined</ins>");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownUnderlineBlock");
    });

    it("should round-trip an underline", () => {
      const input = "<ins>underlined</ins>";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip underline mixed with other formatting", () => {
      const input = "**bold** and <ins>underlined</ins> and *italic*";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should parse underline in a heading", () => {
      const doc = b.parse("# Title with <ins>underline</ins>");
      expect(String(doc)).toBe("# Title with <ins>underline</ins>");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Details
  // ──────────────────────────────────────────────────────────────────────────
  describe("details", () => {
    it("should parse a details block with summary", () => {
      const input =
        "<details>\n  <summary>Click me</summary>\n  Some content\n</details>";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should produce a MarkdownDetailsBlock instance", () => {
      const doc = b.parse(
        "<details>\n  <summary>Title</summary>\n  Content\n</details>",
      );
      const block = doc.$lines[0];
      expect(block).toBeInstanceOf(MarkdownDetailsBlock);
    });

    it("should set $summary on the parsed block", () => {
      const doc = b.parse(
        "<details>\n  <summary>My summary</summary>\n  Content\n</details>",
      );
      const block = doc.$lines[0] as MarkdownDetailsBlock;
      expect(block.$summary).toEqual(["My summary"]);
    });

    it("should parse content into $lines", () => {
      const doc = b.parse(
        "<details>\n  <summary>Title</summary>\n  Line 1\n  Line 2\n</details>",
      );
      const block = doc.$lines[0] as MarkdownDetailsBlock;
      expect(block.$lines.length).toBe(2);
    });

    it("should parse details without summary content", () => {
      const input = "<details>\n  <summary></summary>\n  Content\n</details>";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse details with inline formatting in summary", () => {
      const input =
        "<details>\n  <summary>Click **here**</summary>\n  Content\n</details>";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse details with markdown content", () => {
      const input =
        "<details>\n  <summary>Title</summary>\n  **bold** text\n  - list item\n</details>";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse details with multi-line content", () => {
      const input =
        "<details>\n  <summary>Title</summary>\n  Line 1\n  Line 2\n  Line 3\n</details>";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should parse details with surrounding content", () => {
      const input =
        "before\n<details>\n  <summary>Title</summary>\n  Content\n</details>\nafter";
      const doc = b.parse(input);
      expect(String(doc)).toBe(input);
    });

    it("should show summary and content as distinct trees in inspect", () => {
      const doc = b.parse(
        "<details>\n  <summary>Click me</summary>\n  Content here\n</details>",
      );
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownDetailsBlock");
      expect(tree).toContain("summary");
      expect(tree).toContain('"Click me"');
      expect(tree).toContain("content");
      expect(tree).toContain('"Content here"');
    });

    it("should show only content in inspect when summary is empty", () => {
      const doc = b.parse(
        "<details>\n  <summary></summary>\n  Content\n</details>",
      );
      const tree = b.inspect(doc);
      expect(tree).not.toContain("├── summary");
      expect(tree).toContain("content");
    });

    it("should round-trip a details block", () => {
      const input =
        "<details>\n  <summary>Click me</summary>\n  Some content\n</details>";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip details with multi-line content", () => {
      const input =
        "<details>\n  <summary>Title</summary>\n  Line 1\n  Line 2\n</details>";
      expect(String(b.parse(input))).toBe(input);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Section nesting
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

    it("should round-trip inline math", () => {
      const input = "the formula $E=mc^2$ is famous";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip block math", () => {
      const input = "$$\na + b\nc + d\n$$";
      expect(String(b.parse(input))).toBe(input);
    });

    it("should round-trip math mixed with other formatting", () => {
      const input = "**bold** and $x^2$ and *italic*";
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
