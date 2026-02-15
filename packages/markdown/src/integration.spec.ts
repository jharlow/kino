import { describe, it, expect } from "vitest";
import { b } from "./index";

describe("integration: block composition in documents and sections", () => {
  describe("document with all block types", () => {
    it("should render a document containing every supported block type", () => {
      const doc = b.doc(
        b.h("Main Title"),
        b.p("A paragraph with ", b.b("bold"), " and ", b.i("italic"), " text."),
        b.p(
          "Formatting: ",
          b.st("strikethrough"),
          " ",
          b.hl("highlight"),
          " ",
          b.sub("subscript"),
          " ",
          b.sup("superscript"),
          " ",
          b.e("wave"),
        ),
        b.p(
          "Links: ",
          b.url("https://example.com", "a link"),
          " and ",
          b.img("https://img.png", "alt text"),
        ),
        b.bq("A blockquote line"),
        b.list.ul("Unordered item 1", "Unordered item 2"),
        b.list.ol("Ordered item 1", "Ordered item 2"),
        b.list.tasks([true, "Done task"], [false, "Pending task"]),
        b.code("const x = 1;").language("js"),
        b.hr(),
        b.t({ name: "Name", age: "Age" }, { name: "Alice", age: "30" }),
        b.p("Text with a footnote", b.fn("Footnote content")),
        b.br(),
        b.sec(b.h("Section Heading"), "Section body"),
      );

      const result = String(doc);

      expect(result).toContain("# Main Title");
      expect(result).toContain("**bold**");
      expect(result).toContain("*italic*");
      expect(result).toContain("~~strikethrough~~");
      expect(result).toContain("==highlight==");
      expect(result).toContain("~subscript~");
      expect(result).toContain("^superscript^");
      expect(result).toContain(":wave:");
      expect(result).toContain("[a link](https://example.com)");
      expect(result).toContain("![alt text](https://img.png)");
      expect(result).toContain("> A blockquote line");
      expect(result).toContain("- Unordered item 1");
      expect(result).toContain("1. Ordered item 1");
      expect(result).toContain("- [x] Done task");
      expect(result).toContain("- [ ] Pending task");
      expect(result).toContain("```js\nconst x = 1;\n```");
      expect(result).toContain("---");
      expect(result).toContain("| Name  | Age |");
      expect(result).toContain("[^1]");
      expect(result).toContain("[^1]: Footnote content");
      expect(result).toContain("## Section Heading");
      expect(result).toContain("Section body");
    });
  });

  describe("nested sections with heading level shifting", () => {
    it("should auto-increment heading levels through nested sections", () => {
      const doc = b.doc(
        b.h("Level 1"),
        b.sec(b.h("Level 2"), b.sec(b.h("Level 3"), b.sec(b.h("Level 4")))),
      );
      expect(String(doc)).toBe(
        "# Level 1\n## Level 2\n### Level 3\n#### Level 4",
      );
    });

    it("should handle sibling sections at the same depth", () => {
      const doc = b.doc(
        b.sec(b.h("First"), "content one"),
        b.sec(b.h("Second"), "content two"),
      );
      expect(String(doc)).toBe("## First\ncontent one\n## Second\ncontent two");
    });
  });

  describe("parsed documents embedded in built documents", () => {
    it("should adjust heading levels when a parsed doc is embedded in a section", () => {
      const parsed = b.parse("# Parsed Title\n## Parsed Sub\nParsed body");
      const doc = b.doc(b.h("Host Title"), b.sec(b.h("Host Section"), parsed));
      expect(String(doc)).toBe(
        "# Host Title\n## Host Section\n### Parsed Title\n#### Parsed Sub\nParsed body",
      );
    });

    it("should adjust heading levels when parsed doc is at root level", () => {
      const parsed = b.parse("# Parsed Title\nParsed body");
      const doc = b.doc(b.h("Host Title"), parsed);
      expect(String(doc)).toBe("# Host Title\n## Parsed Title\nParsed body");
    });
  });

  describe("parsed document embedded multiple times at different depths", () => {
    it("should render the same parsed doc at different nesting depths correctly", () => {
      const parsed = b.parse("# A\n## B\ntext");
      const doc = b.doc(b.sec(b.h("Top"), parsed, b.sec(parsed)), parsed);
      expect(String(doc)).toBe(
        "## Top\n### A\n#### B\ntext\n#### A\n##### B\ntext\n## A\n### B\ntext",
      );
    });
  });

  describe("footnote numbering across nested sections", () => {
    it("should auto-number footnotes collected from all nested sections", () => {
      const doc = b.doc(
        b.p("Intro", b.fn("intro note")),
        b.sec(
          b.h("Chapter"),
          b.p("Chapter text", b.fn("chapter note")),
          b.sec(b.h("Subsection"), b.p("Sub text", b.fn("sub note"))),
        ),
      );
      const result = String(doc);
      expect(result).toContain("Intro[^1]");
      expect(result).toContain("Chapter text[^2]");
      expect(result).toContain("Sub text[^3]");
      expect(result).toContain("[^1]: intro note");
      expect(result).toContain("[^2]: chapter note");
      expect(result).toContain("[^3]: sub note");
    });

    it("should skip manually identified footnotes in auto-numbering", () => {
      const doc = b.doc(
        b.p("A", b.fn("manual note").id("custom")),
        b.sec(b.h("Section"), b.p("B", b.fn("auto note"))),
      );
      const result = String(doc);
      expect(result).toContain("A[^custom]");
      expect(result).toContain("B[^1]");
      expect(result).toContain("[^custom]: manual note");
      expect(result).toContain("[^1]: auto note");
    });
  });

  describe("footnotes from parsed documents embedded in host documents", () => {
    it("should merge footnote numbering between host and parsed content", () => {
      const parsed = b.parse("Some text[^1]\n\n[^1]: parsed footnote");
      const doc = b.doc(
        b.p("Host text", b.fn("host footnote")),
        b.sec(b.h("Section"), parsed),
      );
      const result = String(doc);
      expect(result).toContain("Host text[^1]");
      expect(result).toContain("Some text[^2]");
      expect(result).toContain("[^1]: host footnote");
      expect(result).toContain("[^2]: parsed footnote");
    });

    it("should preserve named footnotes from parsed content", () => {
      const parsed = b.parse(
        "Text[^1]\n\nMore[^bignote]\n\n[^1]: note one\n[^bignote]: big note",
      );
      const doc = b.doc(
        b.p("Host", b.fn("host note")),
        b.br(),
        b.sec(b.h("Heading"), b.sec(b.h("Nested"), parsed)),
        b.br(),
        b.p("Host 2", b.fn("host note 2")),
      );
      const result = String(doc);
      expect(result).toContain("Host[^1]");
      expect(result).toContain("Text[^2]");
      expect(result).toContain("More[^bignote]");
      expect(result).toContain("Host 2[^3]");
      expect(result).toContain("[^1]: host note");
      expect(result).toContain("[^2]: note one");
      expect(result).toContain("[^bignote]: big note");
      expect(result).toContain("[^3]: host note 2");
    });
  });

  describe("mixed list types", () => {
    it("should nest an ordered list inside an unordered list", () => {
      const list = b.list.ul(
        "Unordered 1",
        "Unordered 2",
        b.list.ol("Ordered 1", "Ordered 2"),
      );
      expect(String(list)).toBe(
        "- Unordered 1\n- Unordered 2\n  1. Ordered 1\n  2. Ordered 2",
      );
    });

    it("should nest an unordered list inside a task list", () => {
      const list = b.list.tasks(
        [true, "Task done"],
        [false, "Task pending"],
        b.list.ul("Sub item 1", "Sub item 2"),
      );
      expect(String(list)).toBe(
        "- [x] Task done\n- [ ] Task pending\n  - Sub item 1\n  - Sub item 2",
      );
    });

    it("should handle three-level nesting of mixed list types", () => {
      const list = b.list.ul(
        "Top",
        b.list.ol(
          "Middle 1",
          "Middle 2",
          b.list.tasks([true, "Deep task"], [false, "Another deep task"]),
        ),
      );
      expect(String(list)).toBe(
        "- Top\n  1. Middle 1\n  2. Middle 2\n    - [x] Deep task\n    - [ ] Another deep task",
      );
    });
  });

  describe("blockquote containing complex content", () => {
    it("should render a blockquote with headings, lists, and inline formatting", () => {
      const bq = b.bq(
        b.h("Quoted Heading").l(2),
        b.p("Some ", b.b("bold"), " and ", b.i("italic"), " text"),
        b.list.ul("Item 1", "Item 2"),
      );
      expect(String(bq)).toBe(
        "> ## Quoted Heading\n> Some **bold** and *italic* text\n> - Item 1\n> - Item 2",
      );
    });

    it("should render nested blockquotes with content", () => {
      const bq = b.bq(
        "Outer quote",
        b.bq("Inner quote", b.bq("Deepest quote")),
      );
      expect(String(bq)).toBe(
        "> Outer quote\n>> Inner quote\n>>> Deepest quote",
      );
    });
  });

  describe("table with inline formatting in cells", () => {
    it("should render bold, italic, links, and code spans in table cells", () => {
      const tbl = b.t(
        { item: "Item", desc: "Description" },
        {
          item: b.b("Important"),
          desc: b.p(b.i("italic"), " and ", b.code("code")),
        },
        {
          item: b.url("https://example.com", "Link"),
          desc: b.st("deleted"),
        },
      );
      const result = String(tbl);
      expect(result).toContain("**Important**");
      expect(result).toContain("*italic* and `code`");
      expect(result).toContain("[Link](https://example.com)");
      expect(result).toContain("~~deleted~~");
    });
  });

  describe("code block inside document with surrounding content", () => {
    it("should render code blocks with language tags in context", () => {
      const doc = b.doc(
        b.p("Before code:"),
        b.code("function hello() {\n  return 'world';\n}").language("js"),
        b.p("After code."),
      );
      const result = String(doc);
      expect(result).toBe(
        "Before code:\n```js\nfunction hello() {\n  return 'world';\n}\n```\nAfter code.",
      );
    });

    it("should render a code block without a language tag", () => {
      const doc = b.doc("Some text", b.code("line 1\nline 2"), "More text");
      const result = String(doc);
      expect(result).toBe("Some text\n```\nline 1\nline 2\n```\nMore text");
    });
  });

  describe("horizontal rules separating content", () => {
    it("should render horizontal rules with proper blank line handling", () => {
      const doc = b.doc("Before", b.hr(), "After");
      const result = String(doc);
      expect(result).toBe("Before\n\n---\n\nAfter");
    });

    it("should render horizontal rules with custom style and count", () => {
      const doc = b.doc("Before", b.hr().style("*").count(8), "After");
      const result = String(doc);
      expect(result).toBe("Before\n\n********\n\nAfter");
    });
  });

  describe("inline chaining composition", () => {
    it("should render chained inline formatting correctly", () => {
      const chained = b.p("text").b().i().st().hl().url("https://example.com");
      expect(String(chained)).toBe("[==~~***text***~~==](https://example.com)");
    });

    it("should render simpler chaining: bold then italic", () => {
      expect(String(b.p("hello").b().i())).toBe("***hello***");
    });

    it("should render link with bold label", () => {
      expect(String(b.p("click").b().url("https://example.com"))).toBe(
        "[**click**](https://example.com)",
      );
    });
  });

  describe("emptyIf/defaultIfEmpty in composition", () => {
    it("should conditionally exclude content from a document", () => {
      const showOptional = false;
      const doc = b.doc(
        "Always visible",
        b.p("Optional content").emptyIf(showOptional),
        "Also always visible",
      );
      const result = String(doc);
      expect(result).toBe("Always visible\n\nAlso always visible");
    });

    it("should use defaultIfEmpty for fallback content in a document", () => {
      const doc = b.doc(
        "Header",
        b.p().defaultIfEmpty("No content available"),
        "Footer",
      );
      expect(String(doc)).toBe("Header\nNo content available\nFooter");
    });

    it("should keep content when emptyIf condition is truthy", () => {
      const doc = b.doc("Header", b.p("Visible").emptyIf(true), "Footer");
      expect(String(doc)).toBe("Header\nVisible\nFooter");
    });

    it("should use defaultIfEmpty on a multiline block", () => {
      const doc = b.doc(
        "Header",
        b.sec().defaultIfEmpty("Fallback section"),
        "Footer",
      );
      expect(String(doc)).toBe("Header\nFallback section\nFooter");
    });
  });

  describe("rendering options propagation", () => {
    it("should propagate newlineStrategy to nested content", () => {
      const doc = b
        .doc(b.h("Title"), b.p("Paragraph one"), b.p("Paragraph two"))
        .setRenderingOptions({ newlineStrategy: "between_blocks" });
      expect(String(doc)).toBe("# Title\n\nParagraph one\n\nParagraph two");
    });

    it("should propagate before_and_after_heading strategy", () => {
      const doc = b
        .doc("intro", b.h("Title"), "body")
        .setRenderingOptions({ newlineStrategy: "before_and_after_heading" });
      expect(String(doc)).toBe("intro\n\n# Title\n\nbody");
    });

    it("should propagate enforce to bold within a document", () => {
      const doc = b.doc(b.p("text ", b.b("bold")));
      doc.setRenderingOptions({ enforce: { bold: { style: "__" } } });
      expect(String(doc)).toBe("text __bold__");
    });

    it("should propagate enforce to italic within a document", () => {
      const doc = b.doc(b.p("text ", b.i("italic")));
      doc.setRenderingOptions({ enforce: { italic: { style: "_" } } });
      expect(String(doc)).toBe("text _italic_");
    });

    it("should propagate enforce.unorderedListItem", () => {
      const doc = b.doc(b.list.ul("Item 1", "Item 2"));
      doc.setRenderingOptions({
        enforce: { unorderedListItem: { style: "*" } },
      });
      expect(String(doc)).toBe("* Item 1\n* Item 2");
    });
  });

  describe("round-trip of complex documents", () => {
    it("should produce identical output: build -> render -> parse -> render", () => {
      const doc = b.doc(
        b.h("Document Title"),
        b.p("A paragraph with ", b.b("bold"), " and ", b.i("italic"), "."),
        b.bq("A blockquote"),
        b.list.ul("Item 1", "Item 2"),
        b.list.ol("First", "Second"),
        b.code("const x = 1;").language("js"),
        b.hr(),
        b.t({ name: "Name", age: "Age" }, { name: "Alice", age: "30" }),
        b.sec(
          b.h("Section"),
          b.p("Section body"),
          b.sec(b.h("Subsection"), b.p("Subsection body")),
        ),
      );
      const rendered = String(doc);
      const reparsed = b.parse(rendered);
      expect(String(reparsed)).toBe(rendered);
    });

    it("should round-trip a document with footnotes", () => {
      const doc = b.doc(
        b.p("Text", b.fn("note one")),
        b.sec(b.h("Section"), b.p("More", b.fn("note two"))),
      );
      const rendered = String(doc);
      const reparsed = b.parse(rendered);
      expect(String(reparsed)).toBe(rendered);
    });

    it("should round-trip inline formatting", () => {
      const doc = b.doc(
        b.p(
          b.b("bold"),
          " ",
          b.i("italic"),
          " ",
          b.st("strike"),
          " ",
          b.hl("highlight"),
          " ",
          b.sub("sub"),
          " ",
          b.sup("sup"),
        ),
      );
      const rendered = String(doc);
      const reparsed = b.parse(rendered);
      expect(String(reparsed)).toBe(rendered);
    });

    it("should round-trip a table with formatting", () => {
      const doc = b.doc(
        b.t(
          { item: "Item", status: "Status" },
          { item: b.b("Important"), status: b.i("pending") },
        ),
      );
      const rendered = String(doc);
      const reparsed = b.parse(rendered);
      expect(String(reparsed)).toBe(rendered);
    });

    it("should round-trip blockquotes", () => {
      const doc = b.doc(b.bq("line 1", "line 2", b.bq("nested")));
      const rendered = String(doc);
      const reparsed = b.parse(rendered);
      expect(String(reparsed)).toBe(rendered);
    });

    it("should round-trip horizontal rules with style", () => {
      const doc = b.doc("before", b.hr().style("*").count(8), "after");
      const rendered = String(doc);
      const reparsed = b.parse(rendered);
      expect(String(reparsed)).toBe(rendered);
    });
  });

  describe("template literals (b.md)", () => {
    it("should interpolate blocks into markdown template strings within documents", () => {
      const name = "World";
      const doc = b.doc(
        b.h("Greeting"),
        b.md`Hello, ${b.b(name)}! Visit ${b.url("https://example.com", "here")}.`,
      );
      const result = String(doc);
      expect(result).toContain("# Greeting");
      expect(result).toContain(
        "Hello, **World**! Visit [here](https://example.com).",
      );
    });

    it("should compose template literals alongside other blocks", () => {
      const doc = b.doc(
        b.md`${b.b("Bold")} and ${b.i("italic")}`,
        b.list.ul("Item 1"),
        b.md`Footer with ${b.code("code")}`,
      );
      const result = String(doc);
      expect(result).toContain("**Bold** and *italic*");
      expect(result).toContain("- Item 1");
      expect(result).toContain("Footer with `code`");
    });
  });

  describe("multiple line breaks between sections", () => {
    it("should render line breaks as empty lines between content", () => {
      const doc = b.doc("First section", b.br(), "Second section");
      const result = String(doc);
      expect(result).toBe("First section\n\nSecond section");
    });

    it("should render multiple consecutive line breaks as multiple empty lines", () => {
      const doc = b.doc("First", b.br(), b.br(), "Second");
      const result = String(doc);
      // Each br renders as "\n", and lines are joined with "\n":
      // "First" \n "\n" \n "\n" \n "Second" => "First\n\n\nSecond"
      expect(result).toBe("First\n\n\nSecond");
    });
  });

  describe("deep section nesting (6+ levels)", () => {
    it("should cap heading level at 6 for depth beyond 6", () => {
      const doc = b.doc(
        b.sec(
          b.sec(b.sec(b.sec(b.sec(b.sec(b.h("Level 7"), "body at depth 7"))))),
        ),
      );
      const result = String(doc);
      expect(result).toBe("###### Level 7\nbody at depth 7");
    });

    it("should cap all headings at 6 regardless of deeper nesting", () => {
      const doc = b.doc(
        b.sec(
          b.sec(b.sec(b.sec(b.sec(b.sec(b.h("At 7"), b.sec(b.h("At 8"))))))),
        ),
      );
      const result = String(doc);
      expect(result).toContain("###### At 7");
      expect(result).toContain("###### At 8");
      // Verify no heading has more than 6 # characters
      const lines = result.split("\n");
      for (const line of lines) {
        const match = line.match(/^(#+) /);
        if (match) {
          expect(match[1].length).toBeLessThanOrEqual(6);
        }
      }
    });
  });

  describe("lists with inline formatting", () => {
    it("should render bold items in unordered lists", () => {
      const list = b.list.ul(b.b("Bold item"), "Normal item");
      expect(String(list)).toBe("- **Bold item**\n- Normal item");
    });

    it("should render links in ordered list items", () => {
      const list = b.list.ol(
        b.url("https://example.com", "Link item"),
        "Plain item",
      );
      expect(String(list)).toBe(
        "1. [Link item](https://example.com)\n2. Plain item",
      );
    });

    it("should render mixed inline formatting in list items", () => {
      const list = b.list.ul(
        b.p(b.b("Bold"), " and ", b.i("italic")),
        b.p(b.code("code"), " and ", b.st("strike")),
      );
      expect(String(list)).toBe(
        "- **Bold** and *italic*\n- `code` and ~~strike~~",
      );
    });
  });

  describe("trim behavior in composed documents", () => {
    it("should trim leading and trailing empty lines from code blocks", () => {
      const doc = b.doc(
        "Before",
        b
          .code(
            `
            function hello() {
              return "world";
            }
          `,
          )
          .language("ts")
          .trim(),
        "After",
      );
      const result = String(doc);
      expect(result).toContain(
        '```ts\nfunction hello() {\n  return "world";\n}\n```',
      );
    });

    it("should preserve nested list indentation with trim", () => {
      const doc = b.doc(
        "Header",
        b.list
          .ul(
            "Item 1",
            b.list.ul("Nested 1", b.list.ul("Deep nested")),
            "Item 2",
          )
          .trim(),
        "Footer",
      );
      const result = String(doc);
      expect(result).toContain("- Item 1");
      expect(result).toContain("  - Nested 1");
      expect(result).toContain("    - Deep nested");
      expect(result).toContain("- Item 2");
    });
  });

  describe("complex real-world scenarios", () => {
    it("should render a full API documentation page", () => {
      const doc = b.doc(
        b.h("API Reference"),
        b.p("Welcome to the API docs."),
        b.sec(
          b.h("Authentication"),
          b.p(
            "Use ",
            b.code("Bearer <token>"),
            " in the Authorization header.",
          ),
          b
            .code(
              'curl -H "Authorization: Bearer token123" https://api.example.com',
            )
            .language("bash"),
        ),
        b.sec(
          b.h("Endpoints"),
          b.sec(
            b.h("GET /users"),
            b.p("Returns a list of users."),
            b.t(
              { param: "Parameter", type: "Type", desc: "Description" },
              {
                param: b.code("limit"),
                type: b.i("number"),
                desc: "Max results",
              },
              {
                param: b.code("offset"),
                type: b.i("number"),
                desc: "Skip count",
              },
            ),
          ),
        ),
      );
      const result = String(doc);
      expect(result).toContain("# API Reference");
      expect(result).toContain("## Authentication");
      expect(result).toContain("```bash");
      expect(result).toContain("## Endpoints");
      expect(result).toContain("### GET /users");
      expect(result).toContain("| `limit`");
    });

    it("should compose a document from separately built sections", () => {
      const intro = b.sec(
        b.h("Introduction"),
        b.p("This is the introduction."),
      );
      const body = b.sec(
        b.h("Body"),
        b.p("This is the body with ", b.b("emphasis"), "."),
        b.list.ul("Point 1", "Point 2"),
      );
      const conclusion = b.sec(b.h("Conclusion"), b.p("Final thoughts."));

      const doc = b.doc(b.h("My Document"), intro, body, conclusion);
      const result = String(doc);
      expect(result).toContain("# My Document");
      expect(result).toContain("## Introduction");
      expect(result).toContain("## Body");
      expect(result).toContain("## Conclusion");
    });

    it("should handle a parsed markdown snippet within a programmatic document", () => {
      const userContent = b.parse(
        "# User Guide\n\nFollow these steps:\n\n1. Install\n2. Configure\n3. Run\n\n---\n\n**Note:** Check the docs.",
      );
      const doc = b.doc(
        b.h("Admin Panel"),
        b.p("Administrative overview."),
        b.sec(b.h("User Documentation"), userContent),
      );
      const result = String(doc);
      expect(result).toContain("# Admin Panel");
      expect(result).toContain("## User Documentation");
      expect(result).toContain("### User Guide");
      expect(result).toContain("1. Install");
      expect(result).toContain("**Note:** Check the docs.");
    });

    it("should round-trip the complex API documentation page", () => {
      const doc = b.doc(
        b.h("Title"),
        b.p("Intro text with ", b.b("bold"), " and ", b.i("italic"), "."),
        b.bq("A quoted remark"),
        b.list.ul("Alpha", "Beta", "Gamma"),
        b.code("print('hello')").language("python"),
        b.hr(),
        b.t({ col1: "Col 1", col2: "Col 2" }, { col1: "A", col2: "B" }),
        b.sec(
          b.h("Section One"),
          b.p("Content"),
          b.sec(b.h("Subsection"), b.p("More content")),
        ),
      );
      const rendered = String(doc);
      const reparsed = b.parse(rendered);
      expect(String(reparsed)).toBe(rendered);
    });
  });
});
