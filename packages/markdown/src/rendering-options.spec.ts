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
      expect(
        b.li.unordered("hello", null, "world").render(),
      ).toBe("- helloworld");
    });

    it("should filter undefined from line blocks by default", () => {
      expect(
        b.li.unordered("hello", undefined, "world").render(),
      ).toBe("- helloworld");
    });

    it("should filter null from multiline blocks by default", () => {
      expect(b.doc("hello", null, "world").render()).toBe("hello\nworld");
    });

    it("should filter undefined from multiline blocks by default", () => {
      expect(b.doc("hello", undefined, "world").render()).toBe(
        "hello\nworld",
      );
    });

    it("should render null as 'null' in inline blocks when renderNullish is true", () => {
      expect(
        b.p("hello", null, "world").render({ renderNullish: true }),
      ).toBe("hellonullworld");
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
      expect(
        b.p("hello", "world").render({ lineJoinString: " " }),
      ).toBe("hello world");
    });

    it("should join inline content with a comma separator", () => {
      expect(
        b.p("one", "two", "three").render({ lineJoinString: ", " }),
      ).toBe("one, two, three");
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

  describe("enforceStyles.bold", () => {
    it("should override default bold style to '__'", () => {
      expect(
        b.bold("text").render({ enforceStyles: { bold: "__" } }),
      ).toBe("__text__");
    });

    it("should override default bold style to '**'", () => {
      expect(
        b.bold("text").render({ enforceStyles: { bold: "**" } }),
      ).toBe("**text**");
    });

    it("should override per-block bold style", () => {
      expect(
        b.bold("text").style("__").render({ enforceStyles: { bold: "**" } }),
      ).toBe("**text**");
    });

    it("should use per-block style when no enforceStyles is set", () => {
      expect(b.bold("text").style("__").render()).toBe("__text__");
    });
  });

  describe("enforceStyles.italic", () => {
    it("should override default italic style to '_'", () => {
      expect(
        b.italic("text").render({ enforceStyles: { italic: "_" } }),
      ).toBe("_text_");
    });

    it("should override default italic style to '*'", () => {
      expect(
        b.italic("text").render({ enforceStyles: { italic: "*" } }),
      ).toBe("*text*");
    });

    it("should override per-block italic style", () => {
      expect(
        b.italic("text").style("_").render({ enforceStyles: { italic: "*" } }),
      ).toBe("*text*");
    });

    it("should use per-block style when no enforceStyles is set", () => {
      expect(b.italic("text").style("_").render()).toBe("_text_");
    });
  });

  describe("enforceStyles.unorderedListItem", () => {
    it("should override default unordered list item style to '*'", () => {
      expect(
        b.li
          .unordered("item")
          .render({ enforceStyles: { unorderedListItem: "*" } }),
      ).toBe("* item");
    });

    it("should override default unordered list item style to '+'", () => {
      expect(
        b.li
          .unordered("item")
          .render({ enforceStyles: { unorderedListItem: "+" } }),
      ).toBe("+ item");
    });

    it("should override per-item style", () => {
      expect(
        b.li
          .unordered("item")
          .style("*")
          .render({ enforceStyles: { unorderedListItem: "+" } }),
      ).toBe("+ item");
    });

    it("should use per-item style when no enforceStyles is set", () => {
      expect(b.li.unordered("item").style("*").render()).toBe("* item");
    });

    it("should enforce style on items within an unordered list", () => {
      expect(
        b.list
          .unordered("one", "two")
          .render({ enforceStyles: { unorderedListItem: "+" } }),
      ).toBe("+ one\n+ two");
    });
  });

  describe("enforceStyles.horizontalRule", () => {
    it("should override default horizontal rule style to '*'", () => {
      expect(
        b.hr().render({ enforceStyles: { horizontalRule: "*" } }),
      ).toBe("\n***\n");
    });

    it("should override default horizontal rule style to '_'", () => {
      expect(
        b.hr().render({ enforceStyles: { horizontalRule: "_" } }),
      ).toBe("\n___\n");
    });

    it("should override per-block style", () => {
      expect(
        b.hr().style("*").render({ enforceStyles: { horizontalRule: "_" } }),
      ).toBe("\n___\n");
    });

    it("should use per-block style when no enforceStyles is set", () => {
      expect(b.hr().style("*").render()).toBe("\n***\n");
    });

    it("should respect count when enforcing style", () => {
      expect(
        b.hr().count(5).render({ enforceStyles: { horizontalRule: "*" } }),
      ).toBe("\n*****\n");
    });
  });

  describe("enforceStyles.taskItem", () => {
    it("should override default task item style to 'X'", () => {
      expect(
        b.li
          .task(true, "done")
          .render({ enforceStyles: { taskItem: "X" } }),
      ).toBe("- [X] done");
    });

    it("should override default task item style to 'x'", () => {
      expect(
        b.li
          .task(true, "done")
          .render({ enforceStyles: { taskItem: "x" } }),
      ).toBe("- [x] done");
    });

    it("should override per-item style", () => {
      expect(
        b.li
          .task(true, "done")
          .style("X")
          .render({ enforceStyles: { taskItem: "x" } }),
      ).toBe("- [x] done");
    });

    it("should not affect unchecked tasks", () => {
      expect(
        b.li
          .task(false, "not done")
          .render({ enforceStyles: { taskItem: "X" } }),
      ).toBe("- [ ] not done");
    });

    it("should enforce style on items within a task list", () => {
      expect(
        b.list
          .tasks([true, "one"], [false, "two"], [true, "three"])
          .render({ enforceStyles: { taskItem: "X" } }),
      ).toBe("- [X] one\n- [ ] two\n- [X] three");
    });
  });

  describe("enforceStyles.tableAlign", () => {
    it("should override default table alignment to 'left'", () => {
      const result = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .render({ enforceStyles: { tableAlign: "left" } });
      expect(result).toContain(":---");
      expect(result).not.toContain("---:");
      expect(result).not.toContain(":---:");
    });

    it("should override default table alignment to 'center'", () => {
      const result = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .render({ enforceStyles: { tableAlign: "center" } });
      expect(result).toContain(":---:");
    });

    it("should override default table alignment to 'right'", () => {
      const result = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .render({ enforceStyles: { tableAlign: "right" } });
      expect(result).toContain("---:");
    });

    it("should override per-column alignment", () => {
      const tbl = b.table(
        { a: { name: "A", maxWidth: undefined, align: "left" }, b: "B" },
        { a: "1", b: "2" },
      );
      const result = tbl.render({
        enforceStyles: { tableAlign: "right" },
      });
      expect(result).toContain("---:");
      expect(result).not.toContain(":---" + " ");
    });

    it("should override table-level style", () => {
      const tbl = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .style("left");
      const result = tbl.render({
        enforceStyles: { tableAlign: "center" },
      });
      expect(result).toContain(":---:");
    });
  });

  describe("enforceIndentation.list", () => {
    it("should override default list indentation", () => {
      const list = b.list.unordered(
        "item 1",
        b.list.unordered("nested"),
      );
      const result = list.render({ enforceIndentation: { list: 4 } });
      expect(result).toBe("- item 1\n    - nested");
    });

    it("should override per-block indent value", () => {
      const list = b.list
        .unordered("item 1", b.list.unordered("nested"))
        .indent(2);
      const result = list.render({ enforceIndentation: { list: 6 } });
      expect(result).toBe("- item 1\n      - nested");
    });

    it("should apply to ordered lists", () => {
      const list = b.list.ordered(
        "item 1",
        b.list.ordered("nested"),
      );
      const result = list.render({ enforceIndentation: { list: 4 } });
      expect(result).toBe("1. item 1\n    1. nested");
    });

    it("should apply to task lists", () => {
      const list = b.list.tasks(
        [true, "item 1"],
        b.list.tasks([false, "nested"]),
      );
      const result = list.render({ enforceIndentation: { list: 4 } });
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
          .doc(
            b.sec(b.h("Title"), "one", "two"),
          )
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
      expect(opts.enforceStyles).toEqual({});
      expect(opts.enforceIndentation).toEqual({});
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

    it("should merge enforceStyles", () => {
      const opts = b.renderingOptions({
        enforceStyles: { bold: "__", italic: "_" },
      });
      expect(opts.enforceStyles.bold).toBe("__");
      expect(opts.enforceStyles.italic).toBe("_");
    });

    it("should merge enforceIndentation", () => {
      const opts = b.renderingOptions({
        enforceIndentation: { list: 4 },
      });
      expect(opts.enforceIndentation.list).toBe(4);
    });

    it("should be usable as input to render()", () => {
      const opts = b.renderingOptions({
        enforceStyles: { bold: "__" },
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

    it("should override block-level enforceStyles", () => {
      const block = b.bold("text").setRenderingOptions({
        enforceStyles: { bold: "__" },
      });
      expect(block.render({ enforceStyles: { bold: "**" } })).toBe(
        "**text**",
      );
    });
  });

  describe("multiple enforceStyles combined", () => {
    it("should enforce bold, italic, and unorderedListItem simultaneously", () => {
      const doc = b.doc(
        b.list.unordered(
          b.p(b.bold("strong"), " and ", b.italic("emphasis")),
        ),
      );
      const result = doc.render({
        enforceStyles: {
          bold: "__",
          italic: "_",
          unorderedListItem: "*",
        },
      });
      expect(result).toBe("* __strong__ and _emphasis_");
    });

    it("should enforce taskItem and bold simultaneously", () => {
      const doc = b.doc(
        b.list.tasks([true, b.bold("important task")]),
      );
      const result = doc.render({
        enforceStyles: {
          taskItem: "X",
          bold: "__",
        },
      });
      expect(result).toBe("- [X] __important task__");
    });

    it("should enforce horizontalRule and italic simultaneously", () => {
      const doc = b.doc(
        b.italic("text"),
        b.hr(),
        b.italic("more"),
      );
      const result = doc.render({
        enforceStyles: {
          horizontalRule: "*",
          italic: "_",
        },
      });
      expect(result).toBe("_text_\n\n***\n\n_more_");
    });
  });

  describe("options propagation through nested blocks", () => {
    it("should propagate enforceStyles.bold through a document to nested bold blocks", () => {
      const doc = b.doc(
        b.p(b.bold("outer")),
        b.sec(b.p(b.bold("inner"))),
      );
      const result = doc.render({ enforceStyles: { bold: "__" } });
      expect(result).toBe("__outer__\n__inner__");
    });

    it("should propagate enforceStyles.italic through blockquotes", () => {
      const doc = b.doc(
        b.bq(b.italic("quoted emphasis")),
      );
      const result = doc.render({ enforceStyles: { italic: "_" } });
      expect(result).toBe("> _quoted emphasis_");
    });

    it("should propagate lineJoinString through nested inline blocks", () => {
      const doc = b.doc(
        b.p("a", b.bold("b", "c")),
      );
      const result = doc.render({ lineJoinString: " " });
      expect(result).toBe("a **b c**");
    });

    it("should propagate enforceStyles.unorderedListItem through nested lists", () => {
      const list = b.list.unordered(
        "top",
        b.list.unordered("nested"),
      );
      const result = list.render({
        enforceStyles: { unorderedListItem: "+" },
      });
      expect(result).toBe("+ top\n  + nested");
    });

    it("should propagate enforceIndentation.list through deeply nested lists", () => {
      const list = b.list.unordered(
        "level 1",
        b.list.unordered("level 2", b.list.unordered("level 3")),
      );
      const result = list.render({ enforceIndentation: { list: 4 } });
      expect(result).toBe(
        "- level 1\n    - level 2\n        - level 3",
      );
    });

    it("should propagate newlineStrategy through sections", () => {
      const doc = b.doc(
        b.sec(b.h("Title"), "one", "two"),
        b.sec(b.h("Title 2"), "three"),
      );
      const result = doc.render({
        newlineStrategy: "between_blocks",
      });
      expect(result).toBe(
        "## Title\n\none\n\ntwo\n\n## Title 2\n\nthree",
      );
    });

    it("should propagate renderNullish through nested structures", () => {
      const doc = b.doc(
        b.p("hello", null),
        b.bq(b.p("world", undefined)),
      );
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
        enforceStyles: {
          bold: "__",
          italic: "_",
          unorderedListItem: "*",
          horizontalRule: "*",
        },
        newlineStrategy: "between_blocks",
      });
      expect(result).toBe(
        "# Title\n\n__intro__ _text_\n\n* item 1\n* item 2\n\n\n***",
      );
    });
  });
});
