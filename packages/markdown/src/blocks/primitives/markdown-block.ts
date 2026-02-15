import type { MarkdownTableAlignStyle } from "../extended/markdown-table-block";
import type { MarkdownTaskItemBlockStyle } from "../extended/markdown-task-item-block";
import type { MarkdownBoldStyle } from "../standard/markdown-bold-block";
import type { MarkdownHorizontalRuleStyle } from "../standard/markdown-horizontal-rule-block";
import type { MarkdownItalicStyle } from "../standard/markdown-italic-block";
import type { MarkdownUnorderedListItemStyle } from "../standard/markdown-unordered-list-item-block";
import { MarkdownBlockInspector } from "./markdown-block-inspector";
import { StringReadable } from "./string-readable";
import { PrimitiveValue } from "./values";

export interface EnforceStylesOptions {
  bold?: MarkdownBoldStyle;
  italic?: MarkdownItalicStyle;
  unorderedListItem?: MarkdownUnorderedListItemStyle;
  horizontalRule?: MarkdownHorizontalRuleStyle;
  taskItem?: MarkdownTaskItemBlockStyle;
  tableAlign?: MarkdownTableAlignStyle;
}

export interface EnforceIndentationOptions {
  list?: number;
}

export type NewlineStrategy =
  | "before_and_after_heading"
  | "between_blocks"
  | "none";

export interface RenderingOptions {
  renderNullish: boolean;
  lineJoinString: string;
  enforceStyles: EnforceStylesOptions;
  enforceIndentation: EnforceIndentationOptions;
  newlineStrategy: NewlineStrategy;
}

const defaultRenderingOptions: RenderingOptions = {
  renderNullish: false,
  lineJoinString: "",
  enforceStyles: {},
  enforceIndentation: {},
  newlineStrategy: "none",
};

export const renderingOptions = (
  options: OptionalRenderingOptions,
): RenderingOptions => {
  return {
    ...defaultRenderingOptions,
    enforceStyles: {
      ...defaultRenderingOptions.enforceStyles,
      ...options.enforceStyles,
    },
    enforceIndentation: {
      ...defaultRenderingOptions.enforceIndentation,
      ...options.enforceIndentation,
    },
    ...options,
  };
};

export type OptionalRenderingOptions = Partial<RenderingOptions>;

export type BlockMetadataTags = string[];

export abstract class MarkdownBlock implements StringReadable {
  protected readonly _EMPTY_STRING = "";
  protected readonly _SPACE_STRING = " ";

  public inspect(): string {
    return new MarkdownBlockInspector(this).inspect();
  }

  protected $renderingOptions: RenderingOptions | undefined;
  protected readonly _defaultRenderingOptions: RenderingOptions =
    defaultRenderingOptions;

  public setRenderingOptions(options: OptionalRenderingOptions): this {
    this.$renderingOptions = {
      ...this._defaultRenderingOptions,
      ...this.$renderingOptions,
      ...options,
    };
    return this;
  }

  protected getRenderingOptions(
    options?: OptionalRenderingOptions,
  ): RenderingOptions {
    return {
      ...this._defaultRenderingOptions,
      ...this.$renderingOptions,
      ...options,
    };
  }

  protected shouldFilter(
    value: unknown,
    options?: OptionalRenderingOptions,
  ): boolean {
    const { renderNullish } = this.getRenderingOptions(options);
    if (!renderNullish && (value === null || value === undefined)) return false;
    return true;
  }

  public $trim: boolean = true;

  public trim(value: boolean = true): this {
    this.$trim = value;
    return this;
  }

  protected dedent(content: string): string {
    const lines = content.split("\n");
    const nonEmptyLines = lines.filter((l) => l.trim() !== "");
    if (nonEmptyLines.length === 0) return content;
    const minIndent = Math.min(
      ...nonEmptyLines.map((l) => (l.match(/^(\s*)/) ?? ["", ""])[1].length),
    );
    if (minIndent === 0) return content;
    return lines.map((l) => l.slice(Math.min(minIndent, l.length))).join("\n");
  }

  public getMetadataTags(): BlockMetadataTags {
    return [];
  }

  public abstract isEmpty: boolean;

  public abstract render(options?: OptionalRenderingOptions): string | null;

  public toString(): string {
    return this.render(this.getRenderingOptions()) ?? this._EMPTY_STRING;
  }

  protected isPrimitive(value: unknown): value is PrimitiveValue {
    if (typeof value === "string") return true;
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (value === null) return true;
    if (value === undefined) return true;
    return false;
  }

  protected isPrimitiveEmpty(value: PrimitiveValue): boolean {
    return value === null || value === undefined || value === "";
  }

  public abstract [Symbol.toPrimitive](
    hint: "default" | "string" | "number",
  ): string;
}
