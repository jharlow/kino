import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownUnorderedListItemBlock", () => {
  it("should render with default - style", () => {
    expect(String(b.listItem.unordered("item"))).toBe("- item");
  });

  it("should render with * style", () => {
    expect(String(b.listItem.unordered("item").style("*"))).toBe("* item");
  });

  it("should render with + style", () => {
    expect(String(b.listItem.unordered("item").style("+"))).toBe("+ item");
  });

  it("should render with - style explicitly", () => {
    expect(String(b.listItem.unordered("item").style("-"))).toBe("- item");
  });

  it("should return null if empty", () => {
    expect(b.listItem.unordered().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.listItem.unordered().isEmpty).toBe(true);
    expect(b.listItem.unordered("item").isEmpty).toBe(false);
  });

  it("should be creatable via b.listItem.u alias", () => {
    expect(String(b.listItem.u("item"))).toBe("- item");
  });

  it("should be creatable via b.li.unordered alias", () => {
    expect(String(b.li.unordered("item"))).toBe("- item");
  });

  it("should be creatable via b.li.u alias", () => {
    expect(String(b.li.u("item"))).toBe("- item");
  });

  it("should be coercible via String()", () => {
    expect(String(b.listItem.unordered("item"))).toBe("- item");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.listItem.unordered("item")}`).toBe("- item");
  });

  it("should accept nested inline blocks", () => {
    expect(String(b.listItem.unordered("hello ", b.bold("world")))).toBe(
      "- hello **world**",
    );
  });

  it("should include style in metadata tags when set", () => {
    expect(
      b.listItem.unordered("item").style("*").getMetadataTags(),
    ).toContain("style=*");
  });

  it("should include style=+ in metadata tags when set", () => {
    expect(
      b.listItem.unordered("item").style("+").getMetadataTags(),
    ).toContain("style=+");
  });

  it("should have no metadata tags with default style", () => {
    expect(b.listItem.unordered("item").getMetadataTags()).toEqual([]);
  });

  it("should respect enforce.unorderedListItem option", () => {
    const block = b.listItem.unordered("item");
    expect(
      block.render({ enforce: { unorderedListItem: { style: "*" } } }),
    ).toBe("* item");
  });

  it("should let enforce override explicit style", () => {
    const block = b.listItem.unordered("item").style("+");
    expect(
      block.render({ enforce: { unorderedListItem: { style: "*" } } }),
    ).toBe("* item");
  });

  it("should use explicit style when no enforce is set", () => {
    const block = b.listItem.unordered("item").style("+");
    expect(block.render()).toBe("+ item");
  });
});
