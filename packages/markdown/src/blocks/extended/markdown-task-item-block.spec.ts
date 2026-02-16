import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownTaskItemBlock", () => {
  it("should render with checkbox checked when checked is true", () => {
    expect(String(b.listItem.task(true, "done"))).toBe("- [x] done");
  });

  it("should render with empty checkbox when checked is false", () => {
    expect(String(b.listItem.task(false, "todo"))).toBe("- [ ] todo");
  });

  it("should render with default x style", () => {
    expect(String(b.listItem.task(true, "item"))).toBe("- [x] item");
  });

  it("should render with X style when set", () => {
    expect(String(b.listItem.task(true, "item").style("X"))).toBe("- [X] item");
  });

  it("should render with x style explicitly", () => {
    expect(String(b.listItem.task(true, "item").style("x"))).toBe("- [x] item");
  });

  it("should always render empty checkbox when unchecked regardless of style", () => {
    expect(String(b.listItem.task(false, "item").style("X"))).toBe(
      "- [ ] item",
    );
  });

  it("should toggle checked state via .checked()", () => {
    const block = b.listItem.task(false, "item");
    expect(String(block.checked(true))).toBe("- [x] item");
  });

  it("should toggle checked state to false via .checked()", () => {
    const block = b.listItem.task(true, "item");
    expect(String(block.checked(false))).toBe("- [ ] item");
  });

  it("should be chainable via .checked()", () => {
    const block = b.listItem.task(false, "item");
    const result = block.checked(true);
    expect(result).toBe(block);
  });

  it("should be chainable via .style()", () => {
    const block = b.listItem.task(true, "item");
    const result = block.style("X");
    expect(result).toBe(block);
  });

  it("should return null if empty content", () => {
    expect(b.listItem.task(true).render()).toBeNull();
  });

  it("should return null if unchecked with empty content", () => {
    expect(b.listItem.task(false).render()).toBeNull();
  });

  it("should respect enforce.taskItem rendering option", () => {
    const block = b.listItem.task(true, "item");
    expect(block.render({ enforce: { taskItem: { style: "X" } } })).toBe(
      "- [X] item",
    );
  });

  it("should let enforce override explicit style", () => {
    const block = b.listItem.task(true, "item").style("x");
    expect(block.render({ enforce: { taskItem: { style: "X" } } })).toBe(
      "- [X] item",
    );
  });

  it("should use explicit style when no enforce is set", () => {
    const block = b.listItem.task(true, "item").style("X");
    expect(block.render()).toBe("- [X] item");
  });

  it("should be creatable via b.listItem.t alias", () => {
    expect(String(b.listItem.t(true, "item"))).toBe("- [x] item");
  });

  it("should be creatable via b.li.task alias", () => {
    expect(String(b.li.task(true, "item"))).toBe("- [x] item");
  });

  it("should be creatable via b.li.t alias", () => {
    expect(String(b.li.t(false, "item"))).toBe("- [ ] item");
  });

  it("should be coercible via String()", () => {
    expect(String(b.listItem.task(true, "item"))).toBe("- [x] item");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.listItem.task(true, "item")}`).toBe("- [x] item");
  });

  it("should accept inline blocks in content", () => {
    expect(String(b.listItem.task(true, "hello ", b.bold("world")))).toBe(
      "- [x] hello **world**",
    );
  });

  it("should accept multiple inline blocks in content", () => {
    expect(
      String(
        b.listItem.task(false, b.bold("important"), " ", b.italic("task")),
      ),
    ).toBe("- [ ] **important** *task*");
  });

  it("should include checked in metadata tags when checked", () => {
    expect(b.listItem.task(true, "item").getMetadataTags()).toContain(
      "checked",
    );
  });

  it("should include unchecked in metadata tags when unchecked", () => {
    expect(b.listItem.task(false, "item").getMetadataTags()).toContain(
      "unchecked",
    );
  });

  it("should include style in metadata tags when set", () => {
    expect(
      b.listItem.task(true, "item").style("X").getMetadataTags(),
    ).toContain("style=X");
  });

  it("should not include style in metadata tags when using default", () => {
    const tags = b.listItem.task(true, "item").getMetadataTags();
    expect(tags).not.toContain("style=x");
    expect(tags).not.toContain("style=X");
  });

  it("should have checked and style in metadata tags together", () => {
    const tags = b.listItem.task(true, "item").style("X").getMetadataTags();
    expect(tags).toContain("checked");
    expect(tags).toContain("style=X");
  });
});
