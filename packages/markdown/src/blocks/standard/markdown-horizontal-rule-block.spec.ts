import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownHorizontalRuleBlock", () => {
  it("should render default \\n---\\n", () => {
    expect(b.hr().render()).toBe("\n---\n");
  });

  it("should render with - style", () => {
    expect(b.hr().style("-").render()).toBe("\n---\n");
  });

  it("should render with * style", () => {
    expect(b.hr().style("*").render()).toBe("\n***\n");
  });

  it("should render with _ style", () => {
    expect(b.hr().style("_").render()).toBe("\n___\n");
  });

  it("should render with custom count", () => {
    expect(b.hr().count(5).render()).toBe("\n-----\n");
  });

  it("should ignore count less than 3", () => {
    expect(b.hr().count(2).render()).toBe("\n---\n");
  });

  it("should ignore count of 1", () => {
    expect(b.hr().count(1).render()).toBe("\n---\n");
  });

  it("should combine style and count", () => {
    expect(b.hr().style("*").count(5).render()).toBe("\n*****\n");
  });

  it("should respect enforce.horizontalRule", () => {
    expect(
      b.hr().render({ enforce: { horizontalRule: { style: "*" } } }),
    ).toBe("\n***\n");
  });

  it("should let enforce override explicit style", () => {
    expect(
      b.hr().style("_").render({ enforce: { horizontalRule: { style: "*" } } }),
    ).toBe("\n***\n");
  });

  it("should be creatable via b.horizontalRule()", () => {
    expect(b.horizontalRule().render()).toBe("\n---\n");
  });

  it("should be creatable via b.hr()", () => {
    expect(b.hr().render()).toBe("\n---\n");
  });

  it("should include style in metadata tags when set", () => {
    expect(b.hr().style("*").getMetadataTags()).toContain("style=*");
  });

  it("should include count in metadata tags when set", () => {
    expect(b.hr().count(5).getMetadataTags()).toContain("count=5");
  });

  it("should include both style and count in metadata tags", () => {
    const tags = b.hr().style("*").count(5).getMetadataTags();
    expect(tags).toContain("style=*");
    expect(tags).toContain("count=5");
  });

  it("should have no metadata tags when using defaults", () => {
    expect(b.hr().getMetadataTags()).toEqual([]);
  });
});
