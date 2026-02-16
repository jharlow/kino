import { describe, it, expect } from "vitest";
import { b } from "../../index";
import { MarkdownHeadingLevel } from "./markdown-heading-block";

describe("MarkdownHeadingBlock", () => {
  it("should render a default level-1 heading", () => {
    expect(b.h("Title").render()).toBe("# Title");
  });

  it("should be coercible via String()", () => {
    expect(String(b.h("Title"))).toBe("# Title");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.h("Title")}`).toBe("# Title");
  });

  it.each<MarkdownHeadingLevel>([1, 2, 3, 4, 5, 6])(
    "should render level %s",
    (level) => {
      expect(String(b.h("Title").level(level))).toBe(
        `${"#".repeat(level)} Title`,
      );
    },
  );

  it("should chain level via l() alias", () => {
    expect(String(b.h("Title").l(3))).toBe("### Title");
  });

  it("should set identifier via identifier()", () => {
    expect(String(b.h("Title").identifier("my-id"))).toBe("# Title {#my-id}");
  });

  it("should set identifier via id() alias", () => {
    expect(String(b.h("Title").id("my-id"))).toBe("# Title {#my-id}");
  });

  it("should combine level and identifier", () => {
    expect(String(b.h("Title").level(2).id("sec"))).toBe("## Title {#sec}");
  });

  it("should only set identifier once (first wins)", () => {
    expect(String(b.h("Title").id("first").id("second"))).toBe(
      "# Title {#first}",
    );
  });

  it("should only set level once without allowReassignment", () => {
    expect(String(b.h("Title").level(2).level(4))).toBe("## Title");
  });

  it("should not allow reassignment of user-set level even with allowReassignment", () => {
    expect(
      String(b.h("Title").level(2).level(4, { allowReassignment: true })),
    ).toBe("## Title");
  });

  it("should return null for empty heading", () => {
    expect(b.h().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.h().isEmpty).toBe(true);
    expect(b.h("Title").isEmpty).toBe(false);
  });

  it("should accept inline blocks as content", () => {
    expect(String(b.h("Hello ", b.bold("world")))).toBe("# Hello **world**");
  });

  it("should include metadata tags", () => {
    const h = b.h("Title").level(3).id("my-id");
    const tags = h.getMetadataTags();
    expect(tags).toContain("identifier=my-id");
    expect(tags).toContain("level=3");
  });

  it("should have metadata tags for identifier only", () => {
    const h = b.h("Title").id("x");
    expect(h.getMetadataTags()).toContain("identifier=x");
  });

  it("should have no metadata tags when using defaults", () => {
    const h = b.h("Title");
    expect(h.getMetadataTags()).toEqual([]);
  });

  it("should be creatable via heading() alias", () => {
    expect(String(b.heading("Title"))).toBe("# Title");
  });

  it("should be creatable via head() alias", () => {
    expect(String(b.head("Title"))).toBe("# Title");
  });
});
