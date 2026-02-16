import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownSectionBlock", () => {
  it("should be creatable via b.section()", () => {
    expect(String(b.section("hello"))).toBe("hello");
  });

  it("should be creatable via b.sec()", () => {
    expect(String(b.sec("hello"))).toBe("hello");
  });

  it("should be creatable via b.s()", () => {
    expect(String(b.s("hello"))).toBe("hello");
  });

  it("should accept multiple string lines", () => {
    expect(String(b.sec("line one", "line two", "line three"))).toBe(
      "line one\nline two\nline three",
    );
  });

  it("should accept inline blocks as content", () => {
    expect(String(b.sec(b.bold("bold text")))).toBe("**bold text**");
  });

  it("should accept line blocks as content", () => {
    expect(String(b.sec(b.p("paragraph text")))).toBe("paragraph text");
  });

  it("should accept multiline blocks as content", () => {
    expect(String(b.sec(b.bq("quoted")))).toBe("> quoted");
  });

  it("should accept mixed content types", () => {
    expect(
      String(b.sec("plain", b.bold("bold"), b.p("para"), b.bq("quote"))),
    ).toBe("plain\n**bold**\npara\n> quote");
  });

  it("should render headings at level 1 when section is at depth 0", () => {
    expect(String(b.sec(b.h("Title"), "body"))).toBe("# Title\nbody");
  });

  it("should render headings at level 2 when section is nested one deep", () => {
    const outer = b.sec(b.sec(b.h("Nested Title"), "body"));
    expect(String(outer)).toBe("## Nested Title\nbody");
  });

  it("should render headings at level 3 when section is nested two deep", () => {
    const outer = b.sec(b.sec(b.sec(b.h("Deep Title"), "body")));
    expect(String(outer)).toBe("### Deep Title\nbody");
  });

  it("should cap heading level at 6 for deeply nested sections", () => {
    const deep = b.sec(
      b.sec(b.sec(b.sec(b.sec(b.sec(b.sec(b.h("Very Deep"), "body")))))),
    );
    expect(String(deep)).toBe("###### Very Deep\nbody");
  });

  it("should adjust sibling sections at the same depth", () => {
    const doc = b.sec(
      b.sec(b.h("First Section"), "body one"),
      b.sec(b.h("Second Section"), "body two"),
    );
    expect(String(doc)).toBe(
      "## First Section\nbody one\n## Second Section\nbody two",
    );
  });

  it("should adjust headings in mixed nesting levels", () => {
    const doc = b.sec(
      b.h("Top"),
      b.sec(b.h("Child"), b.sec(b.h("Grandchild"))),
    );
    expect(String(doc)).toBe("# Top\n## Child\n### Grandchild");
  });

  it("should collect footnotes and auto-assign numeric IDs", () => {
    const sec = b.sec(b.para("Some text", b.footnote("footnote content")));
    expect(String(sec)).toBe("Some text[^1]\n\n[^1]: footnote content");
  });

  it("should auto-assign multiple footnotes incrementally", () => {
    const sec = b.sec(
      b.para(
        "First",
        b.footnote("first note"),
        " Second",
        b.footnote("second note"),
      ),
    );
    expect(String(sec)).toBe(
      "First[^1] Second[^2]\n\n[^1]: first note\n[^2]: second note",
    );
  });

  it("should skip already-identified footnotes during auto-assign", () => {
    const sec = b.sec(
      b.para(
        "A",
        b.footnote("manual note").identifier("custom"),
        " B",
        b.footnote("auto note"),
      ),
    );
    expect(String(sec)).toBe(
      "A[^custom] B[^1]\n\n[^custom]: manual note\n[^1]: auto note",
    );
  });

  it("should collect footnotes from deeply nested content", () => {
    const sec = b.sec(b.sec(b.sec(b.para("Deep", b.footnote("deep note")))));
    expect(String(sec)).toBe("Deep[^1]\n\n[^1]: deep note");
  });

  it("should render no definitions when no footnotes exist", () => {
    expect(String(b.sec("No footnotes here"))).toBe("No footnotes here");
  });

  it("should collect footnotes from inline blocks within line blocks", () => {
    const sec = b.sec(b.p("text ", b.bold("bold"), b.footnote("fn content")));
    expect(String(sec)).toBe("text **bold**[^1]\n\n[^1]: fn content");
  });

  it("should report isEmpty correctly when empty", () => {
    expect(b.sec().isEmpty).toBe(true);
  });

  it("should report isEmpty correctly when containing content", () => {
    expect(b.sec("text").isEmpty).toBe(false);
  });

  it("should report isEmpty when all children are empty", () => {
    expect(b.sec(b.p(), b.sec()).isEmpty).toBe(true);
  });

  it("should be coercible via String()", () => {
    expect(String(b.sec("hello"))).toBe("hello");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.sec("hello")}`).toBe("hello");
  });

  it("should return line count via Symbol.toPrimitive('number')", () => {
    const sec = b.sec("one", "two", "three");
    expect(+sec).toBe(3);
  });

  it("should return 0 line count for empty section", () => {
    expect(+b.sec()).toBe(0);
  });

  it("should clear content when emptyIf condition is truthy", () => {
    expect(b.sec("text").emptyIf(true).isEmpty).toBe(true);
  });

  it("should keep content when emptyIf condition is falsy", () => {
    expect(String(b.sec("text").emptyIf(false))).toBe("text");
  });

  it("should set default content when empty via defaultIfEmpty()", () => {
    expect(String(b.sec().defaultIfEmpty("fallback"))).toBe("fallback");
  });

  it("should not override existing content via defaultIfEmpty()", () => {
    expect(String(b.sec("text").defaultIfEmpty("fallback"))).toBe("text");
  });

  it("should return null from render() when empty", () => {
    expect(b.sec().render()).toBeNull();
  });

  it("should handle newlineStrategy 'between_blocks'", () => {
    const sec = b.sec("one", "two", "three").setRenderingOptions({
      newlineStrategy: "between_blocks",
    });
    expect(String(sec)).toBe("one\n\ntwo\n\nthree");
  });

  it("should handle newlineStrategy 'before_and_after_heading'", () => {
    const sec = b.sec("intro", b.h("Title"), "body").setRenderingOptions({
      newlineStrategy: "before_and_after_heading",
    });
    expect(String(sec)).toBe("intro\n\n# Title\n\nbody");
  });
});
