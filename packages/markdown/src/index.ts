import { type EmojiShortname } from "./emojis";

export interface StringReadable {
  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string;
  toString(): string;
}

export type PrimitiveValues = string | number | boolean | null | undefined;

export interface EnforceStylesOptions {
  bold?: MarkdownBoldStyle;
  italic?: MarkdownItalicStyle;
  unorderedListItem?: MarkdownUnorderedListItemStyle;
  horizontalRule?: MarkdownHorizontalRuleStyle;
  taskItem?: MarkdownTaskItemBlockStyle;
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

export type BooleanCoercibleValue =
  | boolean
  | null
  | undefined
  | string
  | number;

export type MarkdownBoldStyle = "**" | "__";
export type MarkdownItalicStyle = "*" | "_";
export type MarkdownUnorderedListItemStyle = "*" | "-" | "+";
export type MarkdownHorizontalRuleStyle = "-" | "*" | "_";
export type MarkdownTaskItemBlockStyle = "x" | "X";

export abstract class MarkdownBlock implements StringReadable {
  protected readonly _EMPTY_STRING = "";
  protected readonly _SPACE_STRING = " ";

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

  public $trim: boolean = false;

  public trim(value: boolean = true): this {
    this.$trim = value;
    return this;
  }

  public abstract isEmpty: boolean;
  public abstract render(options?: OptionalRenderingOptions): string | null;

  protected isPrimitive(value: unknown): value is PrimitiveValues {
    if (typeof value === "string") return true;
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (value === null) return true;
    if (value === undefined) return true;
    return false;
  }

  protected isPrimitiveEmpty(value: PrimitiveValues): boolean {
    return value === null || value === undefined || value === "";
  }

  public abstract [Symbol.toPrimitive](
    hint: "default" | "string" | "number",
  ): string;
}

export type MarkdownInlineBlockContent = PrimitiveValues | MarkdownInlineBlock;

export class MarkdownInlineBlock extends MarkdownBlock {
  public $content: Array<MarkdownInlineBlockContent> = [];

  constructor(...content: Array<MarkdownInlineBlockContent>) {
    super();
    this.$content.push(...content);
  }

  public emptyIf(condition: BooleanCoercibleValue): this {
    if (Boolean(condition)) return this;
    this.$content = [];
    return this;
  }

  /**
   * @alias emptyIf
   * @param condition - The condition to check.
   * @returns The block instance.
   */
  public if(condition: BooleanCoercibleValue): this {
    return this.emptyIf(condition);
  }

  public defaultIfEmpty(...content: Array<MarkdownInlineBlockContent>): this {
    if (!this.isEmpty) return this;
    this.$content = content;
    return this;
  }

  /**
   * @alias defaultIfEmpty
   * @param content - The content to set if the block is empty.
   * @returns The block instance.
   */
  public default(...content: Array<MarkdownInlineBlockContent>): this {
    return this.defaultIfEmpty(...content);
  }

  public get isEmpty(): boolean {
    return (
      this.$content.length === 0 ||
      this.$content.every((block) =>
        block instanceof MarkdownBlock
          ? block.isEmpty
          : this.isPrimitiveEmpty(block),
      )
    );
  }

  public bold(): MarkdownBoldBlock {
    return new MarkdownBoldBlock(this);
  }

  public b(): MarkdownBoldBlock {
    return this.bold();
  }

  public italic(): MarkdownItalicBlock {
    return new MarkdownItalicBlock(this);
  }

  public i(): MarkdownItalicBlock {
    return this.italic();
  }

  public strikethrough(): MarkdownStrikethroughBlock {
    return new MarkdownStrikethroughBlock(this);
  }

  public st(): MarkdownStrikethroughBlock {
    return this.strikethrough();
  }

  public highlight(): MarkdownHighlightBlock {
    return new MarkdownHighlightBlock(this);
  }

  public hl(): MarkdownHighlightBlock {
    return this.highlight();
  }

  public subscript(): MarkdownSubscriptBlock {
    return new MarkdownSubscriptBlock();
  }

  public sub(): MarkdownSubscriptBlock {
    return this.subscript();
  }

  public superscript(): MarkdownSuperscriptBlock {
    return new MarkdownSuperscriptBlock(this);
  }

  public sup(): MarkdownSuperscriptBlock {
    return this.superscript();
  }

  public link(url: string): MarkdownLinkBlock {
    return new MarkdownLinkBlock(url, this);
  }

  public url(url: string): MarkdownLinkBlock {
    return this.link(url);
  }

  public image(src: string): MarkdownImageBlock {
    return new MarkdownImageBlock(src, this);
  }

  public img(src: string): MarkdownImageBlock {
    return this.image(src);
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const { lineJoinString } = this.getRenderingOptions(options);
    const content = this.$content
      .filter((line) => this.shouldFilter(line, options))
      .map((block) =>
        block instanceof MarkdownBlock ? block.render(options) : String(block),
      )
      .join(lineJoinString);

    return this.$trim
      ? content
          .split("\n")
          .map((line) => line.replace(/^\s+/, ""))
          .join("\n")
      : content;
  }

  public [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return this.render(this.getRenderingOptions()) ?? "";
    if (hint === "number") return this.$content.length.toString();
    return this.render(this.getRenderingOptions()) ?? "";
  }
}

export type MarkdownLineBlockContent = PrimitiveValues | MarkdownInlineBlock;
export class MarkdownLineBlock extends MarkdownBlock {
  public $line: Array<MarkdownLineBlockContent> = [];

  constructor(...line: Array<MarkdownLineBlockContent>) {
    super();
    this.$line.push(...line);
  }

  public emptyIf(condition: BooleanCoercibleValue): this {
    if (Boolean(condition)) return this;
    this.$line = [];
    return this;
  }

  public defaultIfEmpty(...line: Array<MarkdownLineBlockContent>): this {
    if (!this.isEmpty) return this;
    this.$line = line;
    return this;
  }

  public get isEmpty(): boolean {
    return (
      this.$line.length === 0 ||
      this.$line.every((block) =>
        block instanceof MarkdownBlock
          ? block.isEmpty
          : this.isPrimitiveEmpty(block),
      )
    );
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const { lineJoinString } = this.getRenderingOptions(options);
    const content = this.$line
      .filter((line) => this.shouldFilter(line, options))
      .map((line) =>
        line instanceof MarkdownBlock ? line.render(options) : line,
      )
      .join(lineJoinString);
    return this.$trim
      ? content
          .split("\n")
          .map((line) => line.replace(/^\s+/, ""))
          .join("\n")
      : content;
  }

  public [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return this.render(this.getRenderingOptions()) ?? "";
    if (hint === "number") return this.$line.length.toString();
    return this.render(this.getRenderingOptions()) ?? "";
  }
}

export type MarkdownMultilineBlockOptions = {
  excludeMultiline: boolean;
};
export type MarkdownMultilineBlockContent<
  OPTS extends MarkdownMultilineBlockOptions = { excludeMultiline: false },
> = OPTS["excludeMultiline"] extends true
  ? PrimitiveValues | MarkdownInlineBlock | MarkdownLineBlock
  :
      | PrimitiveValues
      | MarkdownInlineBlock
      | MarkdownLineBlock
      | MarkdownMultilineBlock;
export class MarkdownMultilineBlock<
  OPTS extends MarkdownMultilineBlockOptions = { excludeMultiline: false },
> extends MarkdownBlock {
  public $lines: Array<MarkdownMultilineBlockContent<OPTS>> = [];
  private $depth: number = 0;

  constructor(...lines: Array<MarkdownMultilineBlockContent<OPTS>>) {
    super();
    this.$lines.push(...lines);
  }

  public emptyIf(condition: BooleanCoercibleValue): this {
    if (Boolean(condition)) return this;
    this.$lines = [];
    return this;
  }

  public defaultIfEmpty(...lines: Array<MarkdownLineBlockContent>): this {
    if (!this.isEmpty) return this;
    this.$lines = lines;
    return this;
  }

  public set depth(value: number) {
    this.$depth = value;
  }

  public get depth(): number {
    return this.$depth;
  }

  public get isEmpty(): boolean {
    return (
      this.$lines.length === 0 ||
      this.$lines.every((line) =>
        line instanceof MarkdownBlock
          ? line.isEmpty
          : this.isPrimitiveEmpty(line),
      )
    );
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const { newlineStrategy } = this.getRenderingOptions(options);
    const entries = this.$lines
      .filter((line) => this.shouldFilter(line, options))
      .map((line) => {
        if (this.isPrimitive(line)) return { rendered: line, source: line };
        if (line instanceof MarkdownSectionBlock) {
          line.depth = this.$depth + 1;
        }
        if (line instanceof MarkdownHeadingBlock) {
          const safeLevel = Math.max(
            1,
            Math.min(6, this.$depth + 1),
          ) as MarkdownHeadingLevel;
          line.level(safeLevel);
        }
        // in multi-line, the br as an entire line should be rendered as an
        // empty string since it already gets rendered as a whole line
        const rendered =
          line instanceof MarkdownLineBreakBlock ? "" : line.render(options);
        return { rendered, source: line };
      });

    if (newlineStrategy === "none") {
      return entries.map((e) => e.rendered).join("\n");
    }

    const startsWithHeading = (s: unknown): boolean =>
      s instanceof MarkdownHeadingBlock ||
      (s instanceof MarkdownMultilineBlock &&
        s.$lines.length > 0 &&
        s.$lines[0] instanceof MarkdownHeadingBlock);

    const content = entries
      .map((entry, i) => {
        if (i === 0) return String(entry.rendered);
        const prev = entries[i - 1];
        let sep = "\n";
        if (
          newlineStrategy === "before_and_after_heading" &&
          (prev.source instanceof MarkdownHeadingBlock ||
            startsWithHeading(entry.source))
        ) {
          sep = "\n\n";
        } else if (newlineStrategy === "between_blocks") {
          sep = "\n\n";
        }
        return sep + String(entry.rendered);
      })
      .join("");

    return this.$trim
      ? content
          .split("\n")
          .map((line) => line.replace(/^\s+/, ""))
          .join("\n")
      : content;
  }

  public [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return this.render(this.getRenderingOptions()) ?? "";
    if (hint === "number") return this.$lines.length.toString();
    return this.render(this.getRenderingOptions()) ?? "";
  }
}

export class MarkdownSectionBlock extends MarkdownMultilineBlock {
  private collectFootnotes(): MarkdownFootnoteBlock[] {
    const footnotes: MarkdownFootnoteBlock[] = [];
    const walk = (item: unknown) => {
      if (item instanceof MarkdownFootnoteBlock) {
        footnotes.push(item);
      }
      if (item instanceof MarkdownMultilineBlock) {
        item.$lines.forEach(walk);
      } else if (item instanceof MarkdownLineBlock) {
        item.$line.forEach(walk);
      } else if (item instanceof MarkdownInlineBlock) {
        item.$content.forEach(walk);
      }
    };
    this.$lines.forEach(walk);
    return footnotes;
  }

  public [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "number") return this.$lines.length.toString();

    const footnotes = this.collectFootnotes();
    let counter = 1;
    for (const fn of footnotes) {
      if (!fn.$identifier && !fn.$footer.isEmpty) {
        fn.$identifier = String(counter++);
      }
    }

    const options = this.getRenderingOptions();
    const body = this.render(options) ?? "";

    if (footnotes.length === 0) return body;

    const definitions = footnotes
      .map((fn) => fn.renderDefinition(options))
      .filter((d) => d !== null)
      .join("\n");
    return definitions ? `${body}\n\n${definitions}` : body;
  }
}

export const section = (
  ...lines: Array<MarkdownMultilineBlockContent>
): MarkdownSectionBlock => {
  return new MarkdownSectionBlock(...lines);
};
export const sec = section;
export const s = section;

export type MarkdownDocumentContent = MarkdownMultilineBlockContent;
export class MarkdownDocument extends MarkdownSectionBlock {}

export const document = (
  ...lines: Array<MarkdownDocumentContent>
): MarkdownDocument => {
  return new MarkdownDocument(...lines);
};
export const doc = document;
export const d = document;

export class MarkdownParagraphBlock extends MarkdownInlineBlock {}

export const paragraph = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownParagraphBlock => {
  return new MarkdownParagraphBlock(...line);
};
export const para = paragraph;
export const p = paragraph;

export class MarkdownLiteral extends MarkdownInlineBlock {
  constructor(...line: Array<MarkdownInlineBlockContent>) {
    super(...(line as Array<MarkdownLineBlockContent>));
  }

  public render(): string | null {
    const content = super.render();
    if (content === null) return null;
    return content;
  }
}

export function markdown(
  strings: TemplateStringsArray,
  ...exprs: Array<MarkdownMultilineBlockContent>
): MarkdownLiteral {
  const parts: Array<MarkdownMultilineBlockContent> = [];
  for (let i = 0; i < strings.length; i++) {
    parts.push(strings[i]);
    if (i < exprs.length) parts.push(exprs[i]);
  }
  return new MarkdownLiteral(...(parts as Array<MarkdownInlineBlockContent>));
}
export const md = markdown;

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export class MarkdownHeadingBlock extends MarkdownLineBlock {
  public $level: MarkdownHeadingLevel | undefined;
  public $id: string | undefined;
  private readonly _defaultLevel: MarkdownHeadingLevel = 1;

  public identifier(value: string): this {
    if (this.$id) return this;
    this.$id = value;
    return this;
  }

  public id(value: string): this {
    return this.identifier(value);
  }

  public level(opt: MarkdownHeadingLevel): this {
    if (this.$level) return this;
    this.$level = opt;
    return this;
  }

  public l(opt: MarkdownHeadingLevel): this {
    return this.level(opt);
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `${"#".repeat(this.$level ?? this._defaultLevel)} ${super.render(options)}${this.$id ? ` {#${this.$id}}` : ""}`;
  }
}

export const heading = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownHeadingBlock => {
  return new MarkdownHeadingBlock(...line);
};
export const head = heading;
export const h = heading;

export class MarkdownBoldBlock extends MarkdownInlineBlock {
  public $style: MarkdownBoldStyle | undefined;
  private readonly _defaultStyle: MarkdownBoldStyle = "**";

  style(opt: MarkdownBoldStyle): this {
    this.$style = opt;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    const style =
      options?.enforceStyles?.bold ?? this.$style ?? this._defaultStyle;
    return `${style}${content}${style}`;
  }
}

export const bold = (
  ...content: Array<MarkdownInlineBlockContent>
): MarkdownBoldBlock => {
  return new MarkdownBoldBlock(...content);
};

export class MarkdownItalicBlock extends MarkdownInlineBlock {
  public $style: MarkdownItalicStyle | undefined;
  private readonly _defaultStyle: MarkdownItalicStyle = "*";

  public style(opt: MarkdownItalicStyle): this {
    this.$style = opt;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    const style =
      options?.enforceStyles?.italic ?? this.$style ?? this._defaultStyle;
    return `${style}${content}${style}`;
  }
}

export const italic = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownItalicBlock => {
  return new MarkdownItalicBlock(...content);
};
export const i = italic;
export class MarkdownStrikethroughBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `~~${content}~~`;
  }
}

export const strikethrough = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownStrikethroughBlock => {
  return new MarkdownStrikethroughBlock(...content);
};
export const strike = strikethrough;
export const st = strikethrough;

export class MarkdownHighlightBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `==${content}==`;
  }
}

export const highlight = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownHighlightBlock => {
  return new MarkdownHighlightBlock(...content);
};
export const high = highlight;
export const hl = highlight;

export class MarkdownSubscriptBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `~${content}~`;
  }
}

export const subscript = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownSubscriptBlock => {
  return new MarkdownSubscriptBlock(...content);
};
export const sub = subscript;

export class MarkdownSuperscriptBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `^${content}^`;
  }
}

export const superscript = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownSuperscriptBlock => {
  return new MarkdownSuperscriptBlock(...content);
};
export const sup = superscript;

export class MarkdownLinkBlock extends MarkdownInlineBlock {
  public $url: string;

  constructor(url: string, ...label: Array<MarkdownInlineBlockContent>) {
    super(...label);
    this.$url = url;
  }

  public defaultIfEmpty(
    url: string,
    ...label: Array<MarkdownInlineBlockContent>
  ): this {
    if (!this.isEmpty) return this;
    this.$url = url;
    this.$content = label;
    return this;
  }

  public default(
    url: string,
    ...label: Array<MarkdownInlineBlockContent>
  ): this {
    return this.defaultIfEmpty(url, ...label);
  }

  public render(options?: OptionalRenderingOptions): string {
    const content = super.render(options);
    if (content === null) return `<${this.$url}>`;
    return `[${content}](${this.$url})`;
  }
}

export const link = (
  url: string,
  ...label: Array<string | MarkdownInlineBlock>
): MarkdownLinkBlock => {
  return new MarkdownLinkBlock(url, ...label);
};
export const url = link;

export class MarkdownListBlock extends MarkdownMultilineBlock {
  public $indent: number | undefined;
  private readonly _defaultIndent: number = 2;

  public indent(value: number): this {
    if (this.$indent) return this;
    this.$indent = value;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const indent =
      options?.enforceIndentation?.list ?? this.$indent ?? this._defaultIndent;
    return this.$lines
      .map((line) => {
        if (line instanceof MarkdownListBlock) {
          if (!line.$indent) {
            line.indent(indent);
          }
          const rendered = line.render(options);
          if (rendered === null) return null;
          return rendered
            .split("\n")
            .map((l) => this._SPACE_STRING.repeat(indent) + l)
            .join("\n");
        }
        if (this.isPrimitive(line)) return line;
        return line.render(options);
      })
      .filter((line) => line !== null)
      .join("\n");
  }
}

export class MarkdownUnorderedListItemBlock extends MarkdownLineBlock {
  public $style: MarkdownUnorderedListItemStyle | undefined;
  private readonly _defaultStyle: MarkdownUnorderedListItemStyle = "-";

  public style(opt: MarkdownUnorderedListItemStyle): this {
    this.$style = opt;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    const style =
      options?.enforceStyles?.unorderedListItem ??
      this.$style ??
      this._defaultStyle;
    return `${style} ${content}`;
  }
}

export const unorderedListItem = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownUnorderedListItemBlock => {
  return new MarkdownUnorderedListItemBlock(...line);
};
export const uli = unorderedListItem;

export class MarkdownUnorderedListBlock extends MarkdownListBlock {
  constructor(...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>) {
    super(
      ...lines.map((line) =>
        line instanceof MarkdownListBlock
          ? line
          : new MarkdownUnorderedListItemBlock(line),
      ),
    );
  }

  public style(opt: MarkdownUnorderedListItemStyle): this {
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownUnorderedListItemBlock) {
        line.style(opt);
      }
    });
    return this;
  }
}

export const unorderedList = (
  ...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>
): MarkdownUnorderedListBlock => {
  return new MarkdownUnorderedListBlock(...lines);
};
export const ul = unorderedList;

export class MarkdownOrderedListItemBlock extends MarkdownLineBlock {
  public $index: number;

  constructor(index: number, ...line: Array<MarkdownLineBlockContent>) {
    super(...line);
    this.$index = index;
  }

  public index(value: number): this {
    this.$index = value;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `${this.$index}. ${content}`;
  }
}

const orderedListItem = (
  index: number,
  ...line: Array<MarkdownLineBlockContent>
): MarkdownOrderedListItemBlock => {
  return new MarkdownOrderedListItemBlock(index, ...line);
};
export const oli = orderedListItem;

export class MarkdownOrderedListBlock extends MarkdownListBlock {
  constructor(...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>) {
    let itemIndex = 1;
    super(
      ...lines.map((line) =>
        line instanceof MarkdownListBlock
          ? line
          : new MarkdownOrderedListItemBlock(itemIndex++, line),
      ),
    );
  }

  public startingIndex(value: number): this {
    let itemIndex = 0;
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownOrderedListItemBlock) {
        line.index(itemIndex + value);
        itemIndex++;
      }
    });
    return this;
  }
}

export const orderedList = (
  ...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>
): MarkdownOrderedListBlock => {
  return new MarkdownOrderedListBlock(...lines);
};
export const ol = orderedList;

export class MarkdownTaskItemBlock extends MarkdownLineBlock {
  public $checked: boolean = false;
  public $style: MarkdownTaskItemBlockStyle | undefined;
  private readonly _defaultStyle: MarkdownTaskItemBlockStyle = "x";

  constructor(checked: boolean, ...line: Array<MarkdownLineBlockContent>) {
    super(...line);
    this.$checked = checked;
  }

  public style(opt: MarkdownTaskItemBlockStyle): this {
    this.$style = opt;
    return this;
  }

  public checked(value: boolean): this {
    this.$checked = value;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    const style =
      options?.enforceStyles?.taskItem ?? this.$style ?? this._defaultStyle;
    return `- [${this.$checked ? style : this._SPACE_STRING}] ${content}`;
  }
}

export const taskItem = (
  checked: boolean,
  ...line: Array<MarkdownLineBlockContent>
): MarkdownTaskItemBlock => {
  return new MarkdownTaskItemBlock(checked, ...line);
};
export const tli = taskItem;

export class MarkdownTaskListBlock extends MarkdownListBlock {
  constructor(
    ...lines: Array<
      [boolean, ...MarkdownLineBlockContent[]] | MarkdownListBlock
    >
  ) {
    super(
      ...lines.map((line) => {
        if (line instanceof MarkdownListBlock) return line;
        const [checked, ...content] = line;
        return new MarkdownTaskItemBlock(checked, ...content);
      }),
    );
  }

  public style(opt: MarkdownTaskItemBlockStyle): this {
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownTaskItemBlock) {
        line.style(opt);
      }
    });
    return this;
  }
}

export const tasksList = (
  ...lines: Array<[boolean, ...MarkdownLineBlockContent[]] | MarkdownListBlock>
): MarkdownTaskListBlock => {
  return new MarkdownTaskListBlock(...lines);
};
export const tasks = tasksList;

export type MarkdownCodeBlockLanguage = string;
export class MarkdownCodeBlock extends MarkdownInlineBlock {
  public $language: MarkdownCodeBlockLanguage | undefined;

  constructor(...line: Array<MarkdownMultilineBlockContent>) {
    super(...(line as Array<MarkdownInlineBlockContent>));
  }

  public language(opt: MarkdownCodeBlockLanguage): this {
    this.$language = opt;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    // Remove empty lines at the start and end if this.$trim is true
    let processedContent = content;
    if (this.$trim && processedContent !== null) {
      const lines = processedContent.split("\n");
      // Remove leading empty lines
      while (lines.length > 0 && lines[0].trim() === "") {
        lines.shift();
      }
      // Remove trailing empty lines
      while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
      }
      processedContent = lines.join("\n");
    }
    if (processedContent === null) return null;
    const containsNewlines = processedContent.includes("\n");
    if (!this.$language && this.$content.length === 1 && !containsNewlines) {
      return `\`${content}\``;
    }
    return `\`\`\`${this.$language ?? this._EMPTY_STRING}\n${processedContent}\n\`\`\``;
  }
}

export const codeblock = (
  ...lines: Array<MarkdownLineBlockContent>
): MarkdownCodeBlock => {
  return new MarkdownCodeBlock(...lines);
};
export const code = codeblock;

export class MarkdownImageBlock extends MarkdownInlineBlock {
  public $src: string;

  constructor(src: string, ...alt: Array<MarkdownInlineBlockContent>) {
    super(...alt);
    this.$src = src;
  }

  public defaultIfEmpty(
    src: string,
    ...alt: Array<MarkdownInlineBlockContent>
  ): this {
    if (!this.isEmpty) return this;
    this.$src = src;
    this.$content = alt;
    return this;
  }

  public default(src: string, ...alt: Array<MarkdownInlineBlockContent>): this {
    return this.defaultIfEmpty(src, ...alt);
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    return `![${content}](${this.$src})`;
  }
}

export const image = (
  src: string,
  ...alt: Array<MarkdownInlineBlockContent>
): MarkdownImageBlock => {
  return new MarkdownImageBlock(src, ...alt);
};
export const img = image;

export class MarkdownHorizontalRuleBlock extends MarkdownLineBlock {
  public $style: MarkdownHorizontalRuleStyle | undefined;
  public $count: number = 3;
  private readonly _defaultStyle: MarkdownHorizontalRuleStyle = "-";

  public style(opt: MarkdownHorizontalRuleStyle): this {
    this.$style = opt;
    return this;
  }

  public count(opt: number): this {
    if (opt < 3) return this;
    this.$count = opt;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const style =
      options?.enforceStyles?.horizontalRule ??
      this.$style ??
      this._defaultStyle;
    return `\n${style.repeat(this.$count)}\n`;
  }
}

export const horizontalRule = (): MarkdownHorizontalRuleBlock => {
  return new MarkdownHorizontalRuleBlock();
};
export const hr = horizontalRule;

export class MarkdownBlockquoteBlock extends MarkdownMultilineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    return this.$lines
      .filter((line) => this.shouldFilter(line, options))
      .flatMap((line) => {
        const content =
          line instanceof MarkdownBlock ? line.render(options) : line;
        if (content === null) return [];
        const lineIsBlockquote = line instanceof MarkdownBlockquoteBlock;
        const prefix = `>${lineIsBlockquote ? this._EMPTY_STRING : this._SPACE_STRING}`;
        return String(content)
          .split("\n")
          .map((l) => `${prefix}${l}`);
      })
      .filter((line) => line !== null)
      .join("\n");
  }
}

export const blockquote = (
  ...lines: Array<MarkdownMultilineBlockContent>
): MarkdownBlockquoteBlock => {
  return new MarkdownBlockquoteBlock(...lines);
};
export const block = blockquote;
export const bq = blockquote;

export class MarkdownFootnoteBlock extends MarkdownInlineBlock {
  public $identifier: string | undefined;
  public $footer = new MarkdownMultilineBlock();

  constructor(...lines: Array<MarkdownMultilineBlockContent>) {
    super();
    this.$footer.$lines.push(...lines);
  }

  private validateIdentifier(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  public identifier(value: string): this {
    if (!this.validateIdentifier(value)) return this;
    if (this.$identifier) return this;
    this.$identifier = value;
    return this;
  }

  public id(value: string): this {
    return this.identifier(value);
  }

  public render(): string | null {
    if (!this.$identifier || this.$footer.isEmpty) return null;
    return `[^${this.$identifier}]`;
  }

  public renderDefinition(options?: OptionalRenderingOptions): string | null {
    const content = this.$footer.render(options);
    if (!this.$identifier || content === null || this.$footer.isEmpty)
      return null;
    return `[^${this.$identifier}]: ${content}`;
  }
}

export const footnote = (
  ...lines: Array<MarkdownMultilineBlockContent>
): MarkdownFootnoteBlock => {
  return new MarkdownFootnoteBlock(...lines);
};
export const foot = footnote;
export const fn = footnote;

export class MarkdownLineBreakBlock extends MarkdownInlineBlock {
  public render(): string | null {
    return "\n";
  }
}

export const lineBreak = (): MarkdownLineBreakBlock => {
  return new MarkdownLineBreakBlock();
};
export const br = lineBreak;

export class MarkdownEmojiBlock extends MarkdownInlineBlock {
  public $emoji: EmojiShortname;

  constructor(emoji: EmojiShortname) {
    super();
    this.$emoji = emoji;
  }

  public render(): string | null {
    return `:${this.$emoji}:`;
  }
}

export const emoji = (emoji: EmojiShortname): MarkdownEmojiBlock => {
  return new MarkdownEmojiBlock(emoji);
};
export const e = emoji;

const list = {
  unordered: unorderedList,
  ul: unorderedList,
  ordered: orderedList,
  ol: orderedList,
  tasks: tasksList,
};

const listItem = {
  unordered: unorderedListItem,
  u: unorderedListItem,
  ordered: orderedListItem,
  o: orderedListItem,
  task: taskItem,
  t: taskItem,
};
export const b = {
  markdown,
  md,
  document,
  doc,
  d,
  section,
  sec,
  s,
  heading,
  head,
  h,
  paragraph,
  para,
  p,
  blockquote,
  block,
  bq,
  bold,
  b: bold,
  italic,
  i,
  strikethrough,
  strike,
  st,
  highlight,
  high,
  hl,
  subscript,
  sub,
  superscript,
  sup,
  link,
  url,
  image,
  img,
  emoji,
  e,
  list,
  ls: list,
  listItem,
  li: listItem,
  codeblock,
  code,
  horizontalRule,
  hr,
  footnote,
  foot,
  fn,
  lineBreak,
  br,
  renderingOptions,
} as const;

export default b;

/**
 * 
 * 
 *Standard
Headings X
Paragraphs X
Line Breaks X
Emphasis X
Blockquotes X
Lists X
Code X
Horizontal Rules X
Links X
Images X

Extended
Tables
Fenced Code Blocks X
Footnotes X
Heading IDs X
Definition Lists
Strikethrough X
Task Lists X
Emoji X
Highlight X
Subscript X
Superscript X

 *
 */
