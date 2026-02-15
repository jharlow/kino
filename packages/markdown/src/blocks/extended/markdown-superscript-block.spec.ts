import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownSuperscriptBlock", () => {
  it("should render superscript with ^ delimiters", () => {
    expect(String(b.superscript("text"))).toBe("^text^");
  });

  it("should have no style options", () => {
    expect(b.superscript("text").getMetadataTags()).toEqual([]);
  });

  it("should return null for empty content", () => {
    expect(b.superscript().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.superscript().isEmpty).toBe(true);
    expect(b.superscript("text").isEmpty).toBe(false);
  });

  it("should be creatable via b.superscript()", () => {
    expect(String(b.superscript("text"))).toBe("^text^");
  });

  it("should be creatable via b.sup()", () => {
    expect(String(b.sup("text"))).toBe("^text^");
  });

  it("should be chainable from paragraph via .sup()", () => {
    expect(String(b.p("text").sup())).toBe("^text^");
  });

  it("should be chainable from paragraph via .superscript()", () => {
    expect(String(b.p("text").superscript())).toBe("^text^");
  });

  it("should accept nested inline content", () => {
    expect(String(b.superscript("hello ", b.bold("world")))).toBe(
      "^hello **world**^",
    );
  });

  it("should be coercible via String()", () => {
    expect(String(b.superscript("text"))).toBe("^text^");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.superscript("text")}`).toBe("^text^");
  });
});
