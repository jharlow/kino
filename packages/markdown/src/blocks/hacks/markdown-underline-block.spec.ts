import { describe, it, expect } from "vitest";
import { b, MarkdownUnderlineBlock } from "../../index";

describe("MarkdownUnderlineBlock", () => {
  it("should render with <ins> tags", () => {
    expect(String(b.underline("hello"))).toBe("<ins>hello</ins>");
  });

  it("should render null if empty", () => {
    expect(b.underline().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.underline().isEmpty).toBe(true);
    expect(b.underline("text").isEmpty).toBe(false);
  });

  it("should be creatable via b.u alias", () => {
    expect(String(b.u("text"))).toBe("<ins>text</ins>");
  });

  it("should be coercible via String()", () => {
    expect(String(b.underline("text"))).toBe("<ins>text</ins>");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.underline("text")}`).toBe("<ins>text</ins>");
  });

  it("should render inline content within the underline", () => {
    expect(String(b.underline("some ", b.p("inline")))).toBe(
      "<ins>some inline</ins>",
    );
  });

  it("should be an instance of MarkdownUnderlineBlock", () => {
    const block = b.underline("text");
    expect(block).toBeInstanceOf(MarkdownUnderlineBlock);
  });

  it("should be creatable via the .underline() method on inline blocks", () => {
    const result = b.p("text").underline();
    expect(result).toBeInstanceOf(MarkdownUnderlineBlock);
    expect(result.render()).toBe("<ins>text</ins>");
  });

  it("should be creatable via the .u() method on inline blocks", () => {
    const result = b.p("text").u();
    expect(result).toBeInstanceOf(MarkdownUnderlineBlock);
    expect(result.render()).toBe("<ins>text</ins>");
  });

  it("should render nested bold inside underline", () => {
    expect(String(b.underline(b.bold("important")))).toBe(
      "<ins>**important**</ins>",
    );
  });

  it("should render nested italic inside underline", () => {
    expect(String(b.underline(b.italic("emphasis")))).toBe(
      "<ins>*emphasis*</ins>",
    );
  });
});
