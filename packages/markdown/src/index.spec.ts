import { describe, it, expect } from "vitest";
import { b } from ".";
import { MarkdownHeadingLevel } from "./blocks/standard/markdown-heading-block";

describe(b.h, () => {
  it("should render a heading", () => {
    expect(b.h("heading").render()).toBe("# heading");
  });

  it("should be string readable", () => {
    expect(`${b.h("heading")}`).toBe("# heading");
    expect(String(b.h("heading"))).toBe("# heading");
  });

  it.each<MarkdownHeadingLevel>([2, 3, 4, 5, 6])(
    "should chain level %s",
    (level) => {
      expect(`${b.h("heading").level(level)}`).toBe(
        `${"#".repeat(level)} heading`,
      );
    },
  );

  it("should chain id", () => {
    expect(`${b.h("heading").id("heading-1")}`).toBe("# heading {#heading-1}");
  });

  it("should chain id and level", () => {
    expect(`${b.h("heading").id("heading-1").level(2)}`).toBe(
      "## heading {#heading-1}",
    );
  });
});

describe("MarkdownDocument", () => {
  function hello() {
    console.log("hello world");
    return "hello world";
  }
  it("should render an empty document", () => {
    const document = b.doc(
      b.heading("Hello, world!"),
      "This is a test2",
      b.para(
        "This is a test ",
        b.bold("bold text ", b.italic("italic text").style("_")),
        b.para(" and some more text", b.emoji("waffle")),
      ),
      b.blockquote(
        b.highlight("highlight text"),
        b.subscript("subscript text"),
        b.superscript("superscript text"),
        b.bq(
          "This is a blockquote",
          b.bq(
            "this is a nested blockquote",
            b.bq("this is a deeply nested blockquote"),
          ),
        ),
      ),
      b.list
        .tasks(
          [true, "This is a checked task"],
          [false, "Item 2"],
          b.list
            .tasks(
              [true, "Item 2.1"],
              b.list.ul(
                "Item 2.1.1",
                "Item 2.1.2",
                b.list.ordered("Item 2.1.2.1", "Item 2.1.2.2"),
              ),
            )
            .indent(4),
          [true, "Item 3"],
        )
        .style("X"),
      b.listItem.task(true, "This is a checked task"),
      b.list
        .ordered("Item 1", "Item 2", b.url("Item 3", "https://www.google.com"))
        .startingIndex(3),
      b.listItem.ordered(1, "Item 1"),
      b.list.ul("Item 1", b.b("Item 2"), "Item 3").style("*"),
      b.listItem.unordered("Item 1"),
      b.bold("bold text", " and some more bold text ", b.italic("italic text")),
      b.image("https://www.google.com", "Google logo"),
      b.horizontalRule().style("*").count(8),
      b.para(
        "This is a second test ",
        b.url("https://www.google.com", "with a ", b.bold("bold link")),
        " and some more text with an unlabelled link ",
        b.link("https://www.google.com"),
      ),
      b.sec(
        b.h("heading 2").id("heading-1"),
        b.list.unordered("Item 1", "Item 2", "Item 3").style("*"),
        b.para(
          "This is a section ",
          b.para("This is a second section").emptyIf(false).default("get"),
          b.footnote("this is a footnote"),
        ),
        b.section(
          b.h("heading 3"),
          b.para(
            "This is a section",
            b
              .footnote("This is a second section", "with multiple lines")
              .identifier("bignote"),
          ),
          b.section(
            b.h("heading 4"),
            b.para("This is a section"),
            b.section(
              b.h("heading 5"),
              b.para("This is a section"),
              b.h("heading 2").level(2),
              b.para("This is a section"),
              b.section(
                b.h("heading 6"),
                b.para(
                  "This is a section",
                  b.footnote("This is a third footnote"),
                ),
                b.section(
                  b.h("heading ", b.strike("7 strikethrough text")),
                  b.para("This is a section"),
                ),
                b.table(
                  {
                    name: { name: "Name", align: "center", maxWidth: 20 },
                    age: "Age",
                  },
                  {
                    name: "Alice macintyre, CPA at Langdon & Emison",
                    age: "30 and three quarters",
                  },
                  { name: "Bob", age: "25" },
                ),
              ),
              b.code(hello.toString()).language("js"),
            ),
          ),
        ),
      ),
    );
    console.log(String(document));
    expect(String(b.parse(String(document)))).toBe(String(document));
    // console.log(`${document}`);
    //     expect(`${document}`).toBe(
    //       `# Hello, world!

    // This is a test2
    // This is a test **bold text _italic text_** and some more text:waffle:
    // > ==highlight text==
    // > ~subscript text~
    // > ^superscript text^
    // >> This is a blockquote
    // >>> this is a nested blockquote
    // >>>> this is a deeply nested blockquote
    // - [X] This is a checked task
    // - [ ] Item 2
    //   - [x] Item 2.1
    //     - Item 2.1.1
    //     - Item 2.1.2
    //       1. Item 2.1.2.1
    //       2. Item 2.1.2.2
    // - [X] Item 3
    // - [x] This is a checked task
    // 3. Item 1
    // 4. Item 2
    // 5. [https://www.google.com](Item 3)
    // 1. Item 1
    // * Item 1
    // * **Item 2**
    // * Item 3
    // - Item 1
    // **bold text and some more bold text *italic text***
    // ![Google logo](https://www.google.com)

    // *****

    // This is a second test [with a **bold link**](https://www.google.com) and some more text with an unlabelled link <https://www.google.com>
    // ## heading 2 {#heading-1}
    // * Item 1
    // * Item 2
    // * Item 3
    // This is a section get[^1]
    // ### heading 3
    // This is a section[^bignote]
    // #### heading 4
    // This is a section
    // ##### heading 5
    // This is a section
    // ## heading 2
    // This is a section
    // ###### heading 6
    // This is a section[^2]
    // ###### heading ~~7 strikethrough text~~
    // This is a section
    // \`\`\`js
    // function hello() {
    //     console.log("hello world");
    //     return "hello world";
    //   }
    // \`\`\`

    // [^1]: this is a footnote
    // [^bignote]: This is a second section
    // with multiple lines
    // [^2]: This is a third footnote`,
    //     );
  });
});

describe("MarkdownFootnoteBlock", () => {
  it("should auto-assign identifier and render inline reference with definition", () => {
    const document = b.doc(b.para("Some text", b.footnote("footnote content")));
    expect(`${document}`).toBe(
      `Some text[^1]

[^1]: footnote content`,
    );
  });

  it("should use a manually set identifier", () => {
    const document = b.doc(
      b.para("Some text", b.footnote("footnote content").identifier("abc")),
    );
    expect(`${document}`).toBe(
      `Some text[^abc]

[^abc]: footnote content`,
    );
  });

  it("should auto-assign multiple footnotes incrementally", () => {
    const document = b.doc(
      b.para(
        "First",
        b.footnote("first note"),
        " Second",
        b.footnote("second note"),
      ),
    );
    expect(`${document}`).toBe(
      `First[^1] Second[^2]

[^1]: first note
[^2]: second note`,
    );
  });

  it("should skip already-identified footnotes during auto-assign", () => {
    const document = b.doc(
      b.para(
        "A",
        b.footnote("manual note").identifier("custom"),
        " B",
        b.footnote("auto note"),
      ),
    );
    expect(`${document}`).toBe(
      `A[^custom] B[^1]

[^custom]: manual note
[^1]: auto note`,
    );
  });

  it("should collect footnotes from nested sections", () => {
    const document = b.doc(
      b.sec(b.sec(b.para("Deep", b.footnote("deep note")))),
    );
    expect(`${document}`).toBe(
      `Deep[^1]

[^1]: deep note`,
    );
  });

  it("should collect footnotes from nested sections with multiple lines", () => {
    const document = b.doc(
      b.sec(
        b.sec(b.para("Deep", b.footnote("deep note").identifier("deepnote"))),
      ),
    );
    expect(`${document}`).toBe(
      `Deep[^deepnote]

[^deepnote]: deep note`,
    );
  });

  it("should allow multi-line footnotes", () => {
    const document = b.doc(
      b.sec(
        b.para("Deep", b.footnote("deep note", b.b("with multiple lines"))),
      ),
    );
    expect(`${document}`).toBe(
      `Deep[^1]

[^1]: deep note
**with multiple lines**`,
    );
  });

  it("should render no definitions section when no footnotes exist", () => {
    const document = b.doc(b.para("No footnotes here"));
    expect(`${document}`).toBe("No footnotes here");
  });
});

describe("parse", () => {
  it("should round-trip plain text", () => {
    const input = "just plain text\nmore text";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip headings with sections", () => {
    const input = "# A\n## B\n### C\ntext\n## D\n# E";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should shift heading levels when embedded", () => {
    const inner = b.parse("# A\n## B\ntext");
    const outer = b.doc(b.sec(b.h("Top"), inner, b.sec(inner)), inner);
    expect(String(outer)).toBe(
      "## Top\n### A\n#### B\ntext\n#### A\n##### B\ntext\n## A\n### B\ntext",
    );
  });

  it("should round-trip inline formatting", () => {
    const input = "**bold** and *italic* and ~~strike~~";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip nested inline formatting", () => {
    const input = "**bold *italic* bold**";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip links and images", () => {
    const input = "[text](url) and ![alt](src) and <https://example.com>";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip unordered lists", () => {
    const input = "- Item 1\n- Item 2\n  - Nested\n- Item 3";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip ordered lists", () => {
    const input = "1. First\n2. Second\n3. Third";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip task lists", () => {
    const input = "- [x] Done\n- [ ] Not done\n- [X] Also done";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip code blocks", () => {
    const input = "```js\nconst x = 1;\n```";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip inline code", () => {
    const input = "use `code` here";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip blockquotes", () => {
    const input = "> line 1\n> line 2\n>> nested";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip horizontal rules", () => {
    const input = "before\n\n---\n\nafter";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip horizontal rules with any length", () => {
    const input = "before\n\n----------------\n\nafter";
    const doc = b.parse(input);
    expect(b.inspect(doc)).toContain("MarkdownHorizontalRuleBlock");
    expect(String(doc)).toBe(input);
  });

  it("should round-trip horizontal rules with any style", () => {
    const input = "before\n\n********\n\nafter";
    const doc = b.parse(input);
    expect(b.inspect(doc)).toContain("MarkdownHorizontalRuleBlock");
    expect(String(doc)).toBe(input);
  });

  it("should round-trip footnotes", () => {
    const input = "Some text[^1]\n\n[^1]: footnote content";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip multiple footnotes", () => {
    const input = `Some text[^1]\n\n[^1]: footnote content\n\nSome more text[^2]\n\n[^2]: footnote content\n\nFinal footnote[^3]\n\n[^3]: final footnote content`;
    const doc = b.parse(input);
    expect(String(doc)).toBe(
      `Some text[^1]\n\nSome more text[^2]\n\nFinal footnote[^3]\n\n[^1]: footnote content\n[^2]: footnote content\n[^3]: final footnote content`,
    );
  });

  it("should embed nested footnotes naturally in their host documents", () => {
    const input = `Some text[^1]\n\n[^1]: footnote content\n\nSome more text[^bignote]\n\n[^bignote]: footnote content\n\nFinal footnote[^3]\n\n[^3]: final footnote content`;
    const doc = b.parse(input);
    const hostDoc = b.doc(
      b.para("Host text", b.footnote("host footnote content")),
      b.br(),
      b.sec(b.h("Heading"), b.sec(b.h("Nested heading"), doc)),
      b.br(),
      b.para("Host text 2", b.footnote("host footnote content 2")),
    );
    expect(String(hostDoc)).toBe(
      `Host text[^1]\n\n## Heading\n### Nested heading\nSome text[^2]\n\nSome more text[^bignote]\n\nFinal footnote[^3]\n\nHost text 2[^4]\n\n[^1]: host footnote content\n[^2]: footnote content\n[^bignote]: footnote content\n[^3]: final footnote content\n[^4]: host footnote content 2`,
    );
  });

  it("should not add footnotes if there is only one side", () => {
    const input = "Some text[^1]\n\n[^2]: footnote content";
    const doc = b.parse(input);
    expect(String(doc)).toBe("Some text");
  });

  it("should round-trip highlight, subscript, superscript", () => {
    const input = "==highlighted== and ~sub~ and ^sup^";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should round-trip emoji", () => {
    const input = "hello :waffle: world";
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should be able to handle complex nested styling", () => {
    const input = b
      .doc(
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
      )
      .toString();
    const doc = b.parse(input);
    expect(String(doc)).toBe(input);
  });

  it("should apply enforce to parsed bold", () => {
    const doc = b.parse("**hello**");
    doc.setRenderingOptions({ enforce: { bold: { style: "__" } } });
    expect(String(doc)).toBe("__hello__");
  });

  it("should apply enforce to parsed italic", () => {
    const doc = b.parse("*hello*");
    doc.setRenderingOptions({ enforce: { italic: { style: "_" } } });
    expect(String(doc)).toBe("_hello_");
  });

  it("should preserve indentation of nested lists when trimming", () => {
    const lists = b.list
      .ul(
        "Item 1",
        "Item 2",
        b.list.ul("Nested item", b.list.ul("Deeply nested")),
        "Item 3",
      )
      .trim();
    expect(String(lists)).toBe(
      "- Item 1\n- Item 2\n  - Nested item\n    - Deeply nested\n- Item 3",
    );
  });

  it("should preserve relative indentation when trimming code blocks", () => {
    const code = b
      .code(
        `
        function hello() {
          console.log("world");
        }
      `,
      )
      .language("js")
      .trim();
    expect(String(code)).toBe(
      `\`\`\`js\nfunction hello() {\n  console.log("world");\n}\n\`\`\``,
    );
  });
});

describe("MarkdownTableBlock", () => {
  it("should render a basic table with columns and rows", () => {
    const t = b.table(
      { name: "Name", age: "Age" },
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    );
    expect(`${t}`).toBe(
      "| Name  | Age |\n| ----- | --- |\n| Alice | 30  |\n| Bob   | 25  |",
    );
  });

  it("should return null for an empty table (no columns)", () => {
    const t = b.table({});
    expect(t.render()).toBeNull();
    expect(t.isEmpty).toBe(true);
  });

  it("should render header + separator only when there are columns but no rows", () => {
    const t = b.table({ name: "Name", age: "Age" });
    expect(`${t}`).toBe("| Name | Age |\n| ---- | --- |");
    expect(t.isEmpty).toBe(false);
  });

  it("should support addRow chaining", () => {
    const t = b
      .table({ x: "X", y: "Y" })
      .addRow({ x: "1", y: "2" })
      .addRow({ x: "3", y: "4" });
    expect(`${t}`).toBe("| X | Y |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |");
  });

  it("should support addRows chaining", () => {
    const t = b
      .table({ x: "X", y: "Y" })
      .addRows({ x: "a", y: "b" }, { x: "c", y: "d" });
    expect(`${t}`).toBe("| X | Y |\n| --- | --- |\n| a | b |\n| c | d |");
  });

  it("should extend headers and row cells to be max width of overall column", () => {
    const t = b
      .table({ name: "Name", age: "Age" })
      .addRow({ name: "Alice Yamaguchi", age: "30" })
      .addRow({ name: "Bob Smith", age: "25" });
    const expected = `| Name            | Age |
| --------------- | --- |
| Alice Yamaguchi | 30  |
| Bob Smith       | 25  |`;
    expect(`${t}`).toBe(expected);
  });

  it("should truncate cell content with setColumnMaxWidth using ellipsis", () => {
    const t = b
      .table(
        { name: "Name", bio: "Bio" },
        {
          name: "Alice",
          bio: "A very long biography text",
        },
      )
      .setColumnMaxWidth("bio", 12);
    console.log(String(t), b.inspect(t));
    expect(`${t}`).toBe(
      "| Name  | Bio       |\n| ----- | --------- |\n| Alice | A very... |",
    );
  });

  it("should not split a word in the middle when truncating", () => {
    const t = b
      .table({ col: "Col" }, { col: "hello world foo" })
      .setColumnMaxWidth("col", 8);
    expect(`${t}`).toBe("| Col      |\n| -------- |\n| hello... |");
  });

  it("should keep content on one line when within maxWidth", () => {
    const t = b
      .table({ col: "Col" }, { col: "short" })
      .setColumnMaxWidth("col", 20);
    expect(`${t}`).toBe("| Col   |\n| ----- |\n| short |");
  });

  it("should truncate header name to effective width when wider than rows", () => {
    const t = b
      .table({ desc: "Full Description" }, { desc: "OK" }, { desc: "Fine" })
      .setColumnMaxWidth("desc", 10);
    // widest cell is "Fine" (4), so effective width = min(10, 4) = 4
    // "Full Description" truncated to 4 is too short for "..." so just "F..."
    expect(`${t}`).toBe("| F... |\n| ---- |\n| OK   |\n| Fine |");
  });

  it("should not truncate header when narrower than effective width", () => {
    const t = b
      .table({ n: "Name" }, { n: "Alexander" })
      .setColumnMaxWidth("n", 15);
    // widest cell = "Alexander" (9), effective = min(15, 9) = 9
    // "Name" (4) <= 9, no truncation
    expect(`${t}`).toBe("| Name      |\n| --------- |\n| Alexander |");
  });

  it("should render MarkdownBlock values in cells", () => {
    const t = b.table(
      { item: "Item", status: "Status" },
      {
        item: b.bold("Important"),
        status: b.italic("pending"),
      },
    );
    expect(`${t}`).toBe(
      "| Item          | Status    |\n| ------------- | --------- |\n| **Important** | *pending* |",
    );
  });

  it("should support string coercion via template literal", () => {
    const t = b.table({ a: "A" }, { a: "val" });
    const result = `Table: ${t}`;
    expect(result).toBe("Table: | A   |\n| --- |\n| val |");
  });

  it("should escape pipe characters in cell content", () => {
    const t = b.table({ expr: "Expr" }, { expr: "a | b" });
    expect(`${t}`).toBe("| Expr   |\n| ------ |\n| a \\| b |");
  });

  it("should render multi-line block content in cells using <br>", () => {
    const t = b.table(
      { info: "Info" },
      { info: b.para("line one", "line two") },
    );
    expect(`${t}`).toBe(
      "| Info             |\n| ---------------- |\n| line oneline two |",
    );
  });

  it("should render per-column alignment in separator", () => {
    const t = b
      .table({ a: "A", b: "B", c: "C" })
      .setColumnAlign("a", "left")
      .setColumnAlign("b", "center")
      .setColumnAlign("c", "right");
    expect(`${t}`).toBe("| A | B | C |\n| :--- | :---: | ---: |");
  });

  it("should render alignment seperators in their respective alignment", () => {
    const t = b
      .table({
        syntax: "Syntax",
        description: "Description",
        test: "Test text",
      })
      .setColumnAlign("syntax", "left")
      .setColumnAlign("description", "center")
      .setColumnAlign("test", "right")
      .addRow({
        syntax: "Header",
        description: "Title",
        test: "Here's this",
      });
    expect(`${t}`).toBe(
      "| Syntax | Description | Test text   |\n" +
        "| :---   |    :---:    |        ---: |\n" +
        "| Header | Title       | Here's this |",
    );
  });

  it("should apply default style alignment to all columns", () => {
    const t = b.table({ a: "A", b: "B" }).style("center");
    expect(`${t}`).toBe("| A | B |\n| :---: | :---: |");
  });

  it("should allow per-column alignment to override default style", () => {
    const t = b
      .table({ a: "A", b: "B" })
      .style("center")
      .setColumnAlign("a", "right");
    expect(`${t}`).toBe("| A | B |\n| ---: | :---: |");
  });

  it("should apply enforce.table.align from rendering options", () => {
    const t = b.table({ a: "A", b: "B" });
    t.setRenderingOptions({ enforce: { table: { align: "right" } } });
    expect(`${t}`).toBe("| A | B |\n| ---: | ---: |");
  });

  it("should parse and normalize a table with alignment", () => {
    const input =
      "| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |";
    const doc = b.parse(input);
    expect(String(doc)).toBe(
      "| Left | Center | Right |\n| :--- | :---:  |  ---: |\n| a    | b      | c     |",
    );
  });

  it("should parse and normalize a basic table", () => {
    const input = "| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |";
    const doc = b.parse(input);
    console.log(b.inspect(doc));
    expect(String(doc)).toBe(
      "| Name  | Age |\n| ----- | --- |\n| Alice | 30  |\n| Bob   | 25  |",
    );
  });

  it("should parse and normalize a table with inline formatting in cells", () => {
    const input =
      "| Item | Status |\n| --- | --- |\n| **Important** | *pending* |";
    const doc = b.parse(input);
    expect(String(doc)).toBe(
      "| Item          | Status    |\n| ------------- | --------- |\n| **Important** | *pending* |",
    );
  });

  it("should parse and normalize a table with escaped pipes in cells", () => {
    const input = "| Expr |\n| --- |\n| a \\| b |";
    const doc = b.parse(input);
    expect(String(doc)).toBe("| Expr   |\n| ------ |\n| a \\| b |");
  });

  it("should render disallowed block types as empty strings", () => {
    const t = b.table(
      { a: "Col A", b: "Col B", c: "Col C", d: "Col D", e: "Col E" },
      {
        a: b.heading("heading") as any,
        b: b.bq("quote") as any,
        c: b.list.ul("item") as any,
        d: b.hr() as any,
        e: b.img("alt", "url") as any,
      },
    );
    expect(`${t}`).toBe(
      "| Col A | Col B | Col C | Col D | Col E |\n| ----- | ----- | ----- | ----- | ----- |\n|       |       |       |       |       |",
    );
  });
});

describe("inspect", () => {
  it("should display block tree for a built document", () => {
    const doc = b.doc(
      b.heading("Hello"),
      b.para("text ", b.bold("bold ", b.italic("nested"))),
      b.list.ul("Item 1", "Item 2"),
    );
    const tree = b.inspect(doc);
    expect(tree).toContain("MarkdownDocument");
    expect(tree).toContain("MarkdownHeadingBlock");
    expect(tree).toContain("MarkdownBoldBlock");
    expect(tree).toContain("MarkdownItalicBlock");
    expect(tree).toContain("MarkdownUnorderedListBlock");
    expect(tree).toContain('"Hello"');
  });

  it("should display block tree for a parsed document", () => {
    const doc = b.parse("# Title\n**bold** and *italic*\n- item 1\n- item 2");
    const tree = b.inspect(doc);
    expect(tree).toContain("MarkdownDocument");
    expect(tree).toContain("MarkdownHeadingBlock");
    expect(tree).toContain("MarkdownBoldBlock");
    expect(tree).toContain("MarkdownItalicBlock");
    expect(tree).toContain("MarkdownListBlock");
  });

  it("should show metadata for blocks", () => {
    const doc = b.doc(
      b.code("x = 1").language("py"),
      b.link("https://example.com", "click"),
      b.image("pic.png", "alt"),
    );
    const tree = b.inspect(doc);
    expect(tree).toContain("language=py");
    expect(tree).toContain("url=https://example.com");
    expect(tree).toContain("src=pic.png");
  });
});
