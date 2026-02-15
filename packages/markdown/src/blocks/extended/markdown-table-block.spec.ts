import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownTableBlock", () => {
  describe("basic rendering", () => {
    it("should render a simple table with string column definitions", () => {
      const table = b.table(
        { name: "Name", age: "Age" },
        { name: "Alice", age: "30" },
        { name: "Bob", age: "25" },
      );
      expect(table.render()).toBe(
        "| Name  | Age |\n| ----- | --- |\n| Alice | 30  |\n| Bob   | 25  |",
      );
    });

    it("should render a header-only table when no rows are provided", () => {
      const table = b.table({ name: "Name", age: "Age" });
      expect(table.render()).toBe(
        "| Name | Age |\n| ---- | --- |",
      );
    });

    it("should auto-expand column widths to widest content", () => {
      const table = b.table(
        { col: "X" },
        { col: "longer content" },
      );
      expect(table.render()).toBe(
        "| X              |\n| -------------- |\n| longer content |",
      );
    });

    it("should pad separator dashes to match column width", () => {
      const table = b.table(
        { col: "Header" },
        { col: "A" },
      );
      expect(table.render()).toBe(
        "| Header |\n| ------ |\n| A      |",
      );
    });
  });

  describe("isEmpty", () => {
    it("should be true when no columns are defined", () => {
      const table = b.table({});
      expect(table.isEmpty).toBe(true);
    });

    it("should be false when columns are defined", () => {
      const table = b.table({ a: "A" });
      expect(table.isEmpty).toBe(false);
    });

    it("should return null when rendering an empty table", () => {
      const table = b.table({});
      expect(table.render()).toBeNull();
    });
  });

  describe("addRow / addRows", () => {
    it("should add a single row via addRow()", () => {
      const table = b.table({ name: "Name" }).addRow({ name: "Alice" });
      expect(table.render()).toBe(
        "| Name  |\n| ----- |\n| Alice |",
      );
    });

    it("should add multiple rows via addRow()", () => {
      const table = b
        .table({ name: "Name" })
        .addRow({ name: "Alice" }, { name: "Bob" });
      expect(table.render()).toBe(
        "| Name  |\n| ----- |\n| Alice |\n| Bob   |",
      );
    });

    it("should add rows via addRows()", () => {
      const table = b
        .table({ name: "Name" })
        .addRows({ name: "Alice" }, { name: "Bob" });
      expect(table.render()).toBe(
        "| Name  |\n| ----- |\n| Alice |\n| Bob   |",
      );
    });

    it("should be chainable", () => {
      const table = b
        .table({ name: "Name" })
        .addRow({ name: "Alice" })
        .addRow({ name: "Bob" });
      expect(table.render()).toBe(
        "| Name  |\n| ----- |\n| Alice |\n| Bob   |",
      );
    });
  });

  describe("column alignment", () => {
    it("should render left alignment marker", () => {
      const table = b.table(
        { col: { name: "Col", align: "left" } },
        { col: "data" },
      );
      expect(table.render()).toBe(
        "| Col  |\n| :--- |\n| data |",
      );
    });

    it("should render right alignment marker", () => {
      const table = b.table(
        { col: { name: "Col", align: "right" } },
        { col: "data" },
      );
      expect(table.render()).toBe(
        "| Col  |\n| ---: |\n| data |",
      );
    });

    it("should render center alignment marker", () => {
      const table = b.table(
        { col: { name: "Col", align: "center" } },
        { col: "data" },
      );
      const result = table.render()!;
      const lines = result.split("\n");
      expect(lines[1]).toContain(":---:");
    });

    it("should render no alignment marker when undefined", () => {
      const table = b.table(
        { col: { name: "Col" } },
        { col: "data" },
      );
      expect(table.render()).toBe(
        "| Col  |\n| ---- |\n| data |",
      );
    });

    it("should space-pad alignment markers within the column", () => {
      const table = b.table(
        { col: { name: "LongColumn", align: "left" } },
        { col: "data" },
      );
      const result = table.render()!;
      const lines = result.split("\n");
      // The separator cell should be padded with spaces to match the header width
      const separatorCell = lines[1].split("|")[1];
      // :--- is the marker, rest is spaces to fill column width
      expect(separatorCell.trim()).toBe(":---");
      // The full cell (including padding) should be as wide as the header cell
      expect(separatorCell.length).toBe(lines[0].split("|")[1].length);
    });
  });

  describe("setColumnAlign", () => {
    it("should set column alignment and be chainable", () => {
      const table = b
        .table({ col: "Col" }, { col: "data" })
        .setColumnAlign("col", "right");
      expect(table.render()).toBe(
        "| Col  |\n| ---: |\n| data |",
      );
    });

    it("should handle setting alignment on non-existent column gracefully", () => {
      const table = b
        .table({ col: "Col" }, { col: "data" })
        .setColumnAlign("nonexistent" as any, "left");
      expect(table.render()).toBe(
        "| Col  |\n| ---- |\n| data |",
      );
    });
  });

  describe("style (default alignment)", () => {
    it("should apply default alignment to all columns", () => {
      const table = b
        .table({ a: "A", b: "B" }, { a: "1", b: "2" })
        .style("center");
      const lines = table.render()!.split("\n");
      expect(lines[1]).toContain(":---:");
    });

    it("should be overridden by per-column alignment", () => {
      const table = b
        .table(
          { a: { name: "A", align: "left" }, b: "B" },
          { a: "1", b: "2" },
        )
        .style("right");
      const lines = table.render()!.split("\n");
      const parts = lines[1].split("|").filter((s) => s.trim() !== "");
      expect(parts[0].trim()).toMatch(/^:[-]+$/);
      expect(parts[1].trim()).toMatch(/^[-]+:$/);
    });
  });

  describe("enforceStyles.tableAlign", () => {
    it("should override all column alignments", () => {
      const table = b.table(
        { a: { name: "A", align: "left" }, b: "B" },
        { a: "1", b: "2" },
      );
      const result = table.render({ enforceStyles: { tableAlign: "center" } });
      const lines = result!.split("\n");
      const separator = lines[1];
      const parts = separator.split("|").filter((s) => s.trim() !== "");
      for (const part of parts) {
        expect(part.trim()).toMatch(/^:[-]+:$/);
      }
    });

    it("should override default style set via style()", () => {
      const table = b
        .table({ col: "Col" }, { col: "data" })
        .style("left");
      const result = table.render({ enforceStyles: { tableAlign: "right" } });
      expect(result).toContain("---:");
      expect(result).not.toContain(":---");
    });
  });

  describe("cell content handling", () => {
    it("should escape pipe characters in cells", () => {
      const table = b.table(
        { col: "Col" },
        { col: "a | b" },
      );
      expect(table.render()).toContain("a \\| b");
    });

    it("should convert newlines to <br> in cells", () => {
      const table = b.table(
        { col: "Col" },
        { col: "line1\nline2" },
      );
      expect(table.render()).toContain("line1<br>line2");
    });

    it("should render disallowed heading block as empty cell", () => {
      const table = b.table(
        { col: "Col" },
        { col: b.h("Title") as any },
      );
      const lines = table.render()!.split("\n");
      const dataRow = lines[2];
      expect(dataRow).toMatch(/\|\s+\|/);
    });

    it("should render disallowed blockquote block as empty cell", () => {
      const table = b.table(
        { col: "Col" },
        { col: b.blockquote("text") as any },
      );
      const lines = table.render()!.split("\n");
      const dataRow = lines[2];
      expect(dataRow).toMatch(/\|\s+\|/);
    });

    it("should render disallowed list block as empty cell", () => {
      const table = b.table(
        { col: "Col" },
        { col: b.list.unordered("item") as any },
      );
      const lines = table.render()!.split("\n");
      const dataRow = lines[2];
      expect(dataRow).toMatch(/\|\s+\|/);
    });

    it("should render disallowed horizontal rule as empty cell", () => {
      const table = b.table(
        { col: "Col" },
        { col: b.hr() as any },
      );
      const lines = table.render()!.split("\n");
      const dataRow = lines[2];
      expect(dataRow).toMatch(/\|\s+\|/);
    });

    it("should render disallowed image block as empty cell", () => {
      const table = b.table(
        { col: "Col" },
        { col: b.img("alt", "url") as any },
      );
      const lines = table.render()!.split("\n");
      const dataRow = lines[2];
      expect(dataRow).toMatch(/\|\s+\|/);
    });

    it("should render inline markdown blocks in cells", () => {
      const table = b.table(
        { col: "Col" },
        { col: b.bold("strong") },
      );
      expect(table.render()).toContain("**strong**");
    });
  });

  describe("maxWidth and truncation", () => {
    it("should truncate cell content with ellipsis when exceeding maxWidth", () => {
      const table = b.table(
        { col: { name: "Col", maxWidth: 10 } },
        { col: "this is a very long string" },
      );
      const result = table.render()!;
      const lines = result.split("\n");
      const dataRow = lines[2];
      const cellContent = dataRow.split("|")[1].trim();
      expect(cellContent.length).toBeLessThanOrEqual(10);
      expect(cellContent).toContain("...");
    });

    it("should respect word boundaries when truncating", () => {
      const table = b.table(
        { col: { name: "Col", maxWidth: 12 } },
        { col: "hello world foobar" },
      );
      const result = table.render()!;
      const lines = result.split("\n");
      const dataRow = lines[2];
      const cellContent = dataRow.split("|")[1].trim();
      expect(cellContent).toContain("...");
      expect(cellContent.length).toBeLessThanOrEqual(12);
    });

    it("should truncate headers to effective width", () => {
      const table = b.table(
        { col: { name: "Very Long Header Name", maxWidth: 10 } },
        { col: "short" },
      );
      const result = table.render()!;
      const lines = result.split("\n");
      const headerRow = lines[0];
      const headerContent = headerRow.split("|")[1].trim();
      expect(headerContent).toContain("...");
    });

    it("should set maxWidth via setColumnMaxWidth() and be chainable", () => {
      const table = b
        .table({ col: "Col" }, { col: "a very long piece of text here" })
        .setColumnMaxWidth("col", 10);
      const result = table.render()!;
      const lines = result.split("\n");
      const dataRow = lines[2];
      const cellContent = dataRow.split("|")[1].trim();
      expect(cellContent.length).toBeLessThanOrEqual(10);
      expect(cellContent).toContain("...");
    });

    it("should handle setColumnMaxWidth on non-existent column gracefully", () => {
      const table = b
        .table({ col: "Col" }, { col: "data" })
        .setColumnMaxWidth("nonexistent" as any, 5);
      expect(table.render()).toBe(
        "| Col  |\n| ---- |\n| data |",
      );
    });
  });

  describe("coercion", () => {
    it("should be coercible via String()", () => {
      const table = b.table(
        { name: "Name" },
        { name: "Alice" },
      );
      expect(String(table)).toBe(
        "| Name  |\n| ----- |\n| Alice |",
      );
    });

    it("should be coercible via template literal", () => {
      const table = b.table(
        { name: "Name" },
        { name: "Alice" },
      );
      expect(`${table}`).toBe(
        "| Name  |\n| ----- |\n| Alice |",
      );
    });
  });

  describe("getMetadataTags", () => {
    it("should include style tag when style is set", () => {
      const table = b.table({ a: "A" }).style("center");
      expect(table.getMetadataTags()).toContain("style=center");
    });

    it("should include columns tag", () => {
      const table = b.table({ a: "A", b: "B" });
      expect(table.getMetadataTags()).toContain("columns=a,b");
    });

    it("should include rows tag when rows exist", () => {
      const table = b.table(
        { a: "A" },
        { a: "1" },
        { a: "2" },
      );
      expect(table.getMetadataTags()).toContain("rows=2");
    });

    it("should not include rows tag when no rows exist", () => {
      const table = b.table({ a: "A" });
      const tags = table.getMetadataTags();
      expect(tags.some((t) => t.startsWith("rows="))).toBe(false);
    });

    it("should not include style tag when no style is set", () => {
      const table = b.table({ a: "A" });
      const tags = table.getMetadataTags();
      expect(tags.some((t) => t.startsWith("style="))).toBe(false);
    });
  });

  describe("factory aliases", () => {
    it("should be creatable via b.table()", () => {
      const table = b.table({ col: "Col" }, { col: "val" });
      expect(table.render()).toBeTruthy();
    });

    it("should be creatable via b.tb()", () => {
      const table = b.tb({ col: "Col" }, { col: "val" });
      expect(table.render()).toBeTruthy();
    });

    it("should be creatable via b.t()", () => {
      const table = b.t({ col: "Col" }, { col: "val" });
      expect(table.render()).toBeTruthy();
    });
  });

  describe("multi-column tables", () => {
    it("should render a table with multiple columns and rows", () => {
      const table = b.table(
        { name: "Name", role: "Role", age: "Age" },
        { name: "Alice", role: "Engineer", age: "30" },
        { name: "Bob", role: "Designer", age: "25" },
      );
      const result = table.render()!;
      const lines = result.split("\n");
      expect(lines).toHaveLength(4);
      expect(lines[0]).toMatch(/^\| Name\s+\| Role\s+\| Age \|$/);
      expect(lines[1]).toMatch(/^\| [-]+\s*\| [-]+\s*\| [-]+ \|$/);
      expect(lines[2]).toMatch(/^\| Alice\s+\| Engineer \| 30\s+\|$/);
      expect(lines[3]).toMatch(/^\| Bob\s+\| Designer \| 25\s+\|$/);
    });

    it("should handle mixed alignment across columns", () => {
      const table = b.table(
        {
          left: { name: "Left", align: "left" },
          center: { name: "Center", align: "center" },
          right: { name: "Right", align: "right" },
        },
        { left: "a", center: "b", right: "c" },
      );
      const result = table.render()!;
      const lines = result.split("\n");
      const separatorParts = lines[1]
        .split("|")
        .filter((s) => s.trim() !== "");
      expect(separatorParts[0].trim()).toMatch(/^:[-]+$/);
      expect(separatorParts[1].trim()).toMatch(/^:[-]+:$/);
      expect(separatorParts[2].trim()).toMatch(/^[-]+:$/);
    });
  });

  describe("column definition via object", () => {
    it("should accept object column definitions with name only", () => {
      const table = b.table(
        { col: { name: "Column" } },
        { col: "value" },
      );
      expect(table.render()).toContain("Column");
    });

    it("should accept object column definitions with all options", () => {
      const table = b.table(
        { col: { name: "Col", maxWidth: 20, align: "center" } },
        { col: "value" },
      );
      const result = table.render()!;
      expect(result).toContain("Col");
      expect(result).toContain(":---:");
    });
  });
});
