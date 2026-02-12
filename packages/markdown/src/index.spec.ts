import { describe, it, expect } from "vitest";
import { b, MarkdownHeadingLevel } from ".";

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

describe("chaining", () => {
  it("should chain bold", () => {
    const pronoun: string = "His";
    const name: string | null = null;
    const gender = pronoun === "His" ? "man" : "woman";
    const t =
      b.md`${pronoun} name was ${name} and he was a good ${gender}. He liked pie.`
        .if(true)
        .b()
        .i()
        .default("Unidentified person");
    console.log(String(t.setRenderingOptions({})));
  });
});

describe.only("MarkdownDocument", () => {
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
      b.horizontalRule().style("*").count(5),
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
          b.para("This is a second section").if(false).default("get"),
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
              ),
              b.code(hello.toString()).language("js"),
            ),
          ),
        ),
      ),
    );
    console.log(`${document}`);
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
