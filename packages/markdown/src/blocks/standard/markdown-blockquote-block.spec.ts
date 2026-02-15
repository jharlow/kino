import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownBlockquoteBlock", () => {
  it("should prefix a single line with > ", () => {
    expect(String(b.blockquote("hello"))).toBe("> hello");
  });

  it("should prefix multiple lines with > ", () => {
    expect(String(b.blockquote("line one", "line two"))).toBe(
      "> line one\n> line two",
    );
  });

  it("should return null if empty", () => {
    expect(b.blockquote().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.blockquote().isEmpty).toBe(true);
    expect(b.blockquote("text").isEmpty).toBe(false);
  });

  it("should be creatable via b.block alias", () => {
    expect(String(b.block("text"))).toBe("> text");
  });

  it("should be creatable via b.bq alias", () => {
    expect(String(b.bq("text"))).toBe("> text");
  });

  it("should be coercible via String()", () => {
    expect(String(b.blockquote("text"))).toBe("> text");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.blockquote("text")}`).toBe("> text");
  });

  it("should handle nested blockquotes with >> (no space between >)", () => {
    const nested = b.blockquote(
      b.blockquote("inner"),
    );
    expect(String(nested)).toBe(">> inner");
  });

  it("should handle deeply nested blockquotes (3 levels)", () => {
    const deep = b.blockquote(
      b.blockquote(
        b.blockquote("deep"),
      ),
    );
    expect(String(deep)).toBe(">>> deep");
  });

  it("should handle 4 levels of nesting", () => {
    const deep = b.blockquote(
      b.blockquote(
        b.blockquote(
          b.blockquote("very deep"),
        ),
      ),
    );
    expect(String(deep)).toBe(">>>> very deep");
  });

  it("should handle mixed content with nested blockquote", () => {
    const mixed = b.blockquote(
      "before",
      b.blockquote("nested"),
      "after",
    );
    expect(String(mixed)).toBe("> before\n>> nested\n> after");
  });

  it("should accept inline blocks as content", () => {
    expect(String(b.blockquote(b.bold("important")))).toBe(
      "> **important**",
    );
  });

  it("should handle multiline content from paragraph blocks", () => {
    expect(
      String(b.blockquote(b.p("line one"), b.p("line two"))),
    ).toBe("> line one\n> line two");
  });

  it("should handle nested blockquote with multiple lines", () => {
    const nested = b.blockquote(
      b.blockquote("inner one", "inner two"),
    );
    expect(String(nested)).toBe(">> inner one\n>> inner two");
  });

  it("should handle mixed nesting with multiple lines", () => {
    const mixed = b.blockquote(
      "top",
      b.blockquote("nested one", "nested two"),
    );
    expect(String(mixed)).toBe(
      "> top\n>> nested one\n>> nested two",
    );
  });
});
