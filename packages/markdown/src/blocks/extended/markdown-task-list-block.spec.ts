import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownTaskListBlock", () => {
  it("should render a list of task items from tuples", () => {
    expect(
      String(
        b.list.tasks([true, "done"], [false, "todo"]),
      ),
    ).toBe("- [x] done\n- [ ] todo");
  });

  it("should render a single task item", () => {
    expect(String(b.list.tasks([true, "item"]))).toBe("- [x] item");
  });

  it("should render all unchecked items", () => {
    expect(
      String(b.list.tasks([false, "one"], [false, "two"])),
    ).toBe("- [ ] one\n- [ ] two");
  });

  it("should render all checked items", () => {
    expect(
      String(b.list.tasks([true, "one"], [true, "two"])),
    ).toBe("- [x] one\n- [x] two");
  });

  it("should apply style to all task items", () => {
    expect(
      String(
        b.list.tasks([true, "done"], [false, "todo"]).style("X"),
      ),
    ).toBe("- [X] done\n- [ ] todo");
  });

  it("should apply x style to all task items", () => {
    expect(
      String(
        b.list.tasks([true, "one"], [true, "two"]).style("x"),
      ),
    ).toBe("- [x] one\n- [x] two");
  });

  it("should return null if empty", () => {
    expect(b.list.tasks().render()).toBeNull();
  });

  it("should support nested list blocks as children", () => {
    const nested = b.list.tasks(
      [true, "parent"],
      b.list.unordered("child one", "child two"),
    );
    expect(String(nested)).toBe(
      "- [x] parent\n  - child one\n  - child two",
    );
  });

  it("should support nested ordered list blocks", () => {
    const nested = b.list.tasks(
      [false, "parent"],
      b.list.ordered("first", "second"),
    );
    expect(String(nested)).toBe(
      "- [ ] parent\n  1. first\n  2. second",
    );
  });

  it("should support mixing task items and nested lists", () => {
    const mixed = b.list.tasks(
      [true, "task one"],
      b.list.unordered("nested item"),
      [false, "task two"],
    );
    expect(String(mixed)).toBe(
      "- [x] task one\n  - nested item\n- [ ] task two",
    );
  });

  it("should inherit indent from MarkdownListBlock", () => {
    const nested = b.list.tasks(
      [true, "parent"],
      b.list.unordered("child"),
    ).indent(4);
    expect(String(nested)).toBe(
      "- [x] parent\n    - child",
    );
  });

  it("should respect enforceIndentation.list option", () => {
    const nested = b.list.tasks(
      [true, "parent"],
      b.list.unordered("child"),
    );
    expect(nested.render({ enforceIndentation: { list: 4 } })).toBe(
      "- [x] parent\n    - child",
    );
  });

  it("should let enforceIndentation override explicit indent", () => {
    const nested = b.list.tasks(
      [true, "parent"],
      b.list.unordered("child"),
    ).indent(4);
    expect(nested.render({ enforceIndentation: { list: 3 } })).toBe(
      "- [x] parent\n   - child",
    );
  });

  it("should accept inline blocks in task content", () => {
    expect(
      String(
        b.list.tasks([true, "hello ", b.bold("world")]),
      ),
    ).toBe("- [x] hello **world**");
  });

  it("should include indent in metadata tags when set", () => {
    expect(
      b.list.tasks([true, "item"]).indent(4).getMetadataTags(),
    ).toContain("indent=4");
  });

  it("should have no metadata tags when using defaults", () => {
    expect(
      b.list.tasks([true, "item"]).getMetadataTags(),
    ).toEqual([]);
  });

  it("should only set indent once (first wins)", () => {
    const nested = b.list.tasks(
      [true, "parent"],
      b.list.unordered("child"),
    ).indent(4).indent(8);
    expect(String(nested)).toBe(
      "- [x] parent\n    - child",
    );
  });

  it("should be coercible via String()", () => {
    expect(
      String(b.list.tasks([true, "item"])),
    ).toBe("- [x] item");
  });

  it("should be coercible via template literal", () => {
    expect(
      `${b.list.tasks([false, "item"])}`,
    ).toBe("- [ ] item");
  });
});
