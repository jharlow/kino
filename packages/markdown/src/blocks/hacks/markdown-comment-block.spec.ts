import { describe, it, expect } from "vitest";
import { b, MarkdownCommentBlock } from "../../index";

describe("MarkdownCommentBlock", () => {
  it("should render a comment with [content]: # syntax", () => {
    expect(String(b.comment("hello"))).toBe("[hello]: #");
  });

  it("should render null if empty", () => {
    expect(b.comment().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.comment().isEmpty).toBe(true);
    expect(b.comment("text").isEmpty).toBe(false);
  });

  it("should be creatable via b.hiddenFromHumans alias", () => {
    expect(String(b.hiddenFromHumans("text"))).toBe("[text]: #");
  });

  it("should be coercible via String()", () => {
    expect(String(b.comment("text"))).toBe("[text]: #");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.comment("text")}`).toBe("[text]: #");
  });

  it("should render inline content within the comment", () => {
    expect(String(b.comment("some ", b.p("inline")))).toBe("[some inline]: #");
  });

  it("should be an instance of MarkdownCommentBlock", () => {
    const block = b.comment("text");
    expect(block).toBeInstanceOf(MarkdownCommentBlock);
  });

  it("should be creatable via the .comment() method on inline blocks", () => {
    const result = b.p("text").comment();
    expect(result).toBeInstanceOf(MarkdownCommentBlock);
    expect(result.render()).toBe("[text]: #");
  });

  it("should be creatable via the .hiddenFromHumans() method on inline blocks", () => {
    const result = b.p("text").hiddenFromHumans();
    expect(result).toBeInstanceOf(MarkdownCommentBlock);
    expect(result.render()).toBe("[text]: #");
  });
});
