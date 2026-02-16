import { describe, it, expect } from "vitest";
import { b } from "./index";

describe("RenderingOptions", () => {
  describe("renderNullish", () => {
    it("should filter null from inline blocks by default", () => {
      expect(b.p("hello", null, "world").render()).toBe("helloworld");
    });

    it("should filter undefined from inline blocks by default", () => {
      expect(b.p("hello", undefined, "world").render()).toBe("helloworld");
    });

    it("should filter null from line blocks by default", () => {
      expect(b.li.unordered("hello", null, "world").render()).toBe(
        "- helloworld",
      );
    });

    it("should filter undefined from line blocks by default", () => {
      expect(b.li.unordered("hello", undefined, "world").render()).toBe(
        "- helloworld",
      );
    });

    it("should filter null from multiline blocks by default", () => {
      expect(b.doc("hello", null, "world").render()).toBe("hello\nworld");
    });

    it("should filter undefined from multiline blocks by default", () => {
      expect(b.doc("hello", undefined, "world").render()).toBe("hello\nworld");
    });

    it("should render null as 'null' in inline blocks when renderNullish is true", () => {
      expect(b.p("hello", null, "world").render({ renderNullish: true })).toBe(
        "hellonullworld",
      );
    });

    it("should render undefined as 'undefined' in inline blocks when renderNullish is true", () => {
      expect(
        b.p("hello", undefined, "world").render({ renderNullish: true }),
      ).toBe("helloundefinedworld");
    });

    it("should include null as an empty line in multiline blocks when renderNullish is true", () => {
      expect(
        b.doc("hello", null, "world").render({ renderNullish: true }),
      ).toBe("hello\n\nworld");
    });

    it("should include undefined as an empty line in multiline blocks when renderNullish is true", () => {
      expect(
        b.doc("hello", undefined, "world").render({ renderNullish: true }),
      ).toBe("hello\n\nworld");
    });
  });

  describe("lineJoinString", () => {
    it("should join inline content with empty string by default", () => {
      expect(b.p("hello", "world").render()).toBe("helloworld");
    });

    it("should join inline content with a custom separator", () => {
      expect(b.p("hello", "world").render({ lineJoinString: " " })).toBe(
        "hello world",
      );
    });

    it("should join inline content with a comma separator", () => {
      expect(b.p("one", "two", "three").render({ lineJoinString: ", " })).toBe(
        "one, two, three",
      );
    });

    it("should join line block content with a custom separator", () => {
      expect(
        b.li.unordered("hello", "world").render({ lineJoinString: " " }),
      ).toBe("- hello world");
    });

    it("should propagate lineJoinString into nested inline blocks", () => {
      expect(
        b.p("hello ", b.bold("foo", "bar")).render({ lineJoinString: "-" }),
      ).toBe("hello -**foo-bar**");
    });
  });

  describe("enforce.bold", () => {
    it("should override default bold style to '__'", () => {
      expect(
        b.bold("text").render({ enforce: { bold: { style: "__" } } }),
      ).toBe("__text__");
    });

    it("should override default bold style to '**'", () => {
      expect(
        b.bold("text").render({ enforce: { bold: { style: "**" } } }),
      ).toBe("**text**");
    });

    it("should override per-block bold style", () => {
      expect(
        b
          .bold("text")
          .style("__")
          .render({ enforce: { bold: { style: "**" } } }),
      ).toBe("**text**");
    });

    it("should use per-block style when no enforce is set", () => {
      expect(b.bold("text").style("__").render()).toBe("__text__");
    });
  });

  describe("enforce.italic", () => {
    it("should override default italic style to '_'", () => {
      expect(
        b.italic("text").render({ enforce: { italic: { style: "_" } } }),
      ).toBe("_text_");
    });

    it("should override default italic style to '*'", () => {
      expect(
        b.italic("text").render({ enforce: { italic: { style: "*" } } }),
      ).toBe("*text*");
    });

    it("should override per-block italic style", () => {
      expect(
        b
          .italic("text")
          .style("_")
          .render({ enforce: { italic: { style: "*" } } }),
      ).toBe("*text*");
    });

    it("should use per-block style when no enforce is set", () => {
      expect(b.italic("text").style("_").render()).toBe("_text_");
    });
  });

  describe("enforce.unorderedListItem", () => {
    it("should override default unordered list item style to '*'", () => {
      expect(
        b.li
          .unordered("item")
          .render({ enforce: { unorderedListItem: { style: "*" } } }),
      ).toBe("* item");
    });

    it("should override default unordered list item style to '+'", () => {
      expect(
        b.li
          .unordered("item")
          .render({ enforce: { unorderedListItem: { style: "+" } } }),
      ).toBe("+ item");
    });

    it("should override per-item style", () => {
      expect(
        b.li
          .unordered("item")
          .style("*")
          .render({ enforce: { unorderedListItem: { style: "+" } } }),
      ).toBe("+ item");
    });

    it("should use per-item style when no enforce is set", () => {
      expect(b.li.unordered("item").style("*").render()).toBe("* item");
    });

    it("should enforce style on items within an unordered list", () => {
      expect(
        b.list
          .unordered("one", "two")
          .render({ enforce: { unorderedListItem: { style: "+" } } }),
      ).toBe("+ one\n+ two");
    });
  });

  describe("enforce.horizontalRule", () => {
    it("should override default horizontal rule style to '*'", () => {
      expect(
        b.hr().render({ enforce: { horizontalRule: { style: "*" } } }),
      ).toBe("\n***\n");
    });

    it("should override default horizontal rule style to '_'", () => {
      expect(
        b.hr().render({ enforce: { horizontalRule: { style: "_" } } }),
      ).toBe("\n___\n");
    });

    it("should override per-block style", () => {
      expect(
        b
          .hr()
          .style("*")
          .render({ enforce: { horizontalRule: { style: "_" } } }),
      ).toBe("\n___\n");
    });

    it("should use per-block style when no enforce is set", () => {
      expect(b.hr().style("*").render()).toBe("\n***\n");
    });

    it("should respect count when enforcing style", () => {
      expect(
        b
          .hr()
          .count(5)
          .render({ enforce: { horizontalRule: { style: "*" } } }),
      ).toBe("\n*****\n");
    });
  });

  describe("enforce.taskItem", () => {
    it("should override default task item style to 'X'", () => {
      expect(
        b.li
          .task(true, "done")
          .render({ enforce: { taskItem: { style: "X" } } }),
      ).toBe("- [X] done");
    });

    it("should override default task item style to 'x'", () => {
      expect(
        b.li
          .task(true, "done")
          .render({ enforce: { taskItem: { style: "x" } } }),
      ).toBe("- [x] done");
    });

    it("should override per-item style", () => {
      expect(
        b.li
          .task(true, "done")
          .style("X")
          .render({ enforce: { taskItem: { style: "x" } } }),
      ).toBe("- [x] done");
    });

    it("should not affect unchecked tasks", () => {
      expect(
        b.li
          .task(false, "not done")
          .render({ enforce: { taskItem: { style: "X" } } }),
      ).toBe("- [ ] not done");
    });

    it("should enforce style on items within a task list", () => {
      expect(
        b.list
          .tasks([true, "one"], [false, "two"], [true, "three"])
          .render({ enforce: { taskItem: { style: "X" } } }),
      ).toBe("- [X] one\n- [ ] two\n- [X] three");
    });
  });

  describe("enforce.table", () => {
    it("should override default table alignment to 'left'", () => {
      const result = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .render({ enforce: { table: { align: "left" } } });
      expect(result).toContain(":---");
      expect(result).not.toContain("---:");
      expect(result).not.toContain(":---:");
    });

    it("should override default table alignment to 'center'", () => {
      const result = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .render({ enforce: { table: { align: "center" } } });
      expect(result).toContain(":---:");
    });

    it("should override default table alignment to 'right'", () => {
      const result = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .render({ enforce: { table: { align: "right" } } });
      expect(result).toContain("---:");
    });

    it("should override per-column alignment", () => {
      const tbl = b.table(
        { a: { name: "A", maxWidth: undefined, align: "left" }, b: "B" },
        { a: "1", b: "2" },
      );
      const result = tbl.render({
        enforce: { table: { align: "right" } },
      });
      expect(result).toContain("---:");
      expect(result).not.toContain(":---" + " ");
    });

    it("should override table-level style", () => {
      const tbl = b.table({ a: "A", b: "B" }, { a: "1", b: "2" }).style("left");
      const result = tbl.render({
        enforce: { table: { align: "center" } },
      });
      expect(result).toContain(":---:");
    });
  });

  describe("enforce.list", () => {
    it("should override default list indentation", () => {
      const list = b.list.unordered("item 1", b.list.unordered("nested"));
      const result = list.render({ enforce: { list: { indent: 4 } } });
      expect(result).toBe("- item 1\n    - nested");
    });

    it("should override per-block indent value", () => {
      const list = b.list
        .unordered("item 1", b.list.unordered("nested"))
        .indent(2);
      const result = list.render({ enforce: { list: { indent: 6 } } });
      expect(result).toBe("- item 1\n      - nested");
    });

    it("should apply to ordered lists", () => {
      const list = b.list.ordered("item 1", b.list.ordered("nested"));
      const result = list.render({ enforce: { list: { indent: 4 } } });
      expect(result).toBe("1. item 1\n    1. nested");
    });

    it("should apply to task lists", () => {
      const list = b.list.tasks(
        [true, "item 1"],
        b.list.tasks([false, "nested"]),
      );
      const result = list.render({ enforce: { list: { indent: 4 } } });
      expect(result).toBe("- [x] item 1\n    - [ ] nested");
    });
  });

  describe("newlineStrategy", () => {
    it("should use single newlines between blocks with 'none' strategy", () => {
      expect(
        b.doc("one", "two", "three").render({ newlineStrategy: "none" }),
      ).toBe("one\ntwo\nthree");
    });

    it("should use double newlines between all blocks with 'between_blocks' strategy", () => {
      expect(
        b
          .doc("one", "two", "three")
          .render({ newlineStrategy: "between_blocks" }),
      ).toBe("one\n\ntwo\n\nthree");
    });

    it("should use double newlines only before and after headings with 'before_and_after_heading' strategy", () => {
      expect(
        b
          .doc("intro", b.h("Title"), "body")
          .render({ newlineStrategy: "before_and_after_heading" }),
      ).toBe("intro\n\n# Title\n\nbody");
    });

    it("should not add extra newlines between non-heading blocks with 'before_and_after_heading'", () => {
      expect(
        b
          .doc("one", "two", "three")
          .render({ newlineStrategy: "before_and_after_heading" }),
      ).toBe("one\ntwo\nthree");
    });

    it("should propagate into sections containing headings with 'before_and_after_heading'", () => {
      expect(
        b
          .doc("intro", b.sec(b.h("Section"), "content"))
          .render({ newlineStrategy: "before_and_after_heading" }),
      ).toBe("intro\n\n## Section\n\ncontent");
    });

    it("should add double newlines around consecutive headings with 'before_and_after_heading'", () => {
      expect(
        b
          .doc(b.h("First"), b.h("Second"))
          .render({ newlineStrategy: "before_and_after_heading" }),
      ).toBe("# First\n\n# Second");
    });

    it("should apply 'between_blocks' to nested sections", () => {
      expect(
        b
          .doc(b.sec(b.h("Title"), "one", "two"))
          .render({ newlineStrategy: "between_blocks" }),
      ).toBe("## Title\n\none\n\ntwo");
    });
  });

  describe("setRenderingOptions on blocks", () => {
    it("should be chainable", () => {
      const block = b.doc("hello");
      const result = block.setRenderingOptions({
        newlineStrategy: "between_blocks",
      });
      expect(result).toBe(block);
    });

    it("should persist options across renders", () => {
      const doc = b.doc("one", "two").setRenderingOptions({
        newlineStrategy: "between_blocks",
      });
      expect(String(doc)).toBe("one\n\ntwo");
      expect(String(doc)).toBe("one\n\ntwo");
    });

    it("should be overridden by options passed to render()", () => {
      const doc = b.doc("one", "two").setRenderingOptions({
        newlineStrategy: "between_blocks",
      });
      expect(doc.render({ newlineStrategy: "none" })).toBe("one\ntwo");
    });

    it("should include null as an empty line when renderNullish is set on block", () => {
      const doc = b.doc("hello", null, "world").setRenderingOptions({
        renderNullish: true,
      });
      expect(String(doc)).toBe("hello\n\nworld");
    });

    it("should apply lineJoinString when set on inline block", () => {
      const para = b.p("hello", "world").setRenderingOptions({
        lineJoinString: " ",
      });
      expect(String(para)).toBe("hello world");
    });
  });

  describe("renderingOptions factory", () => {
    it("should create a full options object with defaults filled in", () => {
      const opts = b.renderingOptions({});
      expect(opts.renderNullish).toBe(false);
      expect(opts.lineJoinString).toBe("");
      expect(opts.enforce).toEqual({});
      expect(opts.newlineStrategy).toBe("none");
    });

    it("should override specified values", () => {
      const opts = b.renderingOptions({
        renderNullish: true,
        lineJoinString: " ",
        newlineStrategy: "between_blocks",
      });
      expect(opts.renderNullish).toBe(true);
      expect(opts.lineJoinString).toBe(" ");
      expect(opts.newlineStrategy).toBe("between_blocks");
    });

    it("should merge enforce", () => {
      const opts = b.renderingOptions({
        enforce: { bold: { style: "__" }, italic: { style: "_" } },
      });
      expect(opts.enforce.bold?.style).toBe("__");
      expect(opts.enforce.italic?.style).toBe("_");
    });

    it("should merge enforce.list", () => {
      const opts = b.renderingOptions({
        enforce: { list: { indent: 4 } },
      });
      expect(opts.enforce.list?.indent).toBe(4);
    });

    it("should be usable as input to render()", () => {
      const opts = b.renderingOptions({
        enforce: { bold: { style: "__" } },
      });
      expect(b.bold("text").render(opts)).toBe("__text__");
    });
  });

  describe("options passed to render()", () => {
    it("should override block-level renderNullish", () => {
      const doc = b.doc("hello", null, "world").setRenderingOptions({
        renderNullish: false,
      });
      expect(doc.render({ renderNullish: true })).toBe("hello\n\nworld");
    });

    it("should override block-level lineJoinString", () => {
      const para = b.p("hello", "world").setRenderingOptions({
        lineJoinString: " ",
      });
      expect(para.render({ lineJoinString: "-" })).toBe("hello-world");
    });

    it("should override block-level newlineStrategy", () => {
      const doc = b.doc("one", "two").setRenderingOptions({
        newlineStrategy: "between_blocks",
      });
      expect(doc.render({ newlineStrategy: "none" })).toBe("one\ntwo");
    });

    it("should override block-level enforce", () => {
      const block = b.bold("text").setRenderingOptions({
        enforce: { bold: { style: "__" } },
      });
      expect(block.render({ enforce: { bold: { style: "**" } } })).toBe(
        "**text**",
      );
    });
  });

  describe("multiple enforce options combined", () => {
    it("should enforce bold, italic, and unorderedListItem simultaneously", () => {
      const doc = b.doc(
        b.list.unordered(b.p(b.bold("strong"), " and ", b.italic("emphasis"))),
      );
      const result = doc.render({
        enforce: {
          bold: { style: "__" },
          italic: { style: "_" },
          unorderedListItem: { style: "*" },
        },
      });
      expect(result).toBe("* __strong__ and _emphasis_");
    });

    it("should enforce taskItem and bold simultaneously", () => {
      const doc = b.doc(b.list.tasks([true, b.bold("important task")]));
      const result = doc.render({
        enforce: {
          taskItem: { style: "X" },
          bold: { style: "__" },
        },
      });
      expect(result).toBe("- [X] __important task__");
    });

    it("should enforce horizontalRule and italic simultaneously", () => {
      const doc = b.doc(b.italic("text"), b.hr(), b.italic("more"));
      const result = doc.render({
        enforce: {
          horizontalRule: { style: "*" },
          italic: { style: "_" },
        },
      });
      expect(result).toBe("_text_\n\n***\n\n_more_");
    });
  });

  describe("options propagation through nested blocks", () => {
    it("should propagate enforce.bold through a document to nested bold blocks", () => {
      const doc = b.doc(b.p(b.bold("outer")), b.sec(b.p(b.bold("inner"))));
      const result = doc.render({ enforce: { bold: { style: "__" } } });
      expect(result).toBe("__outer__\n__inner__");
    });

    it("should propagate enforce.italic through blockquotes", () => {
      const doc = b.doc(b.bq(b.italic("quoted emphasis")));
      const result = doc.render({ enforce: { italic: { style: "_" } } });
      expect(result).toBe("> _quoted emphasis_");
    });

    it("should propagate lineJoinString through nested inline blocks", () => {
      const doc = b.doc(b.p("a", b.bold("b", "c")));
      const result = doc.render({ lineJoinString: " " });
      expect(result).toBe("a **b c**");
    });

    it("should propagate enforce.unorderedListItem through nested lists", () => {
      const list = b.list.unordered("top", b.list.unordered("nested"));
      const result = list.render({
        enforce: { unorderedListItem: { style: "+" } },
      });
      expect(result).toBe("+ top\n  + nested");
    });

    it("should propagate enforce.list through deeply nested lists", () => {
      const list = b.list.unordered(
        "level 1",
        b.list.unordered("level 2", b.list.unordered("level 3")),
      );
      const result = list.render({ enforce: { list: { indent: 4 } } });
      expect(result).toBe("- level 1\n    - level 2\n        - level 3");
    });

    it("should propagate newlineStrategy through sections", () => {
      const doc = b.doc(
        b.sec(b.h("Title"), "one", "two"),
        b.sec(b.h("Title 2"), "three"),
      );
      const result = doc.render({
        newlineStrategy: "between_blocks",
      });
      expect(result).toBe("## Title\n\none\n\ntwo\n\n## Title 2\n\nthree");
    });

    it("should propagate renderNullish through nested structures", () => {
      const doc = b.doc(b.p("hello", null), b.bq(b.p("world", undefined)));
      const result = doc.render({ renderNullish: true });
      expect(result).toBe("hellonull\n> worldundefined");
    });

    it("should propagate multiple options through a complex document", () => {
      const doc = b.doc(
        b.h("Title"),
        b.p(b.bold("intro"), " ", b.italic("text")),
        b.list.unordered("item 1", "item 2"),
        b.hr(),
      );
      const result = doc.render({
        enforce: {
          bold: { style: "__" },
          italic: { style: "_" },
          unorderedListItem: { style: "*" },
          horizontalRule: { style: "*" },
        },
        newlineStrategy: "between_blocks",
      });
      expect(result).toBe(
        "# Title\n\n__intro__ _text_\n\n* item 1\n* item 2\n\n\n***",
      );
    });
  });
});
