import { describe, it, expect } from "vitest";
import {
  b,
  MarkdownBlockquoteBlock,
  MarkdownBoldBlock,
  MarkdownCodeBlock,
  MarkdownCommentBlock,
  MarkdownDetailsBlock,
  MarkdownEmojiBlock,
  MarkdownHeadingBlock,
  MarkdownHighlightBlock,
  MarkdownHorizontalRuleBlock,
  MarkdownImageBlock,
  MarkdownItalicBlock,
  MarkdownLinkBlock,
  MarkdownListBlock,
  MarkdownMathBlock,
  MarkdownParagraphBlock,
  MarkdownSectionBlock,
  MarkdownStrikethroughBlock,
  MarkdownSubscriptBlock,
  MarkdownSuperscriptBlock,
  MarkdownTableBlock,
  MarkdownTaskItemBlock,
  MarkdownUnderlineBlock,
  MarkdownUnorderedListItemBlock,
  MarkdownOrderedListItemBlock,
} from "../index";

describe("MarkdownLiteral", () => {
  it("should create a literal from a tagged template with no interpolations", () => {
    const literal = b.md`hello world`;
    expect(String(literal)).toBe("hello world");
  });

  it("should return null for an empty literal", () => {
    const literal = b.md``;
    expect(literal.render()).toBeNull();
  });

  it("should interpolate a string value", () => {
    const name = "world";
    const literal = b.md`hello ${name}`;
    expect(String(literal)).toBe("hello world");
  });

  it("should interpolate a bold block", () => {
    const literal = b.md`hello ${b.bold("world")}`;
    expect(String(literal)).toBe("hello **world**");
  });

  it("should interpolate an italic block", () => {
    const literal = b.md`this is ${b.italic("emphasized")} text`;
    expect(String(literal)).toBe("this is *emphasized* text");
  });

  it("should interpolate nested inline blocks", () => {
    const literal = b.md`check ${b.bold("bold ", b.italic("and italic"))} out`;
    expect(String(literal)).toBe("check **bold *and italic*** out");
  });

  it("should handle multiple interpolations", () => {
    const literal = b.md`${b.bold("hello")} and ${b.italic("world")}`;
    expect(String(literal)).toBe("**hello** and *world*");
  });

  it("should be coercible via String()", () => {
    const literal = b.md`simple text`;
    expect(String(literal)).toBe("simple text");
  });

  it("should be coercible via template literal", () => {
    const literal = b.md`simple text`;
    expect(`${literal}`).toBe("simple text");
  });

  it("should interpolate a strikethrough block", () => {
    const literal = b.md`this is ${b.strike("deleted")} text`;
    expect(String(literal)).toBe("this is ~~deleted~~ text");
  });

  it("should interpolate a link block", () => {
    const literal = b.md`visit ${b.url("https://example.com", "here")}`;
    expect(String(literal)).toBe("visit [here](https://example.com)");
  });

  it("should interpolate a code inline block", () => {
    const literal = b.md`use ${b.code("console.log")} for debugging`;
    expect(String(literal)).toBe("use `console.log` for debugging");
  });

  it("should interpolate a highlight block", () => {
    const literal = b.md`this is ${b.highlight("important")} info`;
    expect(String(literal)).toBe("this is ==important== info");
  });

  it("should interpolate an emoji block", () => {
    const literal = b.md`hello ${b.emoji("wave")} there`;
    expect(String(literal)).toBe("hello :wave: there");
  });

  it("should handle many interpolations in sequence", () => {
    const literal = b.md`${b.bold("a")}${b.italic("b")}${b.strike("c")}`;
    expect(String(literal)).toBe("**a***b*~~c~~");
  });

  it("should handle interpolation at the start", () => {
    const literal = b.md`${b.bold("start")} of text`;
    expect(String(literal)).toBe("**start** of text");
  });

  it("should handle interpolation at the end", () => {
    const literal = b.md`end of ${b.bold("text")}`;
    expect(String(literal)).toBe("end of **text**");
  });

  it("should be usable via b.markdown alias", () => {
    const literal = b.markdown`hello ${b.bold("world")}`;
    expect(String(literal)).toBe("hello **world**");
  });

  it("should accept paragraph blocks as interpolation values", () => {
    const literal = b.md`before ${b.para("paragraph content")} after`;
    expect(String(literal)).toBe("before paragraph content after");
  });

  it("should return null when all interpolated content is empty", () => {
    const empty = b.bold().emptyIf(false);
    const literal = b.md`${empty}`;
    expect(literal.render()).toBeNull();
  });

  it("should interpolate a deeply nested block", () => {
    const literal = b.md`text ${b.bold(b.italic(b.strike("deep")))} end`;
    expect(String(literal)).toBe("text ***~~deep~~*** end");
  });

  it("should interpolate a deeply nested block with explicit underscore italic style", () => {
    const literal = b.md`text ${b.bold(b.italic("nested").style("_"))} end`;
    expect(String(literal)).toBe("text **_nested_** end");
  });

  it("should work with number interpolations", () => {
    const literal = b.md`count: ${42}`;
    expect(String(literal)).toBe("count: 42");
  });

  it("should parse a document that contains no blocks", () => {
    const literal = b.md`
    # Heading 1
    Hey, here's some Q's for you:

    | Table | Header 2 |
    | --- | --- |
    | Row 1 | Row 2 |
    - List item 1
    - List item 2
    ## Header 2
    > Blockquote
    > Paragraph text
    > > **bold** and *italic*
    > [link](https://example.com)
    > ==highlighted==
    > ~sub~
    ### Header 3
    - [ ] Task item 1
    ## Header 2-2
    - [x] Task item 2-1
      - [ ] Task item 2-2
      - [x] Task item 2-3
    ### Header 3-1
    - [ ] Task item 3-1
    - [x] Task item 3-2
    #### Header 4
  
    - [ ] Task item 3-3
    `.parse();
    // console.log(String(literal));
  });

  it("should trim interpolated content correctly", () => {
    const literal = b.md`
    This is some text
    And this is some more text
    ${b.code("Hello world", "hi")}
    ${b.list.ol("Item A", b.list.ul("Item B", "Item C"))}
    `;
    expect(String(literal)).toBe(
      "This is some text\nAnd this is some more text\n```hi\nHello world\nhi\n```\n- Item A\n  - Item B\n  - Item C",
    );
  });

  it("should embed into details correctly", () => {
    const literal = b.md`
    This is some text
    And this is some more text
    ${b.code("Hello world", "hi")}
    ${b.list.ol("Item A", b.list.ul("Item B", "Item C"))}
    `.details("summary");
    expect(String(literal)).toBe(
      "<details>\n  <summary>summary</summary>\n  This is some text\n  And this is some more text\n  ```hi\n  Hello world\n  hi\n  ```\n  - Item A\n    - Item B\n    - Item C\n</details>",
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS: literal .parse() for every block type, nesting, and
// structural inspection
// ══════════════════════════════════════════════════════════════════════════════
describe("literal parse integration", () => {
  // ────────────────────────────────────────────────────────────────────────────
  // 1. Every block type parses correctly through b.md`...`.parse()
  // ────────────────────────────────────────────────────────────────────────────
  describe("every block type", () => {
    it("should parse headings at all levels", () => {
      const doc = b.md`
      # Heading 1
      ## Heading 2
      ### Heading 3
      #### Heading 4
      ##### Heading 5
      ###### Heading 6
      `.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHeadingBlock");
      const headingCount = (tree.match(/MarkdownHeadingBlock/g) || []).length;
      expect(headingCount).toBe(6);
      expect(String(doc)).toContain("# Heading 1");
      expect(String(doc)).toContain("###### Heading 6");
    });

    it("should parse heading with custom ID", () => {
      const doc = b.md`
      # My Title {#custom-id}
      `.parse();
      expect(String(doc)).toBe("# My Title {#custom-id}");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHeadingBlock");
      expect(tree).toContain("identifier=custom-id");
    });

    it("should parse bold with both styles", () => {
      const doc = b.md`
      **asterisk bold** and __underscore bold__
      `.parse();
      expect(String(doc)).toBe("**asterisk bold** and __underscore bold__");
      const tree = b.inspect(doc);
      const boldCount = (tree.match(/MarkdownBoldBlock/g) || []).length;
      expect(boldCount).toBe(2);
    });

    it("should parse italic with both styles", () => {
      const doc = b.md`
      *asterisk italic* and _underscore italic_
      `.parse();
      expect(String(doc)).toBe("*asterisk italic* and _underscore italic_");
      const tree = b.inspect(doc);
      const italicCount = (tree.match(/MarkdownItalicBlock/g) || []).length;
      expect(italicCount).toBe(2);
    });

    it("should parse strikethrough", () => {
      const doc = b.md`~~deleted text~~`.parse();
      expect(String(doc)).toBe("~~deleted text~~");
      const para = doc.$lines[0] as MarkdownParagraphBlock;
      expect(para.$content[0]).toBeInstanceOf(MarkdownStrikethroughBlock);
    });

    it("should parse highlight", () => {
      const doc = b.md`==important text==`.parse();
      expect(String(doc)).toBe("==important text==");
      const para = doc.$lines[0] as MarkdownParagraphBlock;
      expect(para.$content[0]).toBeInstanceOf(MarkdownHighlightBlock);
    });

    it("should parse subscript", () => {
      const doc = b.md`H~2~O`.parse();
      expect(String(doc)).toBe("H~2~O");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownSubscriptBlock");
    });

    it("should parse superscript", () => {
      const doc = b.md`x^2^`.parse();
      expect(String(doc)).toBe("x^2^");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownSuperscriptBlock");
    });

    it("should parse inline code", () => {
      const doc = b.md`use \`console.log\` here`.parse();
      expect(String(doc)).toBe("use `console.log` here");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownCodeBlock");
    });

    it("should parse fenced code blocks with language", () => {
      const doc = b.md`
      ${"```js"}
      const x = 42;
      ${"```"}
      `.parse();
      expect(String(doc)).toBe("```js\nconst x = 42;\n```");
      const block = doc.$lines[0];
      expect(block).toBeInstanceOf(MarkdownCodeBlock);
      const tree = b.inspect(doc);
      expect(tree).toContain("language=js");
    });

    it("should parse standard links", () => {
      const doc = b.md`[click here](https://example.com)`.parse();
      expect(String(doc)).toBe("[click here](https://example.com)");
      const para = doc.$lines[0] as MarkdownParagraphBlock;
      const link = para.$content[0] as MarkdownLinkBlock;
      expect(link).toBeInstanceOf(MarkdownLinkBlock);
      expect(link.$url).toBe("https://example.com");
    });

    it("should parse auto-links", () => {
      const doc = b.md`visit <https://example.com> now`.parse();
      expect(String(doc)).toBe("visit <https://example.com> now");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("url=https://example.com");
    });

    it("should parse HTML links with target", () => {
      const doc =
        b.md`<a href="https://example.com" target="_blank">Example</a>`.parse();
      expect(String(doc)).toBe(
        '<a href="https://example.com" target="_blank">Example</a>',
      );
      const para = doc.$lines[0] as MarkdownParagraphBlock;
      const link = para.$content[0] as MarkdownLinkBlock;
      expect(link.$target).toBe("_blank");
      expect(link.$url).toBe("https://example.com");
    });

    it("should parse images", () => {
      const doc = b.md`![alt text](image.png)`.parse();
      expect(String(doc)).toBe("![alt text](image.png)");
      const para = doc.$lines[0] as MarkdownParagraphBlock;
      const img = para.$content[0] as MarkdownImageBlock;
      expect(img).toBeInstanceOf(MarkdownImageBlock);
      expect(img.$src).toBe("image.png");
    });

    it("should parse figures with captions", () => {
      const doc = b.md`
      <figure>
        <img src="photo.png" alt="A photo">
        <figcaption>A caption</figcaption>
      </figure>
      `.parse();
      const img = doc.$lines[0] as MarkdownImageBlock;
      expect(img).toBeInstanceOf(MarkdownImageBlock);
      expect(img.$src).toBe("photo.png");
      expect(img.$caption).toBeTruthy();
      const tree = b.inspect(doc);
      expect(tree).toContain("alt");
      expect(tree).toContain("caption");
    });

    it("should parse blockquotes", () => {
      const doc = b.md`
      > quoted line 1
      > quoted line 2
      `.parse();
      expect(String(doc)).toBe("> quoted line 1\n> quoted line 2");
      const bq = doc.$lines[0];
      expect(bq).toBeInstanceOf(MarkdownBlockquoteBlock);
    });

    it("should parse blockquotes with GitHub alerts", () => {
      const doc = b.md`
      > [!WARNING]
      > This is a warning
      `.parse();
      expect(String(doc)).toBe("> [!WARNING]\n> This is a warning");
      const bq = doc.$lines[0] as MarkdownBlockquoteBlock;
      expect(bq).toBeInstanceOf(MarkdownBlockquoteBlock);
      expect(bq.$alert).toBe("warning");
      const tree = b.inspect(doc);
      expect(tree).toContain("alert=warning");
    });

    it("should parse unordered lists", () => {
      const doc = b.md`
      - Item 1
      - Item 2
      - Item 3
      `.parse();
      expect(String(doc)).toBe("- Item 1\n- Item 2\n- Item 3");
      const list = doc.$lines[0] as MarkdownListBlock;
      expect(list).toBeInstanceOf(MarkdownListBlock);
      expect(list.$lines.length).toBe(3);
    });

    it("should parse ordered lists", () => {
      const doc = b.md`
      1. First
      2. Second
      3. Third
      `.parse();
      expect(String(doc)).toBe("1. First\n2. Second\n3. Third");
      const list = doc.$lines[0] as MarkdownListBlock;
      expect(list.$lines[0]).toBeInstanceOf(MarkdownOrderedListItemBlock);
    });

    it("should parse task lists", () => {
      const doc = b.md`
      - [x] Done
      - [ ] Not done
      - [X] Also done
      `.parse();
      expect(String(doc)).toBe("- [x] Done\n- [ ] Not done\n- [X] Also done");
      const list = doc.$lines[0] as MarkdownListBlock;
      expect(list.$lines[0]).toBeInstanceOf(MarkdownTaskItemBlock);
    });

    it("should parse tables", () => {
      const doc = b.md`
      | Name | Age |
      | --- | --- |
      | Alice | 30 |
      `.parse();
      const table = doc.$lines[0];
      expect(table).toBeInstanceOf(MarkdownTableBlock);
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownTableBlock");
      expect(tree).toContain("columns");
      expect(tree).toContain("rows");
    });

    it("should parse tables with alignment", () => {
      const doc = b.md`
      | Left | Center | Right |
      | :--- | :---: | ---: |
      | a | b | c |
      `.parse();
      const table = doc.$lines[0] as MarkdownTableBlock<
        "Left" | "Center" | "Right"
      >;
      expect(table).toBeInstanceOf(MarkdownTableBlock);
      const result = String(doc);
      expect(result).toContain(":---");
      expect(result).toContain(":---:");
      expect(result).toContain("---:");
    });

    it("should parse footnotes", () => {
      const doc = b.md`
      Some text[^1]

      [^1]: footnote content
      `.parse();
      expect(String(doc)).toBe("Some text[^1]\n\n[^1]: footnote content");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownFootnoteBlock");
    });

    it("should parse emoji shortcodes", () => {
      const doc = b.md`hello :wave: world`.parse();
      expect(String(doc)).toBe("hello :wave: world");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownEmojiBlock");
    });

    it("should parse horizontal rules", () => {
      const doc = b.md`
      before

      ---

      after
      `.parse();
      expect(String(doc)).toBe("before\n\n---\n\nafter");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHorizontalRuleBlock");
    });

    it("should parse inline math", () => {
      const doc = b.md`the formula $E=mc^2$ is famous`.parse();
      expect(String(doc)).toBe("the formula $E=mc^2$ is famous");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownMathBlock");
    });

    it("should parse block math", () => {
      const doc = b.md`
      $$
      a + b
      c + d
      $$
      `.parse();
      expect(String(doc)).toBe("$$\na + b\nc + d\n$$");
      const block = doc.$lines[0];
      expect(block).toBeInstanceOf(MarkdownMathBlock);
    });

    it("should parse comments", () => {
      const doc = b.md`[hidden note]: #`.parse();
      expect(String(doc)).toBe("[hidden note]: #");
      const block = doc.$lines[0];
      expect(block).toBeInstanceOf(MarkdownCommentBlock);
      expect((block as MarkdownCommentBlock).$content).toEqual(["hidden note"]);
    });

    it("should parse underlines", () => {
      const doc = b.md`<ins>underlined text</ins>`.parse();
      expect(String(doc)).toBe("<ins>underlined text</ins>");
      const para = doc.$lines[0] as MarkdownParagraphBlock;
      expect(para.$content[0]).toBeInstanceOf(MarkdownUnderlineBlock);
    });

    it("should parse details blocks", () => {
      const doc = b.md`
      <details>
        <summary>Click me</summary>
        Some content
      </details>
      `.parse();
      expect(String(doc)).toBe(
        "<details>\n  <summary>Click me</summary>\n  Some content\n</details>",
      );
      const block = doc.$lines[0] as MarkdownDetailsBlock;
      expect(block).toBeInstanceOf(MarkdownDetailsBlock);
      expect(block.$summary).toEqual(["Click me"]);
      const tree = b.inspect(doc);
      expect(tree).toContain("summary");
      expect(tree).toContain("content");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 2. Nested blocks: each block type nested within other blocks
  // ────────────────────────────────────────────────────────────────────────────
  describe("nested blocks", () => {
    it("should parse bold inside italic inside strikethrough", () => {
      const doc = b.md`~~*__deep nesting__*~~`.parse();
      expect(String(doc)).toBe("~~*__deep nesting__*~~");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownStrikethroughBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownBoldBlock");
    });

    it("should parse inline formatting inside headings", () => {
      const doc = b.md`
      # **Bold** heading with *italic* and \`code\`
      `.parse();
      expect(String(doc)).toBe("# **Bold** heading with *italic* and `code`");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHeadingBlock");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownCodeBlock");
    });

    it("should parse inline formatting inside blockquotes", () => {
      const doc = b.md`
      > **bold** and *italic* and ~~strike~~ and ==highlight==
      `.parse();
      expect(String(doc)).toBe(
        "> **bold** and *italic* and ~~strike~~ and ==highlight==",
      );
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
      expect(tree).toContain("MarkdownHighlightBlock");
    });

    it("should parse nested blockquotes with formatting at each level", () => {
      const doc = b.md`
      > outer **bold**
      >> inner *italic*
      >>> deep ~~strike~~
      `.parse();
      const output = String(doc);
      expect(output).toContain("> outer **bold**");
      expect(output).toContain(">> inner *italic*");
      expect(output).toContain(">>> deep ~~strike~~");
    });

    it("should parse links with formatted text inside", () => {
      const doc =
        b.md`[**bold link** with *italic*](https://example.com)`.parse();
      expect(String(doc)).toBe(
        "[**bold link** with *italic*](https://example.com)",
      );
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
    });

    it("should parse formatting inside list items", () => {
      const doc = b.md`
      - **bold item**
      - *italic item*
      - ~~struck item~~
      - ==highlighted item==
      - [linked item](url)
      `.parse();
      const output = String(doc);
      expect(output).toBe(
        "- **bold item**\n- *italic item*\n- ~~struck item~~\n- ==highlighted item==\n- [linked item](url)",
      );
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
      expect(tree).toContain("MarkdownHighlightBlock");
      expect(tree).toContain("MarkdownLinkBlock");
    });

    it("should parse nested lists with mixed types", () => {
      const doc = b.md`
      - Unordered
        1. Ordered nested
        2. Ordered nested 2
          - [x] Task nested
          - [ ] Another task
      `.parse();
      const output = String(doc);
      expect(output).toContain("- Unordered");
      expect(output).toContain("1. Ordered nested");
      expect(output).toContain("- [x] Task nested");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownUnorderedListItemBlock");
      expect(tree).toContain("MarkdownOrderedListItemBlock");
      expect(tree).toContain("MarkdownTaskItemBlock");
    });

    it("should parse inline formatting in table cells", () => {
      const doc = b.md`
      | Feature | Status |
      | --- | --- |
      | **Important** | *pending* |
      | ~~removed~~ | ==done== |
      `.parse();
      const table = doc.$lines[0] as MarkdownTableBlock<"Feature" | "Status">;
      expect(table).toBeInstanceOf(MarkdownTableBlock);
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
      expect(tree).toContain("MarkdownHighlightBlock");
    });

    it("should parse formatting inside details summary and content", () => {
      const doc = b.md`
      <details>
        <summary>Click **here** for *details*</summary>
        **Bold content** with [a link](url)
      </details>
      `.parse();
      const details = doc.$lines[0] as MarkdownDetailsBlock;
      expect(details).toBeInstanceOf(MarkdownDetailsBlock);
      const tree = b.inspect(doc);
      expect(tree).toContain("summary");
      expect(tree).toContain("content");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownLinkBlock");
    });

    it("should parse inline formatting inside image alt text", () => {
      const doc = b.md`![**bold alt** text](image.png)`.parse();
      expect(String(doc)).toBe("![**bold alt** text](image.png)");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownImageBlock");
      expect(tree).toContain("MarkdownBoldBlock");
    });

    it("should parse headings inside sections with content under each", () => {
      const doc = b.md`
      # Top Level
      Intro text
      ## Section A
      Content under A
      ### Sub-section A1
      Deep content
      ## Section B
      Content under B
      `.parse();
      const output = String(doc);
      expect(output).toContain("# Top Level");
      expect(output).toContain("## Section A");
      expect(output).toContain("### Sub-section A1");
      expect(output).toContain("## Section B");
      const tree = b.inspect(doc);
      const sectionCount = (tree.match(/MarkdownSectionBlock/g) || []).length;
      expect(sectionCount).toBeGreaterThanOrEqual(3);
    });

    it("should parse blockquote containing a list", () => {
      const doc = b.md`
      > - Item 1
      > - Item 2
      > - Item 3
      `.parse();
      expect(String(doc)).toBe("> - Item 1\n> - Item 2\n> - Item 3");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("MarkdownListBlock");
    });

    it("should parse blockquote containing code block", () => {
      const doc = b.md`
      > ${"```js"}
      > const x = 1;
      > ${"```"}
      `.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("MarkdownCodeBlock");
    });

    it("should parse alert blockquote with formatted content", () => {
      const doc = b.md`
      > [!NOTE]
      > This is **important** with a [link](url)
      `.parse();
      const bq = doc.$lines[0] as MarkdownBlockquoteBlock;
      expect(bq.$alert).toBe("note");
      const tree = b.inspect(doc);
      expect(tree).toContain("alert=note");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownLinkBlock");
    });

    it("should parse math inside a paragraph with other inline blocks", () => {
      const doc =
        b.md`The equation $E=mc^2$ is **famous** and :star: worthy`.parse();
      expect(String(doc)).toBe(
        "The equation $E=mc^2$ is **famous** and :star: worthy",
      );
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownMathBlock");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownEmojiBlock");
    });

    it("should parse underline with nested bold and italic", () => {
      const doc = b.md`<ins>**bold** and *italic* underlined</ins>`.parse();
      expect(String(doc)).toBe("<ins>**bold** and *italic* underlined</ins>");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownUnderlineBlock");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
    });

    it("should parse figure caption with inline formatting", () => {
      const doc = b.md`
      <figure>
        <img src="photo.png" alt="**bold alt**">
        <figcaption>Taken in **Paris** by *someone*</figcaption>
      </figure>
      `.parse();
      const img = doc.$lines[0] as MarkdownImageBlock;
      expect(img).toBeInstanceOf(MarkdownImageBlock);
      expect(img.$caption).toBeTruthy();
      const tree = b.inspect(doc);
      expect(tree).toContain("alt");
      expect(tree).toContain("caption");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
    });

    it("should parse details with list and code inside", () => {
      const doc = b.md`
      <details>
        <summary>Show code</summary>
        - Step 1
        - Step 2
        ${"```js"}
        console.log("hi");
        ${"```"}
      </details>
      `.parse();
      const details = doc.$lines[0] as MarkdownDetailsBlock;
      expect(details).toBeInstanceOf(MarkdownDetailsBlock);
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownDetailsBlock");
      expect(tree).toContain("MarkdownListBlock");
      expect(tree).toContain("MarkdownCodeBlock");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 3. Awkward/unusual indentation and style robustness
  // ────────────────────────────────────────────────────────────────────────────
  describe("indentation and style robustness", () => {
    it("should handle extra indentation in template literals", () => {
      const doc = b.md`
              # Deeply indented heading
              Some text here
              - List item
      `.parse();
      expect(String(doc)).toContain("# Deeply indented heading");
      expect(String(doc)).toContain("Some text here");
      expect(String(doc)).toContain("- List item");
    });

    it("should handle mixed block types with uneven spacing", () => {
      const doc = b.md`
      # Title
      Text right after heading
      > Quote right after text


      Text after double blank
      `.parse();
      const output = String(doc);
      expect(output).toContain("# Title");
      expect(output).toContain("Text right after heading");
      expect(output).toContain("> Quote right after text");
      expect(output).toContain("Text after double blank");
    });

    it("should handle inconsistent list marker styles in sequence", () => {
      // Each list group uses a different marker style
      const doc = b.md`
      - Dash item
      * Star item
      + Plus item
      `.parse();
      const output = String(doc);
      // The parser treats each as its own list group since styles differ
      expect(output).toContain("- Dash item");
      expect(output).toContain("* Star item");
      expect(output).toContain("+ Plus item");
    });

    it("should handle table with variable spacing in cells", () => {
      const doc = b.md`
      |  Name  |  Age  |
      | --- | --- |
      | Alice | 30 |
      `.parse();
      const table = doc.$lines[0];
      expect(table).toBeInstanceOf(MarkdownTableBlock);
      const output = String(doc);
      expect(output).toContain("Name");
      expect(output).toContain("Age");
      expect(output).toContain("Alice");
    });

    it("should handle blockquote with inconsistent spacing after >", () => {
      const doc = b.md`
      >no space
      > one space
      >  two spaces
      `.parse();
      const bq = doc.$lines[0];
      expect(bq).toBeInstanceOf(MarkdownBlockquoteBlock);
    });

    it("should handle code blocks with no trailing newline before fence close", () => {
      const doc = b.md`
      ${"```"}
      single line
      ${"```"}
      `.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownCodeBlock");
    });

    it("should handle horizontal rules with varying lengths", () => {
      const doc = b.md`
      before

      ----------------

      middle

      ***

      after
      `.parse();
      const tree = b.inspect(doc);
      const hrCount = (tree.match(/MarkdownHorizontalRuleBlock/g) || []).length;
      expect(hrCount).toBe(2);
    });

    it("should handle heading levels that skip (e.g., h1 to h3)", () => {
      const doc = b.md`
      # Level 1
      ### Skipped to 3
      Content
      `.parse();
      expect(String(doc)).toContain("# Level 1");
      expect(String(doc)).toContain("### Skipped to 3");
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownSectionBlock");
    });

    it("should handle all alert types case-insensitively", () => {
      for (const type of ["note", "tip", "important", "warning", "caution"]) {
        const doc = b.md`
        > [!${type.toUpperCase()}]
        > content
        `.parse();
        const bq = doc.$lines[0] as MarkdownBlockquoteBlock;
        expect(bq.$alert).toBe(type);
      }
    });

    it("should handle long horizontal rule styles consistently", () => {
      const doc = b.md`
      before

      --------

      middle

      ********

      after
      `.parse();
      const output = String(doc);
      expect(output).toContain("--------");
      expect(output).toContain("********");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 4. Structural inspection: verify documents contain the correct blocks
  //    with the correct configuration, not just round-trip equality
  // ────────────────────────────────────────────────────────────────────────────
  describe("structural inspection", () => {
    it("should produce correct section hierarchy for a complex document", () => {
      const doc = b.md`
      # Main Title
      Intro paragraph
      ## Section A
      Content A with **bold** and *italic*
      ### Subsection A1
      Deep content with [link](url)
      ### Subsection A2
      More deep content
      ## Section B
      Content B with \`code\` and ~~strike~~
      # Second Title
      Final content
      `.parse();

      const tree = b.inspect(doc);
      // Verify all heading blocks exist
      const headingCount = (tree.match(/MarkdownHeadingBlock/g) || []).length;
      expect(headingCount).toBe(6);
      // Verify sections were created for nested headings
      const sectionCount = (tree.match(/MarkdownSectionBlock/g) || []).length;
      expect(sectionCount).toBeGreaterThanOrEqual(4);
      // Verify inline formatting was preserved
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("MarkdownCodeBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
      // Verify round-trip
      const output = String(doc);
      expect(output).toContain("# Main Title");
      expect(output).toContain("## Section A");
      expect(output).toContain("### Subsection A1");
      expect(output).toContain("# Second Title");
    });

    it("should inspect correctly for a document with every inline block type", () => {
      const doc =
        b.md`**bold** *italic* ~~strike~~ ==highlight== ~sub~ ^sup^ \`code\` $math$ :star: <ins>underlined</ins> [link](url) ![img](src)`.parse();

      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
      expect(tree).toContain("MarkdownHighlightBlock");
      expect(tree).toContain("MarkdownSubscriptBlock");
      expect(tree).toContain("MarkdownSuperscriptBlock");
      expect(tree).toContain("MarkdownCodeBlock");
      expect(tree).toContain("MarkdownMathBlock");
      expect(tree).toContain("MarkdownEmojiBlock");
      expect(tree).toContain("MarkdownUnderlineBlock");
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("MarkdownImageBlock");
    });

    it("should inspect correctly for a document with every block-level type", () => {
      const doc = b.md`
      # Heading
      Plain paragraph
      > Blockquote
      - List item
      1. Ordered item
      - [x] Task item
      | Col |
      | --- |
      | data |
      ${"```js"}
      code
      ${"```"}
      $$
      math
      $$

      ---

      [comment]: #
      <ins>underline</ins>
      <details>
        <summary>Title</summary>
        Content
      </details>
      `.parse();

      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHeadingBlock");
      expect(tree).toContain("MarkdownParagraphBlock");
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("MarkdownListBlock");
      expect(tree).toContain("MarkdownUnorderedListItemBlock");
      expect(tree).toContain("MarkdownOrderedListItemBlock");
      expect(tree).toContain("MarkdownTaskItemBlock");
      expect(tree).toContain("MarkdownTableBlock");
      expect(tree).toContain("MarkdownCodeBlock");
      expect(tree).toContain("MarkdownMathBlock");
      expect(tree).toContain("MarkdownHorizontalRuleBlock");
      expect(tree).toContain("MarkdownCommentBlock");
      expect(tree).toContain("MarkdownUnderlineBlock");
      expect(tree).toContain("MarkdownDetailsBlock");
    });

    it("should produce correct metadata tags in inspect for configured blocks", () => {
      const doc = b.md`
      ${"```typescript"}
      const x = 42;
      ${"```"}
      ![alt text](my-image.png)
      [link text](https://example.com)
      # Heading {#my-id}
      `.parse();

      const tree = b.inspect(doc);
      expect(tree).toContain("language=typescript");
      expect(tree).toContain("src=my-image.png");
      expect(tree).toContain("url=https://example.com");
      expect(tree).toContain("identifier=my-id");
    });

    it("should produce correct metadata for HTML link with target", () => {
      const doc =
        b.md`<a href="https://example.com" target="_blank">click</a>`.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("url=https://example.com");
      expect(tree).toContain("target=_blank");
    });

    it("should produce correct inspect tree for a captioned image", () => {
      const doc = b.md`
      <figure>
        <img src="sunset.jpg" alt="A sunset">
        <figcaption>Photo by **John**</figcaption>
      </figure>
      `.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownImageBlock");
      expect(tree).toContain("src=sunset.jpg");
      expect(tree).toContain("alt");
      expect(tree).toContain('"A sunset"');
      expect(tree).toContain("caption");
      expect(tree).toContain("MarkdownBoldBlock");
    });

    it("should produce correct inspect tree for a details block", () => {
      const doc = b.md`
      <details>
        <summary>**Bold summary** with *italic*</summary>
        Content with [a link](url)
        - And a list
      </details>
      `.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownDetailsBlock");
      expect(tree).toContain("summary");
      expect(tree).toContain("content");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("MarkdownListBlock");
    });

    it("should produce correct inspect tree for a table with formatting", () => {
      const doc = b.md`
      | Item | Status |
      | --- | --- |
      | **Critical** | ~~resolved~~ |
      `.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownTableBlock");
      expect(tree).toContain("columns");
      expect(tree).toContain("rows");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
    });

    it("should produce correct inspect tree for alert blockquote", () => {
      const doc = b.md`
      > [!IMPORTANT]
      > **Read this** before proceeding
      `.parse();
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("alert=important");
      expect(tree).toContain("MarkdownBoldBlock");
    });

    it("should verify structural properties of a deeply nested document", () => {
      const doc = b.md`
      # Report
      ## Overview
      The equation $E=mc^2$ is **important**.
      ### Details
      > [!NOTE]
      > See [docs](url) for more info
      - Item with **emphasis**
        - Nested with *italic*
          - Deep with ~~removed~~
      ## Data
      | Metric | Value |
      | --- | --- |
      | Score | **100** |
      [internal note]: #
      `.parse();

      // Verify document structure
      const tree = b.inspect(doc);

      // Top-level blocks
      expect(tree).toContain("MarkdownHeadingBlock");
      expect(tree).toContain("MarkdownSectionBlock");

      // Inline formatting preserved in context
      expect(tree).toContain("MarkdownMathBlock");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");

      // Block types
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("alert=note");
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("MarkdownListBlock");
      expect(tree).toContain("MarkdownTableBlock");
      expect(tree).toContain("MarkdownCommentBlock");

      // Section hierarchy: ## creates sections under #
      const sectionCount = (tree.match(/MarkdownSectionBlock/g) || []).length;
      expect(sectionCount).toBeGreaterThanOrEqual(3);

      // Round-trip the whole document
      const output = String(doc);
      expect(output).toContain("# Report");
      expect(output).toContain("## Overview");
      expect(output).toContain("### Details");
      expect(output).toContain("## Data");
      expect(output).toContain("[internal note]: #");
    });

    it("should verify direct structural access on parsed blocks", () => {
      const doc = b.md`
      # Title
      **bold text** with *italic*
      > [!TIP]
      > Be helpful
      - [x] Done task
      [hidden]: #
      `.parse();

      // First line should be the heading
      const heading = doc.$lines[0];
      expect(heading).toBeInstanceOf(MarkdownHeadingBlock);

      // Second line (in a section) — need to navigate section hierarchy
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");

      // Alert blockquote
      expect(tree).toContain("alert=tip");

      // Task list
      expect(tree).toContain("MarkdownTaskItemBlock");

      // Comment
      expect(tree).toContain("MarkdownCommentBlock");
    });

    it("should round-trip AND structurally verify a kitchen-sink document", () => {
      const input = [
        "# Kitchen Sink",
        "**bold** *italic* ~~strike~~ ==highlight== ~sub~ ^sup^",
        "use `inline code` and $inline math$",
        "<ins>underlined</ins> and :wave:",
        "[link](url) and ![image](src)",
        "",
        "---",
        "",
        "## Lists",
        "- Unordered",
        "  - Nested",
        "1. Ordered",
        "- [x] Task done",
        "- [ ] Task todo",
        "## Quotes",
        "> [!WARNING]",
        "> Be careful",
        "## Code",
        "```js",
        "const x = 1;",
        "```",
        "## Math",
        "$$",
        "a + b",
        "c + d",
        "$$",
        "[hidden note]: #",
      ].join("\n");

      const doc = b.parse(input);

      // Round-trip
      expect(String(doc)).toBe(input);

      // Structural verification
      const tree = b.inspect(doc);
      expect(tree).toContain("MarkdownHeadingBlock");
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
      expect(tree).toContain("MarkdownHighlightBlock");
      expect(tree).toContain("MarkdownSubscriptBlock");
      expect(tree).toContain("MarkdownSuperscriptBlock");
      expect(tree).toContain("MarkdownCodeBlock");
      expect(tree).toContain("MarkdownMathBlock");
      expect(tree).toContain("MarkdownUnderlineBlock");
      expect(tree).toContain("MarkdownEmojiBlock");
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("MarkdownImageBlock");
      expect(tree).toContain("MarkdownHorizontalRuleBlock");
      expect(tree).toContain("MarkdownListBlock");
      expect(tree).toContain("MarkdownTaskItemBlock");
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("alert=warning");
      expect(tree).toContain("language=js");
      expect(tree).toContain("MarkdownCommentBlock");
      expect(tree).toContain("MarkdownSectionBlock");
    });

    it("should parse, round-trip, and structurally verify a large literal containing every block type", () => {
      const doc = b.md`
      # Project Documentation {#project-docs}
      Welcome to the **project docs**. This covers *everything* you need to know.
      Use \`npm install\` to get started, or visit <https://docs.example.com>.

      ## Getting Started
      The formula for success is $E=mc^2$, and don't forget H~2~O is water^1^.
      Here's a ==critical== note: ~~don't skip this~~ — read it with <ins>attention</ins>.

      Check out [the guide](https://guide.example.com) or open in a new tab:
      <a href="https://external.example.com" target="_blank">External Docs</a>

      ![Project logo](logo.png)

      > [!IMPORTANT]
      > This project requires **Node 18+** with *strict mode* enabled.
      > See [requirements](https://reqs.example.com) for details.

      > [!TIP]
      > Use \`--verbose\` for debugging :bulb:

      ### Installation
      - Clone the repo
      - Run \`npm install\`
        - This installs all dependencies
          - Including dev dependencies
      * Alternative: use yarn
      + Or pnpm

      ### Configuration
      1. Create a config file
      2. Set the API key
      3. Run the setup wizard

      #### Task Checklist
      - [x] Install dependencies
      - [ ] Configure environment
      - [X] Write documentation

      ### API Reference

      | Method | Endpoint | Auth |
      | :--- | :---: | ---: |
      | GET | /api/users | **required** |
      | POST | /api/data | *optional* |
      | DELETE | /api/item | ~~deprecated~~ |

      ${"```typescript"}
      interface Config {
        apiKey: string;
        baseUrl: string;
        debug?: boolean;
      }

      function init(config: Config): void {
        console.log("Initializing...");
      }
      ${"```"}

      $$
      \\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
      \\prod_{i=1}^{n} x_i = x_1 \\cdot x_2 \\cdots x_n
      $$

      ## Examples

      > Here's a simple blockquote
      > with **bold** and *italic* content
      > and a [link](url) inside

      > Nested quotes work too
      >> Like this **bold nested** quote
      >>> And even deeper with ~~strikethrough~~

      <figure>
        <img src="screenshot.png" alt="App screenshot">
        <figcaption>The main dashboard in **dark mode**</figcaption>
      </figure>

      <details>
        <summary>Click to see **advanced** config</summary>
        Here are the advanced settings:
        - Enable \`debug\` mode
        - Set \`logLevel\` to verbose
        ${"```json"}
        {
          "debug": true,
          "logLevel": "verbose"
        }
        ${"```"}
      </details>

      Text with a footnote reference[^1]

      And another reference[^api-note]

      ---

      ## Appendix
      [internal-only comment]: #
      Final paragraph with __underscore bold__ and _underscore italic_.
      Remember: :star: this repo and :wave: to the team!

      [^1]: This is the first footnote with details
      [^api-note]: The API may change in future versions
      `.parse();

      // ── Round-trip ──────────────────────────────────────────────────────────
      const output = String(doc);
      // Verify key content survived the round-trip
      expect(output).toContain("# Project Documentation {#project-docs}");
      expect(output).toContain("## Getting Started");
      expect(output).toContain("### Installation");
      expect(output).toContain("### Configuration");
      expect(output).toContain("#### Task Checklist");
      expect(output).toContain("### API Reference");
      expect(output).toContain("## Examples");
      expect(output).toContain("## Appendix");

      // Inline formatting round-trips
      expect(output).toContain("**project docs**");
      expect(output).toContain("*everything*");
      expect(output).toContain("`npm install`");
      expect(output).toContain("$E=mc^2$");
      expect(output).toContain("H~2~O");
      expect(output).toContain("==critical==");
      expect(output).toContain("~~don't skip this~~");
      expect(output).toContain("<ins>attention</ins>");
      expect(output).toContain("__underscore bold__");
      expect(output).toContain("_underscore italic_");

      // Links and images round-trip
      expect(output).toContain("[the guide](https://guide.example.com)");
      expect(output).toContain(
        '<a href="https://external.example.com" target="_blank">External Docs</a>',
      );
      expect(output).toContain("<https://docs.example.com>");
      expect(output).toContain("![Project logo](logo.png)");

      // Block-level round-trips
      expect(output).toContain("> [!IMPORTANT]");
      expect(output).toContain("> [!TIP]");
      expect(output).toContain("- Clone the repo");
      expect(output).toContain("* Alternative: use yarn");
      expect(output).toContain("+ Or pnpm");
      expect(output).toContain("1. Create a config file");
      expect(output).toContain("- [x] Install dependencies");
      expect(output).toContain("- [ ] Configure environment");
      expect(output).toContain("- [X] Write documentation");
      expect(output).toContain("```typescript");
      expect(output).toContain("interface Config {");
      expect(output).toContain("[internal-only comment]: #");
      expect(output).toContain(":star:");
      expect(output).toContain(":wave:");

      // Table round-trips with alignment
      expect(output).toContain(":---");
      expect(output).toContain(":---:");
      expect(output).toContain("---:");

      // Math block round-trips
      expect(output).toContain("$$\n");
      expect(output).toContain("\\sum_{i=1}^{n}");

      // Figure round-trips
      expect(output).toContain("<figure>");
      expect(output).toContain("<figcaption>");
      expect(output).toContain("</figure>");

      // Details round-trips
      expect(output).toContain("<details>");
      expect(output).toContain("<summary>");
      expect(output).toContain("</details>");

      // HR round-trips
      expect(output).toContain("---");

      // Footnotes round-trip
      expect(output).toContain("[^1]");
      expect(output).toContain("[^api-note]");
      expect(output).toContain("[^1]: This is the first footnote");
      expect(output).toContain("[^api-note]: The API may change");

      // ── Structural inspection ──────────────────────────────────────────────
      const tree = b.inspect(doc);

      // Heading structure
      expect(tree).toContain("MarkdownHeadingBlock");
      expect(tree).toContain("identifier=project-docs");
      const headingCount = (tree.match(/MarkdownHeadingBlock/g) || []).length;
      expect(headingCount).toBe(8); // h1, h2×3, h3×3, h4×1

      // Section nesting
      expect(tree).toContain("MarkdownSectionBlock");
      const sectionCount = (tree.match(/MarkdownSectionBlock/g) || []).length;
      expect(sectionCount).toBeGreaterThanOrEqual(7);

      // All inline block types present
      expect(tree).toContain("MarkdownBoldBlock");
      expect(tree).toContain("MarkdownItalicBlock");
      expect(tree).toContain("MarkdownStrikethroughBlock");
      expect(tree).toContain("MarkdownHighlightBlock");
      expect(tree).toContain("MarkdownSubscriptBlock");
      expect(tree).toContain("MarkdownSuperscriptBlock");
      expect(tree).toContain("MarkdownCodeBlock");
      expect(tree).toContain("MarkdownMathBlock");
      expect(tree).toContain("MarkdownEmojiBlock");
      expect(tree).toContain("MarkdownUnderlineBlock");

      // Link types with metadata
      expect(tree).toContain("MarkdownLinkBlock");
      expect(tree).toContain("url=https://guide.example.com");
      expect(tree).toContain("url=https://external.example.com");
      expect(tree).toContain("target=_blank");
      expect(tree).toContain("url=https://docs.example.com");

      // Image with metadata
      expect(tree).toContain("MarkdownImageBlock");
      expect(tree).toContain("src=logo.png");

      // Captioned image with distinct alt/caption trees
      expect(tree).toContain("src=screenshot.png");
      const captionCount = (tree.match(/── caption/g) || []).length;
      expect(captionCount).toBeGreaterThanOrEqual(1);

      // Blockquotes with alerts
      expect(tree).toContain("MarkdownBlockquoteBlock");
      expect(tree).toContain("alert=important");
      expect(tree).toContain("alert=tip");

      // Lists
      expect(tree).toContain("MarkdownListBlock");
      expect(tree).toContain("MarkdownUnorderedListItemBlock");
      expect(tree).toContain("MarkdownOrderedListItemBlock");
      expect(tree).toContain("MarkdownTaskItemBlock");

      // Table with metadata
      expect(tree).toContain("MarkdownTableBlock");
      expect(tree).toContain("columns");
      expect(tree).toContain("rows");

      // Code block with language
      expect(tree).toContain("language=typescript");

      // Details block with summary and content sub-trees
      expect(tree).toContain("MarkdownDetailsBlock");
      expect(tree).toContain("summary");
      expect(tree).toContain("content");

      // Footnotes
      expect(tree).toContain("MarkdownFootnoteBlock");

      // Horizontal rule
      expect(tree).toContain("MarkdownHorizontalRuleBlock");

      // Comment
      expect(tree).toContain("MarkdownCommentBlock");

      // Paragraph blocks wrapping inline content
      expect(tree).toContain("MarkdownParagraphBlock");
    });
  });
});
