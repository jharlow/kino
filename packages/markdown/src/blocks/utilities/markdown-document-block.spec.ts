import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownDocument", () => {
  it("should be creatable via b.document()", () => {
    expect(String(b.document("hello"))).toBe("hello");
  });

  it("should be creatable via b.doc()", () => {
    expect(String(b.doc("hello"))).toBe("hello");
  });

  it("should be creatable via b.d()", () => {
    expect(String(b.d("hello"))).toBe("hello");
  });

  it("should accept multiple string lines", () => {
    expect(String(b.doc("line one", "line two"))).toBe("line one\nline two");
  });

  it("should accept inline blocks", () => {
    expect(String(b.doc(b.bold("bold")))).toBe("**bold**");
  });

  it("should accept line blocks", () => {
    expect(String(b.doc(b.p("paragraph")))).toBe("paragraph");
  });

  it("should accept multiline blocks", () => {
    expect(String(b.doc(b.bq("quoted")))).toBe("> quoted");
  });

  it("should render heading at level 1 at the top level", () => {
    expect(String(b.doc(b.h("Title")))).toBe("# Title");
  });

  it("should render heading at level 1 for a section inside the document", () => {
    expect(String(b.doc(b.sec(b.h("Section Title"))))).toBe(
      "## Section Title",
    );
  });

  it("should adjust heading levels based on section nesting depth", () => {
    const doc = b.doc(
      b.h("Top Level"),
      b.sec(
        b.h("Section"),
        b.sec(b.h("Subsection"), b.sec(b.h("Sub-subsection"))),
      ),
    );
    expect(String(doc)).toBe(
      "# Top Level\n## Section\n### Subsection\n#### Sub-subsection",
    );
  });

  it("should cap heading level at 6 for deeply nested sections", () => {
    const doc = b.doc(
      b.sec(
        b.sec(
          b.sec(b.sec(b.sec(b.sec(b.h("Level 7"), "body")))),
        ),
      ),
    );
    expect(String(doc)).toBe("###### Level 7\nbody");
  });

  it("should handle multiple sibling sections at the same depth", () => {
    const doc = b.doc(
      b.sec(b.h("First"), "content one"),
      b.sec(b.h("Second"), "content two"),
      b.sec(b.h("Third"), "content three"),
    );
    expect(String(doc)).toBe(
      "## First\ncontent one\n## Second\ncontent two\n## Third\ncontent three",
    );
  });

  it("should collect footnotes and auto-assign numeric IDs", () => {
    const doc = b.doc(
      b.para("Some text", b.footnote("footnote content")),
    );
    expect(String(doc)).toBe(
      "Some text[^1]\n\n[^1]: footnote content",
    );
  });

  it("should auto-assign multiple footnotes incrementally", () => {
    const doc = b.doc(
      b.para(
        "First",
        b.footnote("first note"),
        " Second",
        b.footnote("second note"),
      ),
    );
    expect(String(doc)).toBe(
      "First[^1] Second[^2]\n\n[^1]: first note\n[^2]: second note",
    );
  });

  it("should skip already-identified footnotes during auto-assign", () => {
    const doc = b.doc(
      b.para(
        "A",
        b.footnote("manual note").identifier("custom"),
        " B",
        b.footnote("auto note"),
      ),
    );
    expect(String(doc)).toBe(
      "A[^custom] B[^1]\n\n[^custom]: manual note\n[^1]: auto note",
    );
  });

  it("should collect footnotes from nested sections", () => {
    const doc = b.doc(
      b.sec(b.sec(b.para("Deep", b.footnote("deep note")))),
    );
    expect(String(doc)).toBe("Deep[^1]\n\n[^1]: deep note");
  });

  it("should render no definitions when there are no footnotes", () => {
    expect(String(b.doc("No footnotes here"))).toBe("No footnotes here");
  });

  it("should handle multi-line footnotes", () => {
    const doc = b.doc(
      b.para("Text", b.footnote("line one", b.bold("line two"))),
    );
    expect(String(doc)).toBe(
      "Text[^1]\n\n[^1]: line one\n**line two**",
    );
  });

  it("should report isEmpty correctly when empty", () => {
    expect(b.doc().isEmpty).toBe(true);
  });

  it("should report isEmpty correctly when containing content", () => {
    expect(b.doc("text").isEmpty).toBe(false);
  });

  it("should report isEmpty when all children are empty", () => {
    expect(b.doc(b.p(), b.sec()).isEmpty).toBe(true);
  });

  it("should be coercible via String()", () => {
    expect(String(b.doc("hello"))).toBe("hello");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.doc("hello")}`).toBe("hello");
  });

  it("should return line count via Symbol.toPrimitive('number')", () => {
    expect(+b.doc("one", "two", "three")).toBe(3);
  });

  it("should keep content when emptyIf condition is truthy", () => {
    expect(String(b.doc("text").emptyIf(true))).toBe("text");
  });

  it("should clear content when emptyIf condition is falsy", () => {
    expect(b.doc("text").emptyIf(false).isEmpty).toBe(true);
  });

  it("should set default content when empty via defaultIfEmpty()", () => {
    expect(String(b.doc().defaultIfEmpty("fallback"))).toBe("fallback");
  });

  it("should not override existing content via defaultIfEmpty()", () => {
    expect(String(b.doc("text").defaultIfEmpty("fallback"))).toBe("text");
  });

  it("should return null from render() when empty", () => {
    expect(b.doc().render()).toBeNull();
  });

  it("should embed a parsed document and adjust heading levels", () => {
    const inner = b.parse("# A\n## B\ntext");
    const outer = b.doc(b.sec(b.h("Top"), inner));
    expect(String(outer)).toBe(
      "## Top\n### A\n#### B\ntext",
    );
  });

  it("should embed the same parsed document in multiple locations", () => {
    const inner = b.parse("# A\n## B\ntext");
    const outer = b.doc(
      b.sec(b.h("Top"), inner, b.sec(inner)),
      inner,
    );
    expect(String(outer)).toBe(
      "## Top\n### A\n#### B\ntext\n#### A\n##### B\ntext\n## A\n### B\ntext",
    );
  });

  it("should embed parsed document with footnotes in a host document", () => {
    const inner = b.parse("Some text[^1]\n\n[^1]: footnote content");
    const outer = b.doc(
      b.para("Host text", b.footnote("host footnote")),
      b.sec(b.h("Section"), inner),
    );
    expect(String(outer)).toBe(
      "Host text[^1]\n## Section\nSome text[^2]\n\n[^1]: host footnote\n[^2]: footnote content",
    );
  });

  it("should handle a complex nested structure with sections, headings, and footnotes", () => {
    const doc = b.doc(
      b.h("Document Title"),
      b.para("Intro text", b.footnote("intro note")),
      b.sec(
        b.h("Chapter 1"),
        b.para("Chapter content"),
        b.sec(
          b.h("Section 1.1"),
          b.para("Section content", b.footnote("section note")),
        ),
      ),
      b.sec(
        b.h("Chapter 2"),
        b.para("Another chapter"),
      ),
    );
    expect(String(doc)).toBe(
      "# Document Title\nIntro text[^1]\n## Chapter 1\nChapter content\n### Section 1.1\nSection content[^2]\n## Chapter 2\nAnother chapter\n\n[^1]: intro note\n[^2]: section note",
    );
  });

  it("should handle newlineStrategy 'between_blocks'", () => {
    const doc = b.doc("one", "two", "three").setRenderingOptions({
      newlineStrategy: "between_blocks",
    });
    expect(String(doc)).toBe("one\n\ntwo\n\nthree");
  });

  it("should handle newlineStrategy 'before_and_after_heading'", () => {
    const doc = b.doc("intro", b.h("Title"), "body").setRenderingOptions({
      newlineStrategy: "before_and_after_heading",
    });
    expect(String(doc)).toBe("intro\n\n# Title\n\nbody");
  });
});
