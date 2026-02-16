import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownBlockInspector", () => {
  describe("root block name", () => {
    it("should start with the class name for a document", () => {
      const doc = b.doc();
      expect(b.inspect(doc)).toBe("MarkdownDocument");
    });

    it("should start with the class name for a bold block", () => {
      const block = b.bold("text");
      expect(b.inspect(block).split("\n")[0]).toBe("MarkdownBoldBlock");
    });

    it("should start with the class name for a paragraph", () => {
      const block = b.p("hello");
      expect(b.inspect(block).split("\n")[0]).toBe("MarkdownParagraphBlock");
    });

    it("should start with the class name for a section", () => {
      const block = b.section();
      expect(b.inspect(block)).toBe("MarkdownSectionBlock");
    });
  });

  describe("metadata tags", () => {
    it("should show metadata tags in brackets after the block name", () => {
      const block = b.h("My Heading").level(2).id("my-id");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownHeadingBlock [identifier=my-id, level=2]");
    });

    it("should show level metadata on heading", () => {
      const block = b.h("Title").level(3);
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownHeadingBlock [level=3]");
    });

    it("should show no brackets when there are no metadata tags", () => {
      const block = b.p("text");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownParagraphBlock");
    });

    it("should show url metadata on link block", () => {
      const block = b.link("https://example.com", "click here");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownLinkBlock [url=https://example.com]");
    });

    it("should show src metadata on image block", () => {
      const block = b.img("photo.png", "a photo");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownImageBlock [src=photo.png]");
    });

    it("should show language metadata on code block", () => {
      const block = b.code("console.log('hi')").language("typescript");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownCodeBlock [language=typescript]");
    });

    it("should show style metadata on bold block", () => {
      const block = b.bold("text").style("__");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownBoldBlock [style=__]");
    });

    it("should show style metadata on italic block", () => {
      const block = b.italic("text").style("_");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownItalicBlock [style=_]");
    });

    it("should show identifier metadata on footnote block", () => {
      const block = b.footnote("some note").identifier("abc");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownFootnoteBlock [identifier=abc]");
    });
  });

  describe("string children", () => {
    it("should display string children with quotes", () => {
      const block = b.bold("hello");
      expect(b.inspect(block)).toBe(
        ["MarkdownBoldBlock", '└── "hello"'].join("\n"),
      );
    });

    it("should truncate strings longer than 60 characters", () => {
      const longStr = "a".repeat(70);
      const block = b.bold(longStr);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe(`└── "${"a".repeat(57)}..."`);
    });

    it("should not truncate strings exactly 60 characters", () => {
      const str60 = "b".repeat(60);
      const block = b.bold(str60);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe(`└── "${str60}"`);
    });

    it("should truncate strings of 61 characters", () => {
      const str61 = "c".repeat(61);
      const block = b.bold(str61);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe(`└── "${"c".repeat(57)}..."`);
    });
  });

  describe("number children", () => {
    it("should display number children without quotes", () => {
      const block = b.p(42);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe("└── 42");
    });

    it("should display zero without quotes", () => {
      const block = b.p(0);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe("└── 0");
    });

    it("should display negative numbers without quotes", () => {
      const block = b.p(-5);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe("└── -5");
    });
  });

  describe("null children", () => {
    it("should display null as 'null'", () => {
      const block = b.p(null);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe("└── null");
    });
  });

  describe("undefined children", () => {
    it("should display undefined as 'undefined'", () => {
      const block = b.p(undefined);
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe("└── undefined");
    });
  });

  describe("tree connectors", () => {
    it("should use └── for the last child", () => {
      const block = b.bold("only");
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe('└── "only"');
    });

    it("should use ├── for non-last children and └── for last", () => {
      const block = b.p("first", "second", "third");
      const lines = b.inspect(block).split("\n");
      expect(lines[1]).toBe('├── "first"');
      expect(lines[2]).toBe('├── "second"');
      expect(lines[3]).toBe('└── "third"');
    });

    it("should use │   for continuation under non-last siblings", () => {
      const block = b.doc(b.p("para1"), b.p("para2"));
      const lines = b.inspect(block).split("\n");
      // ├── MarkdownParagraphBlock
      // │   └── "para1"
      // └── MarkdownParagraphBlock
      //     └── "para2"
      expect(lines[0]).toBe("MarkdownDocument");
      expect(lines[1]).toBe("├── MarkdownParagraphBlock");
      expect(lines[2]).toBe('│   └── "para1"');
      expect(lines[3]).toBe("└── MarkdownParagraphBlock");
      expect(lines[4]).toBe('    └── "para2"');
    });

    it("should use 4 spaces for continuation under last sibling", () => {
      const block = b.doc(b.p("text"));
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownDocument");
      expect(lines[1]).toBe("└── MarkdownParagraphBlock");
      expect(lines[2]).toBe('    └── "text"');
    });
  });

  describe("nested blocks", () => {
    it("should show nested block class name and recurse", () => {
      const block = b.p("Hello ", b.bold("world"));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownParagraphBlock",
          '├── "Hello "',
          "└── MarkdownBoldBlock",
          '    └── "world"',
        ].join("\n"),
      );
    });

    it("should handle bold inside italic", () => {
      const block = b.italic(b.bold("nested"));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownItalicBlock",
          "└── MarkdownBoldBlock",
          '    └── "nested"',
        ].join("\n"),
      );
    });
  });

  describe("$lines containers (multiline blocks)", () => {
    it("should show children from $lines in a document", () => {
      const block = b.doc(b.h("Title").level(1), b.p("Body"));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownDocument",
          "├── MarkdownHeadingBlock [level=1]",
          '│   └── "Title"',
          "└── MarkdownParagraphBlock",
          '    └── "Body"',
        ].join("\n"),
      );
    });

    it("should show children from $lines in a blockquote", () => {
      const block = b.blockquote(b.p("quoted text"));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownBlockquoteBlock",
          "└── MarkdownParagraphBlock",
          '    └── "quoted text"',
        ].join("\n"),
      );
    });
  });

  describe("$line containers (line blocks)", () => {
    it("should show children from $line in a heading", () => {
      const block = b.h("Hello ", b.bold("World")).level(2);
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownHeadingBlock [level=2]",
          '├── "Hello "',
          "└── MarkdownBoldBlock",
          '    └── "World"',
        ].join("\n"),
      );
    });

    it("should show children from $line in a paragraph", () => {
      const block = b.p("text ", b.italic("emphasis"));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownParagraphBlock",
          '├── "text "',
          "└── MarkdownItalicBlock",
          '    └── "emphasis"',
        ].join("\n"),
      );
    });
  });

  describe("$content containers (inline blocks)", () => {
    it("should show children from $content in a bold block", () => {
      const block = b.bold("strong ", "text");
      const result = b.inspect(block);
      expect(result).toBe(
        ["MarkdownBoldBlock", '├── "strong "', '└── "text"'].join("\n"),
      );
    });

    it("should show children from $content in an italic block", () => {
      const block = b.italic("em ", "text");
      const result = b.inspect(block);
      expect(result).toBe(
        ["MarkdownItalicBlock", '├── "em "', '└── "text"'].join("\n"),
      );
    });

    it("should show children from $content in a link block", () => {
      const block = b.link("https://example.com", "click ", "here");
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownLinkBlock [url=https://example.com]",
          '├── "click "',
          '└── "here"',
        ].join("\n"),
      );
    });
  });

  describe("table blocks", () => {
    it("should render columns and rows groups", () => {
      const block = b.table(
        { name: "Name", age: "Age" },
        { name: "Alice", age: "30" },
      );
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownTableBlock [columns=name,age, rows=1]",
          "├── columns",
          '│   ├── "Name"',
          '│   └── "Age"',
          "└── rows",
          "    └── row 0",
          '        ├── "Alice"',
          '        └── "30"',
        ].join("\n"),
      );
    });

    it("should render only columns group when rows are empty", () => {
      const block = b.table({ x: "X", y: "Y" });
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownTableBlock [columns=x,y]",
          "└── columns",
          '    ├── "X"',
          '    └── "Y"',
        ].join("\n"),
      );
    });

    it("should render multiple rows with correct connectors", () => {
      const block = b.table(
        { col: "Col" },
        { col: "A" },
        { col: "B" },
        { col: "C" },
      );
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownTableBlock [columns=col, rows=3]",
          "├── columns",
          '│   └── "Col"',
          "└── rows",
          "    ├── row 0",
          '    │   └── "A"',
          "    ├── row 1",
          '    │   └── "B"',
          "    └── row 2",
          '        └── "C"',
        ].join("\n"),
      );
    });

    it("should render multiple columns in each row", () => {
      const block = b.table(
        { a: "A", b: "B", c: "C" },
        { a: "1", b: "2", c: "3" },
      );
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownTableBlock [columns=a,b,c, rows=1]",
          "├── columns",
          '│   ├── "A"',
          '│   ├── "B"',
          '│   └── "C"',
          "└── rows",
          "    └── row 0",
          '        ├── "1"',
          '        ├── "2"',
          '        └── "3"',
        ].join("\n"),
      );
    });

    it("should show style metadata on table when set", () => {
      const block = b.table({ x: "X" }).style("center");
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownTableBlock [style=center, columns=x]");
    });
  });

  describe("various block types in tree", () => {
    it("should display a document with multiple block types", () => {
      const block = b.doc(
        b.h("Title").level(1),
        b.p("A paragraph with ", b.bold("bold"), " and ", b.italic("italic")),
        b.hr(),
      );
      const result = b.inspect(block);
      const lines = result.split("\n");
      expect(lines[0]).toBe("MarkdownDocument");
      expect(lines[1]).toBe("├── MarkdownHeadingBlock [level=1]");
      expect(lines[2]).toBe('│   └── "Title"');
      expect(lines[3]).toBe("├── MarkdownParagraphBlock");
      expect(lines[4]).toBe('│   ├── "A paragraph with "');
      expect(lines[5]).toBe("│   ├── MarkdownBoldBlock");
      expect(lines[6]).toBe('│   │   └── "bold"');
      expect(lines[7]).toBe('│   ├── " and "');
      expect(lines[8]).toBe("│   └── MarkdownItalicBlock");
      expect(lines[9]).toBe('│       └── "italic"');
      expect(lines[10]).toBe("└── MarkdownHorizontalRuleBlock");
    });

    it("should display a section block", () => {
      const block = b.section(b.p("inside section"));
      const lines = b.inspect(block).split("\n");
      expect(lines[0]).toBe("MarkdownSectionBlock");
      expect(lines[1]).toBe("└── MarkdownParagraphBlock");
      expect(lines[2]).toBe('    └── "inside section"');
    });

    it("should display a link block", () => {
      const block = b.link("https://example.com", "Example");
      const result = b.inspect(block);
      expect(result).toBe(
        ["MarkdownLinkBlock [url=https://example.com]", '└── "Example"'].join(
          "\n",
        ),
      );
    });

    it("should display an image block", () => {
      const block = b.img("pic.png", "alt text");
      const result = b.inspect(block);
      expect(result).toBe(
        ["MarkdownImageBlock [src=pic.png]", '└── "alt text"'].join("\n"),
      );
    });

    it("should display a code block", () => {
      const block = b.code("const x = 1;").language("js");
      const result = b.inspect(block);
      expect(result).toBe(
        ["MarkdownCodeBlock [language=js]", '└── "const x = 1;"'].join("\n"),
      );
    });

    it("should display an unordered list block", () => {
      const block = b.list.unordered("item 1", "item 2");
      const result = b.inspect(block);
      const lines = result.split("\n");
      expect(lines[0]).toBe("MarkdownUnorderedListBlock");
      expect(lines[1]).toBe("├── MarkdownUnorderedListItemBlock");
      expect(lines[2]).toBe('│   └── "item 1"');
      expect(lines[3]).toBe("└── MarkdownUnorderedListItemBlock");
      expect(lines[4]).toBe('    └── "item 2"');
    });

    it("should display an ordered list block", () => {
      const block = b.list.ordered("step 1", "step 2");
      const result = b.inspect(block);
      const lines = result.split("\n");
      expect(lines[0]).toBe("MarkdownOrderedListBlock");
      expect(lines[1]).toBe("├── MarkdownOrderedListItemBlock [index=1]");
      expect(lines[2]).toBe('│   └── "step 1"');
      expect(lines[3]).toBe("└── MarkdownOrderedListItemBlock [index=2]");
      expect(lines[4]).toBe('    └── "step 2"');
    });

    it("should display a blockquote block", () => {
      const block = b.blockquote(b.p("quoted"));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownBlockquoteBlock",
          "└── MarkdownParagraphBlock",
          '    └── "quoted"',
        ].join("\n"),
      );
    });

    it("should display a horizontal rule block", () => {
      const block = b.hr();
      const result = b.inspect(block);
      expect(result).toBe("MarkdownHorizontalRuleBlock");
    });

    it("should display an emoji block", () => {
      const block = b.emoji("heart");
      const result = b.inspect(block);
      const lines = result.split("\n");
      expect(lines[0]).toBe("MarkdownEmojiBlock [name=heart]");
    });

    it("should display a footnote block with footer content", () => {
      const block = b.footnote("some footnote content").identifier("fn1");
      const result = b.inspect(block);
      expect(result).toBe(
        "MarkdownFootnoteBlock [identifier=fn1]\n└── footer\n    └── \"some footnote content\"",
      );
    });

    it("should display a footnote block with multi-line footer", () => {
      const block = b.footnote("Line 1", "Line 2").identifier("abc");
      const result = b.inspect(block);
      expect(result).toBe(
        "MarkdownFootnoteBlock [identifier=abc]\n└── footer\n    ├── \"Line 1\"\n    └── \"Line 2\"",
      );
    });

    it("should display a footnote block with no footer content", () => {
      const block = b.footnote().identifier("empty");
      const result = b.inspect(block);
      expect(result).toBe("MarkdownFootnoteBlock [identifier=empty]");
    });

    it("should display footnote footer when nested in a document", () => {
      const doc = b.doc(b.p("text", b.footnote("note content")));
      const result = b.inspect(doc);
      expect(result).toContain("MarkdownFootnoteBlock");
      expect(result).toContain("footer");
      expect(result).toContain('"note content"');
    });
  });

  describe("deep nesting", () => {
    it("should handle three levels of nesting with correct indentation", () => {
      const block = b.doc(b.p("text ", b.bold(b.italic("deep"))));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownDocument",
          "└── MarkdownParagraphBlock",
          '    ├── "text "',
          "    └── MarkdownBoldBlock",
          "        └── MarkdownItalicBlock",
          '            └── "deep"',
        ].join("\n"),
      );
    });

    it("should handle deep nesting with multiple siblings at each level", () => {
      const block = b.doc(
        b.p("start ", b.bold("b1 ", b.italic("i1")), " end"),
        b.p("second"),
      );
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownDocument",
          "├── MarkdownParagraphBlock",
          '│   ├── "start "',
          "│   ├── MarkdownBoldBlock",
          '│   │   ├── "b1 "',
          "│   │   └── MarkdownItalicBlock",
          '│   │       └── "i1"',
          '│   └── " end"',
          "└── MarkdownParagraphBlock",
          '    └── "second"',
        ].join("\n"),
      );
    });

    it("should handle blockquote with nested content", () => {
      const block = b.blockquote(b.p("line1 ", b.bold("bold")), b.p("line2"));
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownBlockquoteBlock",
          "├── MarkdownParagraphBlock",
          '│   ├── "line1 "',
          "│   └── MarkdownBoldBlock",
          '│       └── "bold"',
          "└── MarkdownParagraphBlock",
          '    └── "line2"',
        ].join("\n"),
      );
    });
  });

  describe("empty blocks", () => {
    it("should show only the block name for an empty document", () => {
      const block = b.doc();
      expect(b.inspect(block)).toBe("MarkdownDocument");
    });

    it("should show only the block name for an empty paragraph", () => {
      const block = b.p();
      expect(b.inspect(block)).toBe("MarkdownParagraphBlock");
    });

    it("should show only the block name for an empty bold block", () => {
      const block = b.bold();
      expect(b.inspect(block)).toBe("MarkdownBoldBlock");
    });

    it("should show only the block name for an empty italic block", () => {
      const block = b.italic();
      expect(b.inspect(block)).toBe("MarkdownItalicBlock");
    });

    it("should show only the block name for an empty section", () => {
      const block = b.section();
      expect(b.inspect(block)).toBe("MarkdownSectionBlock");
    });

    it("should show only the block name for an empty blockquote", () => {
      const block = b.blockquote();
      expect(b.inspect(block)).toBe("MarkdownBlockquoteBlock");
    });

    it("should show only the block name for a horizontal rule (no $line content)", () => {
      const block = b.hr();
      expect(b.inspect(block)).toBe("MarkdownHorizontalRuleBlock");
    });
  });

  describe("block.inspect() method", () => {
    it("should produce the same output as b.inspect(block)", () => {
      const block = b.doc(b.p("hello ", b.bold("world")));
      expect(block.inspect()).toBe(b.inspect(block));
    });
  });

  describe("table inside document", () => {
    it("should render a table as a child of a document", () => {
      const block = b.doc(
        b.h("Data").level(1),
        b.table(
          { name: "Name", score: "Score" },
          { name: "Alice", score: "100" },
        ),
      );
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownDocument",
          "├── MarkdownHeadingBlock [level=1]",
          '│   └── "Data"',
          "└── MarkdownTableBlock [columns=name,score, rows=1]",
          "    ├── columns",
          '    │   ├── "Name"',
          '    │   └── "Score"',
          "    └── rows",
          "        └── row 0",
          '            ├── "Alice"',
          '            └── "100"',
        ].join("\n"),
      );
    });
  });

  describe("empty string filtering", () => {
    it("should not render empty strings in $content", () => {
      const block = b.bold("hello", "", "world");
      expect(b.inspect(block)).toBe(
        ["MarkdownBoldBlock", '├── "hello"', '└── "world"'].join("\n"),
      );
    });

    it("should not render empty strings in $line", () => {
      const block = b.p("text", "", "more");
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", '├── "text"', '└── "more"'].join("\n"),
      );
    });

    it("should not render empty strings in $lines", () => {
      const block = b.doc(b.p("a"), b.p("b"));
      // Manually insert an empty string into $lines
      (block as any).$lines.splice(1, 0, "");
      expect(b.inspect(block)).toBe(
        [
          "MarkdownDocument",
          "├── MarkdownParagraphBlock",
          '│   └── "a"',
          "└── MarkdownParagraphBlock",
          '    └── "b"',
        ].join("\n"),
      );
    });

    it("should handle all children being empty strings", () => {
      const block = b.bold("", "");
      expect(b.inspect(block)).toBe("MarkdownBoldBlock");
    });

    it("should handle empty string at the start", () => {
      const block = b.p("", "text");
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", '└── "text"'].join("\n"),
      );
    });

    it("should handle empty string at the end", () => {
      const block = b.p("text", "");
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", '└── "text"'].join("\n"),
      );
    });

    it("should not render newline-only strings", () => {
      const block = b.p("text", "\n", "more");
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", '├── "text"', '└── "more"'].join("\n"),
      );
    });

    it("should not render multi-newline strings", () => {
      const block = b.p("text", "\n\n\n", "more");
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", '├── "text"', '└── "more"'].join("\n"),
      );
    });

    it("should not render whitespace-only strings", () => {
      const block = b.p("text", "   ", "more");
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", '├── "text"', '└── "more"'].join("\n"),
      );
    });

    it("should not render newline-and-spaces strings", () => {
      const block = b.p("text", "\n  ", "more");
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", '├── "text"', '└── "more"'].join("\n"),
      );
    });

    it("should keep strings with content between newlines", () => {
      const block = b.p("a", "hello\nworld", "b");
      const result = b.inspect(block);
      expect(result).toContain('"hello');
      expect(result).toContain('world"');
      expect(result).toContain('"a"');
      expect(result).toContain('"b"');
    });

    it("should still render null and undefined", () => {
      const block = b.p(null, "", undefined);
      expect(b.inspect(block)).toBe(
        ["MarkdownParagraphBlock", "├── null", "└── undefined"].join("\n"),
      );
    });
  });

  describe("mixed primitive types in line", () => {
    it("should display mixed string and number children", () => {
      const block = b.p("count: ", 42);
      const result = b.inspect(block);
      expect(result).toBe(
        ["MarkdownParagraphBlock", '├── "count: "', "└── 42"].join("\n"),
      );
    });

    it("should display null and undefined among siblings", () => {
      const block = b.p("start", null, undefined, "end");
      const result = b.inspect(block);
      expect(result).toBe(
        [
          "MarkdownParagraphBlock",
          '├── "start"',
          "├── null",
          "├── undefined",
          '└── "end"',
        ].join("\n"),
      );
    });
  });
});
