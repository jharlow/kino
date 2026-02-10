import { describe, it, expect } from "vitest";
import { m, MarkdownHeadingLevel } from ".";

describe(m.h, () => {
  it("should render a heading", () => {
    expect(m.h("heading").render()).toBe("# heading");
  });

  it("should be string readable", () => {
    expect(`${m.h("heading")}`).toBe("# heading");
    expect(String(m.h("heading"))).toBe("# heading");
  });

  it.each<MarkdownHeadingLevel>([2, 3, 4, 5, 6])(
    "should chain level %s",
    (level) => {
      expect(`${m.h("heading").level(level)}`).toBe(
        `${"#".repeat(level)} heading`,
      );
    },
  );

  it("should chain id", () => {
    expect(`${m.h("heading").id("heading-1")}`).toBe("# heading {#heading-1}");
  });

  it("should chain id and level", () => {
    expect(`${m.h("heading").id("heading-1").level(2)}`).toBe(
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
    const document = m.doc(
      m.heading("Hello, world!"),
      m.br(),
      "This is a test2",
      m.para(
        "This is a test ",
        m.bold("bold text ", m.italic("italic text").style("_")),
        m.para(" and some more text", m.emoji("waffle")),
      ),
      m.blockquote(
        m.highlight("highlight text"),
        m.subscript("subscript text"),
        m.superscript("superscript text"),
        m.bq(
          "This is a blockquote",
          m.bq(
            "this is a nested blockquote",
            m.bq("this is a deeply nested blockquote"),
          ),
        ),
      ),
      m
        .task(true)
        .$alt(false, "This is a task")
        .$alt(true, "This is a checked task")
        .style("X"),
      m.bold("bold text", " and some more bold text ", m.italic("italic text")),
      m.image("https://www.google.com", "Google logo"),
      m.horizontalRule().style("*").count(5),
      m.para(
        "This is a second test ",
        m.link("https://www.google.com", "with a ", m.bold("bold link")),
        " and some more text with an unlabelled link ",
        m.link("https://www.google.com"),
      ),
      m.sec(
        m.h("heading 1").id("heading-1"),
        m.list("Item 1", "Item 2", "Item 3").style("*"),
        m.para(
          "This is a section ",
          m.para("This is a second section").$alt(true, "get"),
          m.footnote("this is a footnote"),
        ),
        m.section(
          m.h("heading 2"),
          m.para(
            "This is a section",
            m
              .footnote("This is a second section", "with multiple lines")
              .identifier("bignote"),
          ),
          m.section(
            m.h("heading 3"),
            m.para("This is a section"),
            m.section(
              m.h("heading 4"),
              m.para("This is a section"),
              m.h("heading 4"),
              m.para("This is a section"),
              m.h("heading 2").level(2),
              m.para("This is a section"),
              m.section(
                m.h("heading 5"),
                m.para("This is a section"),
                m.section(
                  m.h("heading 6"),
                  m.para(
                    "This is a section",
                    m.footnote("This is a third footnote"),
                  ),
                  m.section(
                    m.h("heading ", m.strike("7 strikethrough text")),
                    m.para("This is a section"),
                  ),
                ),
              ),
              m.code(hello.toString()).language("js"),
            ),
          ),
        ),
      ),
    );
    expect(`${document}`).toBe(
      `# Hello, world!

This is a test2
This is a test **bold text _italic text_** and some more text:waffle:
> ==highlight text==
> ~subscript text~
> ^superscript text^
>> This is a blockquote
>>> this is a nested blockquote
>>>> this is a deeply nested blockquote
- [X] This is a checked task
**bold text and some more bold text *italic text***
![Google logo](https://www.google.com)

*****

This is a second test [with a **bold link**](https://www.google.com) and some more text with an unlabelled link <https://www.google.com>
# heading 1 {#heading-1}
* Item 1
* Item 2
* Item 3
This is a section get[^1]
## heading 2
This is a section[^bignote]
### heading 3
This is a section
#### heading 4
This is a section
#### heading 4
This is a section
## heading 2
This is a section
##### heading 5
This is a section
###### heading 6
This is a section[^2]
###### heading ~~7 strikethrough text~~
This is a section
\`\`\`js
function hello() {
    console.log("hello world");
    return "hello world";
  }
\`\`\`

[^1]: this is a footnote
[^bignote]: This is a second section
with multiple lines
[^2]: This is a third footnote`,
    );
  });
  it("should render a string readable section", () => {
    const section = m.sec("This is a section");
    expect(`${section}`).toBe("This is a section");
    expect(String(section)).toBe("This is a section");
  });
});

describe("MarkdownFootnoteBlock", () => {
  it("should auto-assign identifier and render inline reference with definition", () => {
    const document = m.doc(m.para("Some text", m.footnote("footnote content")));
    expect(`${document}`).toBe(
      `Some text[^1]

[^1]: footnote content`,
    );
  });

  it("should use a manually set identifier", () => {
    const document = m.doc(
      m.para("Some text", m.footnote("footnote content").identifier("abc")),
    );
    expect(`${document}`).toBe(
      `Some text[^abc]

[^abc]: footnote content`,
    );
  });

  it("should auto-assign multiple footnotes incrementally", () => {
    const document = m.doc(
      m.para(
        "First",
        m.footnote("first note"),
        " Second",
        m.footnote("second note"),
      ),
    );
    expect(`${document}`).toBe(
      `First[^1] Second[^2]

[^1]: first note
[^2]: second note`,
    );
  });

  it("should skip already-identified footnotes during auto-assign", () => {
    const document = m.doc(
      m.para(
        "A",
        m.footnote("manual note").identifier("custom"),
        " B",
        m.footnote("auto note"),
      ),
    );
    expect(`${document}`).toBe(
      `A[^custom] B[^1]

[^custom]: manual note
[^1]: auto note`,
    );
  });

  it("should collect footnotes from nested sections", () => {
    const document = m.doc(
      m.sec(m.sec(m.para("Deep", m.footnote("deep note")))),
    );
    expect(`${document}`).toBe(
      `Deep[^1]

[^1]: deep note`,
    );
  });

  it("should collect footnotes from nested sections with multiple lines", () => {
    const document = m.doc(
      m.sec(
        m.sec(m.para("Deep", m.footnote("deep note").identifier("deepnote"))),
      ),
    );
    expect(`${document}`).toBe(
      `Deep[^deepnote]

[^deepnote]: deep note`,
    );
  });

  it("should allow multi-line footnotes", () => {
    const document = m.doc(
      m.sec(
        m.para("Deep", m.footnote("deep note", m.b("with multiple lines"))),
      ),
    );
    expect(`${document}`).toBe(
      `Deep[^1]

[^1]: deep note
**with multiple lines**`,
    );
  });

  it("should render no definitions section when no footnotes exist", () => {
    const document = m.doc(m.para("No footnotes here"));
    expect(`${document}`).toBe("No footnotes here");
  });
});
