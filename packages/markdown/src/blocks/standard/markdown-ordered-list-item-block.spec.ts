import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownOrderedListItemBlock", () => {
  it("should render with index 1", () => {
    expect(String(b.listItem.ordered(1, "first"))).toBe("1. first");
  });

  it("should render with index 2", () => {
    expect(String(b.listItem.ordered(2, "second"))).toBe("2. second");
  });

  it("should render with index 10", () => {
    expect(String(b.listItem.ordered(10, "tenth"))).toBe("10. tenth");
  });

  it("should allow chaining index", () => {
    expect(String(b.listItem.ordered(1, "item").index(5))).toBe("5. item");
  });

  it("should return null if empty", () => {
    expect(b.listItem.ordered(1).render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.listItem.ordered(1).isEmpty).toBe(true);
    expect(b.listItem.ordered(1, "item").isEmpty).toBe(false);
  });

  it("should be creatable via b.listItem.o alias", () => {
    expect(String(b.listItem.o(1, "item"))).toBe("1. item");
  });

  it("should be creatable via b.li.ordered alias", () => {
    expect(String(b.li.ordered(1, "item"))).toBe("1. item");
  });

  it("should be creatable via b.li.o alias", () => {
    expect(String(b.li.o(1, "item"))).toBe("1. item");
  });

  it("should be coercible via String()", () => {
    expect(String(b.listItem.ordered(1, "item"))).toBe("1. item");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.listItem.ordered(1, "item")}`).toBe("1. item");
  });

  it("should accept nested inline blocks", () => {
    expect(String(b.listItem.ordered(1, "hello ", b.bold("world")))).toBe(
      "1. hello **world**",
    );
  });

  it("should include index in metadata tags", () => {
    expect(b.listItem.ordered(3, "item").getMetadataTags()).toContain(
      "index=3",
    );
  });

  it("should reflect updated index in metadata tags", () => {
    expect(b.listItem.ordered(1, "item").index(7).getMetadataTags()).toContain(
      "index=7",
    );
  });

  it("should return index as chainable", () => {
    const item = b.listItem.ordered(1, "item");
    const result = item.index(5);
    expect(result).toBe(item);
  });
});
