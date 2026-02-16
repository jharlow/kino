import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownUnorderedListBlock", () => {
  it("should auto-wrap items in unordered list item blocks", () => {
    expect(String(b.list.unordered("one", "two", "three"))).toBe(
      "- one\n- two\n- three",
    );
  });

  it("should apply style to all items", () => {
    expect(String(b.list.unordered("one", "two").style("*"))).toBe(
      "* one\n* two",
    );
  });

  it("should apply + style to all items", () => {
    expect(String(b.list.unordered("one", "two").style("+"))).toBe(
      "+ one\n+ two",
    );
  });

  it("should be creatable via b.list.ul alias", () => {
    expect(String(b.list.ul("item"))).toBe("- item");
  });

  it("should be creatable via b.ls.unordered alias", () => {
    expect(String(b.ls.unordered("item"))).toBe("- item");
  });

  it("should be creatable via b.ls.ul alias", () => {
    expect(String(b.ls.ul("item"))).toBe("- item");
  });

  it("should return null if empty", () => {
    expect(b.list.unordered().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.list.unordered().isEmpty).toBe(true);
    expect(b.list.unordered("item").isEmpty).toBe(false);
  });

  it("should use default indent of 2 for nested lists", () => {
    const nested = b.list.unordered("parent", b.list.unordered("child"));
    expect(String(nested)).toBe("- parent\n  - child");
  });

  it("should set custom indent via .indent()", () => {
    const nested = b.list
      .unordered("parent", b.list.unordered("child"))
      .indent(4);
    expect(String(nested)).toBe("- parent\n    - child");
  });

  it("should only set indent once (first wins)", () => {
    const nested = b.list
      .unordered("parent", b.list.unordered("child"))
      .indent(4)
      .indent(8);
    expect(String(nested)).toBe("- parent\n    - child");
  });

  it("should respect enforce.list option", () => {
    const nested = b.list.unordered("parent", b.list.unordered("child"));
    expect(nested.render({ enforce: { list: { indent: 4 } } })).toBe(
      "- parent\n    - child",
    );
  });

  it("should let enforce override explicit indent", () => {
    const nested = b.list
      .unordered("parent", b.list.unordered("child"))
      .indent(4);
    expect(nested.render({ enforce: { list: { indent: 3 } } })).toBe(
      "- parent\n   - child",
    );
  });

  it("should include indent in metadata tags when set", () => {
    expect(b.list.unordered("item").indent(4).getMetadataTags()).toContain(
      "indent=4",
    );
  });

  it("should have no metadata tags when using defaults", () => {
    expect(b.list.unordered("item").getMetadataTags()).toEqual([]);
  });
});

describe("MarkdownOrderedListBlock", () => {
  it("should auto-wrap items in ordered list item blocks with 1-based indexing", () => {
    expect(String(b.list.ordered("one", "two", "three"))).toBe(
      "1. one\n2. two\n3. three",
    );
  });

  it("should re-index via .startingIndex()", () => {
    expect(String(b.list.ordered("one", "two", "three").startingIndex(5))).toBe(
      "5. one\n6. two\n7. three",
    );
  });

  it("should be creatable via b.list.ol alias", () => {
    expect(String(b.list.ol("item"))).toBe("1. item");
  });

  it("should be creatable via b.ls.ordered alias", () => {
    expect(String(b.ls.ordered("item"))).toBe("1. item");
  });

  it("should be creatable via b.ls.ol alias", () => {
    expect(String(b.ls.ol("item"))).toBe("1. item");
  });

  it("should return null if empty", () => {
    expect(b.list.ordered().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.list.ordered().isEmpty).toBe(true);
    expect(b.list.ordered("item").isEmpty).toBe(false);
  });

  it("should use default indent of 2 for nested lists", () => {
    const nested = b.list.ordered("parent", b.list.ordered("child"));
    expect(String(nested)).toBe("1. parent\n  1. child");
  });
});

describe("Nesting", () => {
  it("should nest unordered inside unordered", () => {
    const nested = b.list.unordered(
      "parent one",
      b.list.unordered("child one", "child two"),
      "parent two",
    );
    expect(String(nested)).toBe(
      "- parent one\n  - child one\n  - child two\n- parent two",
    );
  });

  it("should nest ordered inside unordered", () => {
    const nested = b.list.unordered(
      "parent",
      b.list.ordered("first", "second"),
    );
    expect(String(nested)).toBe("- parent\n  1. first\n  2. second");
  });

  it("should handle three levels of nesting", () => {
    const nested = b.list.unordered(
      "level 1",
      b.list.unordered("level 2", b.list.unordered("level 3")),
    );
    expect(String(nested)).toBe("- level 1\n  - level 2\n    - level 3");
  });

  it("should apply custom indent to nested lists", () => {
    const nested = b.list
      .unordered("parent", b.list.unordered("child"))
      .indent(4);
    expect(String(nested)).toBe("- parent\n    - child");
  });

  it("should inherit parent indent when nested list has no indent set", () => {
    const nested = b.list
      .unordered(
        "parent",
        b.list.unordered("child", b.list.unordered("grandchild")),
      )
      .indent(3);
    expect(String(nested)).toBe("- parent\n   - child\n      - grandchild");
  });

  it("should nest ordered inside ordered", () => {
    const nested = b.list.ordered(
      "parent one",
      b.list.ordered("child one", "child two"),
      "parent two",
    );
    expect(String(nested)).toBe(
      "1. parent one\n  1. child one\n  2. child two\n2. parent two",
    );
  });
});
