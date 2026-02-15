import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownBoldBlock", () => {
  it("should render bold with default ** style", () => {
    expect(String(b.bold("text"))).toBe("**text**");
  });

  it("should render bold with __ style", () => {
    expect(String(b.bold("text").style("__"))).toBe("__text__");
  });

  it("should render bold with ** style explicitly", () => {
    expect(String(b.bold("text").style("**"))).toBe("**text**");
  });

  it("should return null for empty content", () => {
    expect(b.bold().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.bold().isEmpty).toBe(true);
    expect(b.bold("text").isEmpty).toBe(false);
  });

  it("should accept nested inline blocks", () => {
    expect(String(b.bold("hello ", b.italic("world")))).toBe(
      "**hello *world***",
    );
  });

  it("should be coercible via template literal", () => {
    expect(`${b.bold("text")}`).toBe("**text**");
  });

  it("should be coercible via String()", () => {
    expect(String(b.bold("text"))).toBe("**text**");
  });

  it("should include style in metadata tags when set", () => {
    expect(b.bold("text").style("__").getMetadataTags()).toContain(
      "style=__",
    );
  });

  it("should have no metadata tags with default style", () => {
    expect(b.bold("text").getMetadataTags()).toEqual([]);
  });

  it("should be creatable via b.b alias", () => {
    expect(String(b.b("text"))).toBe("**text**");
  });

  it("should respect enforce.bold option", () => {
    const block = b.bold("text");
    expect(block.render({ enforce: { bold: { style: "__" } } })).toBe(
      "__text__",
    );
  });

  it("should let enforce override explicit style", () => {
    const block = b.bold("text").style("__");
    expect(block.render({ enforce: { bold: { style: "**" } } })).toBe(
      "**text**",
    );
  });

  it("should be chainable from paragraph via .b()", () => {
    expect(String(b.p("text").b())).toBe("**text**");
  });

  it("should be chainable from paragraph via .bold()", () => {
    expect(String(b.p("text").bold())).toBe("**text**");
  });
});
