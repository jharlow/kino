import {
  BlockMetadataTags,
  MarkdownBlock,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import { MarkdownLineBlockContent } from "../primitives/markdown-line-block";
import { MarkdownMultilineBlock } from "../primitives/markdown-multiline-block";
import { MarkdownBlockquoteBlock } from "../standard/markdown-blockquote-block";
import { MarkdownHeadingBlock } from "../standard/markdown-heading-block";
import { MarkdownHorizontalRuleBlock } from "../standard/markdown-horizontal-rule-block";
import { MarkdownImageBlock } from "../standard/markdown-image-block";
import { MarkdownListBlock } from "../standard/markdown-list-block";

export type MarkdownTableAlignStyle = "left" | "center" | "right" | undefined;
export type MarkdownTableMaxWidth = number | undefined;
export type MarkdownTableBlockContent = Exclude<
  MarkdownLineBlockContent,
  MarkdownHeadingBlock | MarkdownHorizontalRuleBlock | MarkdownImageBlock
>;
export type MarkdownTableColumn<TColumnKey extends string> = {
  name: MarkdownTableBlockContent;
  key: TColumnKey;
  maxWidth: MarkdownTableMaxWidth;
  align: MarkdownTableAlignStyle;
};

export type ColumnsDefinition<TColumnKey extends string> = Record<
  TColumnKey,
  string | Pick<MarkdownTableColumn<TColumnKey>, "name" | "maxWidth" | "align">
>;

export type MarkdownTableRow<TColumnKey extends string> = Record<
  TColumnKey,
  MarkdownTableBlockContent
>;
export class MarkdownTableBlock<
  TColumnKey extends string,
> extends MarkdownMultilineBlock {
  public $columns: Array<MarkdownTableColumn<TColumnKey>>;
  private readonly _defaultColumnMaxWidth: MarkdownTableMaxWidth = undefined;
  public $rows: Array<MarkdownTableRow<TColumnKey>>;

  constructor(
    columnsDefinition: ColumnsDefinition<TColumnKey>,
    ...rows: Array<MarkdownTableRow<TColumnKey>>
  ) {
    super();
    this.$columns = Object.entries(columnsDefinition).map(([key, def]) => {
      if (typeof def === "string") {
        return {
          key,
          name: def,
          maxWidth: this._defaultColumnMaxWidth,
        };
      }
      const { name, maxWidth, align } = def as Pick<
        MarkdownTableColumn<TColumnKey>,
        "name" | "maxWidth" | "align"
      >;
      return {
        key,
        name,
        maxWidth: maxWidth ?? this._defaultColumnMaxWidth,
        align,
      };
    }) as Array<MarkdownTableColumn<TColumnKey>>;
    this.$rows = rows;
  }

  addRow(...rows: Array<MarkdownTableRow<TColumnKey>>): this {
    this.$rows.push(...rows);
    return this;
  }

  addRows(...rows: Array<MarkdownTableRow<TColumnKey>>): this {
    return this.addRow(...rows);
  }

  setColumnMaxWidth(columnKey: TColumnKey, width: number): this {
    const columnIndex = this.$columns.findIndex((c) => c.key === columnKey);
    if (columnIndex === -1) return this;
    this.$columns[columnIndex].maxWidth = width;
    return this;
  }

  setColumnAlign(columnKey: TColumnKey, align: MarkdownTableAlignStyle): this {
    const columnIndex = this.$columns.findIndex((c) => c.key === columnKey);
    if (columnIndex === -1) return this;
    this.$columns[columnIndex].align = align;
    return this;
  }

  public $style: MarkdownTableAlignStyle | undefined;

  style(opt: MarkdownTableAlignStyle): this {
    this.$style = opt;
    return this;
  }

  public get isEmpty(): boolean {
    return this.$columns.length === 0;
  }

  private truncateText(text: string, maxWidth: number): string {
    if (text.length <= maxWidth) return text;
    const ellipsis = "...";
    const available = maxWidth - ellipsis.length;
    if (available <= 0) return ellipsis.slice(0, maxWidth);
    const words = text.split(" ");
    let result = "";
    for (const word of words) {
      const candidate = result === "" ? word : result + " " + word;
      if (candidate.length > available) break;
      result = candidate;
    }
    return (result || text.slice(0, available)) + ellipsis;
  }

  private renderCell(
    value: MarkdownTableBlockContent,
    maxWidth: MarkdownTableMaxWidth,
    options?: OptionalRenderingOptions,
  ): string {
    let rendered: string;
    if (
      value instanceof MarkdownHeadingBlock ||
      value instanceof MarkdownBlockquoteBlock ||
      value instanceof MarkdownListBlock ||
      value instanceof MarkdownHorizontalRuleBlock ||
      value instanceof MarkdownImageBlock
    ) {
      rendered = "";
    } else if (value instanceof MarkdownBlock) {
      rendered = value.render(options) ?? "";
    } else {
      rendered = value == null ? "" : String(value);
    }
    rendered = rendered.replace(/\n/g, "<br>").replace(/\|/g, "\\|");
    if (maxWidth !== undefined && rendered.length > maxWidth) {
      rendered = this.truncateText(rendered, maxWidth);
    }
    return rendered;
  }

  private renderSeparator(
    col: MarkdownTableColumn<TColumnKey>,
    width: number,
    options?: OptionalRenderingOptions,
  ): string {
    const align =
      options?.enforceStyles?.tableAlign ?? col.align ?? this.$style;
    const w = Math.max(3, width);
    if (align === "left") {
      const marker = ":---";
      return marker + " ".repeat(Math.max(0, w - marker.length));
    }
    if (align === "right") {
      const marker = "---:";
      return " ".repeat(Math.max(0, w - marker.length)) + marker;
    }
    if (align === "center") {
      const marker = ":---:";
      const total = Math.max(0, w - marker.length);
      const left = Math.floor(total / 2);
      const right = total - left;
      return " ".repeat(left) + marker + " ".repeat(right);
    }
    return "-".repeat(w);
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;

    // Pre-render all cells (with maxWidth truncation)
    const renderedRows = this.$rows.map((row) =>
      this.$columns.map((col) =>
        this.renderCell(row[col.key], col.maxWidth, options),
      ),
    );

    // Compute column widths and prepare header text
    const columnData = this.$columns.map((col, colIdx) => {
      const maxCellWidth = renderedRows.reduce(
        (max, row) => Math.max(max, row[colIdx].length),
        0,
      );

      let headerText =
        col.name instanceof MarkdownBlock
          ? (col.name.render(options) ?? "")
          : String(col.name);
      if (col.maxWidth !== undefined) {
        const effectiveWidth = Math.min(
          col.maxWidth,
          Math.max(maxCellWidth, 3),
        );
        if (headerText.length > effectiveWidth) {
          headerText = this.truncateText(headerText, effectiveWidth);
        }
      }

      const columnWidth = Math.max(headerText.length, maxCellWidth);
      return { headerText, columnWidth };
    });

    const pad = (text: string, width: number) =>
      text + " ".repeat(Math.max(0, width - text.length));

    const header =
      "| " +
      columnData.map((d) => pad(d.headerText, d.columnWidth)).join(" | ") +
      " |";
    const separator =
      "| " +
      this.$columns
        .map((col, i) =>
          this.renderSeparator(
            col,
            Math.max(3, columnData[i].columnWidth),
            options,
          ),
        )
        .join(" | ") +
      " |";
    const rows = renderedRows.map(
      (cells) =>
        "| " +
        cells
          .map((cell, i) => pad(cell, columnData[i].columnWidth))
          .join(" | ") +
        " |",
    );
    return [header, separator, ...rows].join("\n");
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$style ? [`style=${this.$style}`] : [])
      .concat(
        this.$columns.length > 0
          ? [`columns=${this.$columns.map((c) => c.key).join(",")}`]
          : [],
      )
      .concat(this.$rows.length > 0 ? [`rows=${this.$rows.length}`] : []);
  }

  public [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "number") return this.$rows.length.toString();
    return this.render(this.getRenderingOptions()) ?? "";
  }
}

export const table = <TColumnKey extends string>(
  columnsDefinition: ColumnsDefinition<TColumnKey>,
  ...rows: Array<MarkdownTableRow<TColumnKey>>
): MarkdownTableBlock<TColumnKey> => {
  return new MarkdownTableBlock(columnsDefinition, ...rows);
};
export const tb = table;
export const t = table;
