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

  public abstract isEmpty: boolean;
  public abstract render(options?: OptionalRenderingOptions): string | null;
  public toString(): string {
    return this.render(this.getRenderingOptions()) ?? this._EMPTY_STRING;
  }

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

    return this.$trim ? this.dedent(content) : content;
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
    return this.$trim ? this.dedent(content) : content;
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
          line.level(safeLevel, { allowReassignment: true });
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

    return this.$trim ? this.dedent(content) : content;
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
export type MarkdownHeadingLevelOptions = {
  allowReassignment?: boolean;
};

export class MarkdownHeadingBlock extends MarkdownLineBlock {
  public $level: MarkdownHeadingLevel | undefined;
  public $id: string | undefined;
  private readonly _defaultLevel: MarkdownHeadingLevel = 1;
  private readonly _defaultLevelOptions: MarkdownHeadingLevelOptions = {
    allowReassignment: false,
  };

  public identifier(value: string): this {
    if (this.$id) return this;
    this.$id = value;
    return this;
  }

  public id(value: string): this {
    return this.identifier(value);
  }

  public level(
    opt: MarkdownHeadingLevel,
    options?: MarkdownHeadingLevelOptions,
  ): this {
    const canReassign =
      options?.allowReassignment ?? this._defaultLevelOptions.allowReassignment;
    if (this.$level && !canReassign) return this;
    this.$level = opt;
    return this;
  }

  public l(
    opt: MarkdownHeadingLevel,
    options?: MarkdownHeadingLevelOptions,
  ): this {
    return this.level(opt, options);
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

export class MarkdownBlockquoteBlock extends MarkdownMultilineBlock<{
  excludeMultiline: false;
}> {
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
  ...lines: Array<MarkdownMultilineBlockContent<{ excludeMultiline: false }>>
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

// ── Parse helpers ──────────────────────────────────────────────────

function findSingleClose(text: string, start: number, char: string): number {
  for (let j = start; j < text.length; j++) {
    if (text[j] === char) {
      if (j + 1 < text.length && text[j + 1] === char) {
        j++;
        continue;
      }
      if (j > 0 && text[j - 1] === char) {
        continue;
      }
      return j;
    }
  }
  return -1;
}

function parseInline(text: string): MarkdownInlineBlockContent[] {
  const result: MarkdownInlineBlockContent[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer) {
      result.push(buffer);
      buffer = "";
    }
  };

  while (i < text.length) {
    // 1. Code span
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        result.push(new MarkdownCodeBlock(text.slice(i + 1, end)));
        i = end + 1;
        continue;
      }
    }

    // 2. Image: ![alt](src)
    if (text[i] === "!" && text[i + 1] === "[") {
      const closeBracket = text.indexOf("]", i + 2);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          flush();
          const alt = text.slice(i + 2, closeBracket);
          const src = text.slice(closeBracket + 2, closeParen);
          result.push(new MarkdownImageBlock(src, ...parseInline(alt)));
          i = closeParen + 1;
          continue;
        }
      }
    }

    // 3. Footnote ref: [^id]
    if (text[i] === "[" && text[i + 1] === "^") {
      const closeBracket = text.indexOf("]", i + 2);
      if (closeBracket !== -1) {
        flush();
        const id = text.slice(i + 2, closeBracket);
        const fn = new MarkdownFootnoteBlock();
        fn.$identifier = id;
        result.push(fn);
        i = closeBracket + 1;
        continue;
      }
    }

    // 4. Link: [text](url)
    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          flush();
          const linkText = text.slice(i + 1, closeBracket);
          const url = text.slice(closeBracket + 2, closeParen);
          result.push(new MarkdownLinkBlock(url, ...parseInline(linkText)));
          i = closeParen + 1;
          continue;
        }
      }
    }

    // 5. Auto link: <url>
    if (text[i] === "<") {
      const closeAngle = text.indexOf(">", i + 1);
      if (closeAngle !== -1) {
        const url = text.slice(i + 1, closeAngle);
        if (url.includes("://") || url.includes("@")) {
          flush();
          result.push(new MarkdownLinkBlock(url));
          i = closeAngle + 1;
          continue;
        }
      }
    }

    // 6. Bold: **text**
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        result.push(
          new MarkdownBoldBlock(...parseInline(text.slice(i + 2, end))),
        );
        i = end + 2;
        continue;
      }
    }

    // 7. Bold underscore: __text__
    if (text[i] === "_" && text[i + 1] === "_") {
      const end = text.indexOf("__", i + 2);
      if (end !== -1) {
        flush();
        const block = new MarkdownBoldBlock(
          ...parseInline(text.slice(i + 2, end)),
        );
        block.style("__");
        result.push(block);
        i = end + 2;
        continue;
      }
    }

    // 8. Strikethrough: ~~text~~
    if (text[i] === "~" && text[i + 1] === "~") {
      const end = text.indexOf("~~", i + 2);
      if (end !== -1) {
        flush();
        result.push(
          new MarkdownStrikethroughBlock(
            ...parseInline(text.slice(i + 2, end)),
          ),
        );
        i = end + 2;
        continue;
      }
    }

    // 9. Highlight: ==text==
    if (text[i] === "=" && text[i + 1] === "=") {
      const end = text.indexOf("==", i + 2);
      if (end !== -1) {
        flush();
        result.push(
          new MarkdownHighlightBlock(...parseInline(text.slice(i + 2, end))),
        );
        i = end + 2;
        continue;
      }
    }

    // 10. Italic: *text*
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = findSingleClose(text, i + 1, "*");
      if (end !== -1) {
        flush();
        result.push(
          new MarkdownItalicBlock(...parseInline(text.slice(i + 1, end))),
        );
        i = end + 1;
        continue;
      }
    }

    // 11. Italic underscore: _text_
    if (text[i] === "_" && text[i + 1] !== "_") {
      const end = findSingleClose(text, i + 1, "_");
      if (end !== -1) {
        flush();
        const block = new MarkdownItalicBlock(
          ...parseInline(text.slice(i + 1, end)),
        );
        block.style("_");
        result.push(block);
        i = end + 1;
        continue;
      }
    }

    // 12. Subscript: ~text~
    if (text[i] === "~" && text[i + 1] !== "~") {
      const end = findSingleClose(text, i + 1, "~");
      if (end !== -1) {
        flush();
        result.push(
          new MarkdownSubscriptBlock(...parseInline(text.slice(i + 1, end))),
        );
        i = end + 1;
        continue;
      }
    }

    // 13. Superscript: ^text^
    if (text[i] === "^") {
      const end = text.indexOf("^", i + 1);
      if (end !== -1) {
        flush();
        result.push(
          new MarkdownSuperscriptBlock(...parseInline(text.slice(i + 1, end))),
        );
        i = end + 1;
        continue;
      }
    }

    // 14. Emoji: :name:
    if (text[i] === ":") {
      const end = text.indexOf(":", i + 1);
      if (end !== -1) {
        const name = text.slice(i + 1, end);
        if (/^[a-z0-9_+-]+$/.test(name)) {
          flush();
          result.push(new MarkdownEmojiBlock(name as EmojiShortname));
          i = end + 1;
          continue;
        }
      }
    }

    buffer += text[i];
    i++;
  }

  flush();
  return result;
}

function inlineToBlockContent(
  parsed: MarkdownInlineBlockContent[],
): MarkdownMultilineBlockContent {
  if (parsed.length === 0) return "";
  if (parsed.length === 1) {
    const item = parsed[0];
    if (typeof item === "string") return item;
    if (item instanceof MarkdownInlineBlock) return item;
    return String(item ?? "");
  }
  return new MarkdownInlineBlock(...parsed);
}

function parseBlockquoteLines(lines: string[]): MarkdownBlockquoteBlock {
  const stripped = lines.map((line) => {
    const match = line.match(/^>(?: )?(.*)$/);
    return match ? match[1] : line;
  });
  const content = parseBlocks(stripped);
  return new MarkdownBlockquoteBlock(...content);
}

function parseListGroup(
  lines: string[],
  startIndex: number,
): [MarkdownListBlock, number] {
  const items: MarkdownMultilineBlockContent[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trimStart();

    if (indent > 0 && trimmed.length > 0) {
      const nestedIndent = indent;
      const nestedLines: string[] = [];
      while (i < lines.length) {
        const nl = lines[i];
        const ni = nl.length - nl.trimStart().length;
        if (ni >= nestedIndent && nl.trimStart().length > 0) {
          nestedLines.push(nl.slice(nestedIndent));
          i++;
        } else {
          break;
        }
      }
      const [nestedList] = parseListGroup(nestedLines, 0);
      items.push(nestedList);
      continue;
    }

    // Task item: - [x] text or - [ ] text
    const taskMatch = trimmed.match(/^- \[([ xX])\] (.+)$/);
    if (taskMatch) {
      const checked = taskMatch[1] !== " ";
      const parsed = parseInline(taskMatch[2]);
      const item = new MarkdownTaskItemBlock(
        checked,
        ...(parsed as MarkdownLineBlockContent[]),
      );
      if (taskMatch[1] === "X") item.style("X");
      items.push(item);
      i++;
      continue;
    }

    // Unordered list item: * text or - text or + text
    const ulMatch = trimmed.match(/^([*+-]) (.+)$/);
    if (ulMatch) {
      const style = ulMatch[1] as MarkdownUnorderedListItemStyle;
      const parsed = parseInline(ulMatch[2]);
      const item = new MarkdownUnorderedListItemBlock(
        ...(parsed as MarkdownLineBlockContent[]),
      );
      item.style(style);
      items.push(item);
      i++;
      continue;
    }

    // Ordered list item: 1. text
    const olMatch = trimmed.match(/^(\d+)\. (.+)$/);
    if (olMatch) {
      const idx = parseInt(olMatch[1]);
      const parsed = parseInline(olMatch[2]);
      const item = new MarkdownOrderedListItemBlock(
        idx,
        ...(parsed as MarkdownLineBlockContent[]),
      );
      items.push(item);
      i++;
      continue;
    }

    break;
  }

  return [new MarkdownListBlock(...items), i];
}

function parseBlocks(
  lines: string[],
  headingLevelMap?: WeakMap<MarkdownHeadingBlock, number>,
): MarkdownMultilineBlockContent[] {
  const result: MarkdownMultilineBlockContent[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code fence
    const codeFenceMatch = line.match(/^```(\w*)$/);
    if (codeFenceMatch) {
      const language = codeFenceMatch[1] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const codeBlock = new MarkdownCodeBlock(codeLines.join("\n"));
      if (language) codeBlock.language(language);
      result.push(codeBlock);
      continue;
    }

    // 2. Heading
    const headingMatch = line.match(/^(#{1,6}) (.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as MarkdownHeadingLevel;
      const content = headingMatch[2];
      const idMatch = content.match(/^(.+?) \{#(.+)\}$/);
      const headingContent = idMatch ? idMatch[1] : content;
      const headingId = idMatch ? idMatch[2] : undefined;
      const parsed = parseInline(headingContent);
      const h = new MarkdownHeadingBlock(
        ...(parsed as MarkdownLineBlockContent[]),
      );
      if (headingLevelMap) {
        headingLevelMap.set(h, level);
      } else {
        h.$level = level;
      }
      if (headingId) h.identifier(headingId);
      result.push(h);
      i++;
      continue;
    }

    // 3. Blockquote
    if (line.match(/^>/)) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].match(/^>/)) {
        bqLines.push(lines[i]);
        i++;
      }
      result.push(parseBlockquoteLines(bqLines));
      continue;
    }

    // 4. Horizontal rule
    const hrMatch = line.match(/^([-*_])\1{2,}$/);
    if (hrMatch) {
      const style = hrMatch[1] as MarkdownHorizontalRuleStyle;
      const count = line.length;
      // Pop preceding empty line (owned by HR render)
      if (result.length > 0 && result[result.length - 1] === "") {
        result.pop();
      }
      // Skip following empty line (owned by HR render)
      if (i + 1 < lines.length && lines[i + 1] === "") {
        i++;
      }
      const hrBlock = new MarkdownHorizontalRuleBlock();
      hrBlock.style(style);
      hrBlock.count(count);
      result.push(hrBlock);
      i++;
      continue;
    }

    // 5-7. List items (task, unordered, ordered)
    const isListItem =
      line.match(/^(\s*)- \[([ xX])\] (.+)$/) ||
      line.match(/^(\s*)([*+-]) (.+)$/) ||
      line.match(/^(\s*)(\d+)\. (.+)$/);
    if (isListItem) {
      const [listBlock, nextI] = parseListGroup(lines, i);
      result.push(listBlock);
      i = nextI;
      continue;
    }

    // 8. Footnote definition: [^id]: content
    const fnDefMatch = line.match(/^\[\^(.+?)\]: (.+)$/);
    if (fnDefMatch) {
      // Skip footnote definitions - they'll be handled by parse()
      i++;
      // Also skip continuation lines
      while (
        i < lines.length &&
        lines[i] !== "" &&
        !lines[i].match(/^\[\^.+?\]: /)
      ) {
        i++;
      }
      continue;
    }

    // 9. Everything else
    if (line === "" || !line.match(/[*_~=^`\[!<:]/)) {
      result.push(line);
    } else {
      result.push(inlineToBlockContent(parseInline(line)));
    }
    i++;
  }

  return result;
}

function collectFootnoteBlocks(
  items: MarkdownMultilineBlockContent[],
): MarkdownFootnoteBlock[] {
  const result: MarkdownFootnoteBlock[] = [];
  const walk = (item: unknown) => {
    if (item instanceof MarkdownFootnoteBlock) {
      result.push(item);
    }
    if (item instanceof MarkdownMultilineBlock) {
      item.$lines.forEach(walk);
    } else if (item instanceof MarkdownLineBlock) {
      item.$line.forEach(walk);
    } else if (item instanceof MarkdownInlineBlock) {
      item.$content.forEach(walk);
    }
  };
  items.forEach(walk);
  return result;
}

function parseFootnoteDefinitions(
  lines: string[],
): Map<string, MarkdownMultilineBlockContent[]> {
  const defs = new Map<string, MarkdownMultilineBlockContent[]>();
  let currentId: string | null = null;
  let currentContent: MarkdownMultilineBlockContent[] = [];

  for (const line of lines) {
    const defMatch = line.match(/^\[\^(.+?)\]: (.+)$/);
    if (defMatch) {
      if (currentId) {
        defs.set(currentId, currentContent);
      }
      currentId = defMatch[1];
      currentContent = [defMatch[2]];
    } else if (currentId) {
      currentContent.push(line);
    }
  }

  if (currentId) {
    defs.set(currentId, currentContent);
  }

  return defs;
}

function nestSections(
  blocks: MarkdownMultilineBlockContent[],
  headingLevels: WeakMap<MarkdownHeadingBlock, number>,
): MarkdownMultilineBlockContent[] {
  const result: MarkdownMultilineBlockContent[] = [];
  const stack: { level: number; items: MarkdownMultilineBlockContent[] }[] = [
    { level: 0, items: result },
  ];

  for (const block of blocks) {
    if (block instanceof MarkdownHeadingBlock) {
      const level = headingLevels.get(block) ?? 1;

      // Pop until we're at a level below this heading
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      // Create sections to reach the needed depth
      // Heading at level N needs to be at depth N-1
      while (stack.length < level) {
        const sec = new MarkdownSectionBlock();
        stack[stack.length - 1].items.push(sec);
        stack.push({ level: stack.length, items: sec.$lines });
      }

      // Push heading at current depth
      stack[stack.length - 1].items.push(block);
    } else {
      // Non-heading content goes to current level
      stack[stack.length - 1].items.push(block);
    }
  }

  return result;
}

export function parse(input: string): MarkdownDocument {
  const allLines = input.split("\n");

  // Pre-pass: extract footnote definitions from anywhere in the document.
  // Definitions may appear interleaved with body text, not just at the end.
  const bodyLines: string[] = [];
  const footnoteDefs = new Map<string, MarkdownMultilineBlockContent[]>();

  let i = 0;
  while (i < allLines.length) {
    const defMatch = allLines[i].match(/^\[\^(.+?)\]: (.+)$/);
    if (defMatch) {
      // Pop the preceding empty line (separator between body and definition)
      if (bodyLines.length > 0 && bodyLines[bodyLines.length - 1] === "") {
        bodyLines.pop();
      }
      const id = defMatch[1];
      const content: MarkdownMultilineBlockContent[] = [defMatch[2]];
      i++;
      // Collect continuation lines
      while (
        i < allLines.length &&
        allLines[i] !== "" &&
        !allLines[i].match(/^\[\^.+?\]: /)
      ) {
        content.push(allLines[i]);
        i++;
      }
      footnoteDefs.set(id, content);
    } else {
      bodyLines.push(allLines[i]);
      i++;
    }
  }

  const headingLevelMap = new WeakMap<MarkdownHeadingBlock, number>();
  const flatBlocks = parseBlocks(bodyLines, headingLevelMap);
  const blocks = nestSections(flatBlocks, headingLevelMap);
  const doc = new MarkdownDocument(...blocks);

  // Wire footnote definitions
  if (footnoteDefs.size > 0) {
    const fnBlocks = collectFootnoteBlocks(blocks);
    for (const fn of fnBlocks) {
      if (fn.$identifier && footnoteDefs.has(fn.$identifier)) {
        const originalId = fn.$identifier;
        fn.$footer.$lines.push(...footnoteDefs.get(originalId)!);
        // Clear numeric identifiers so auto-numbering handles them.
        // This allows parsed documents to be embedded in host documents
        // without footnote numbering collisions.
        if (/^\d+$/.test(originalId)) {
          fn.$identifier = undefined;
        }
      }
    }
  }

  return doc;
}

function blockMeta(node: MarkdownBlock): string {
  const tags: string[] = [];
  if (node instanceof MarkdownHeadingBlock && node.$level)
    tags.push(`level=${node.$level}`);
  if (node instanceof MarkdownBoldBlock && node.$style)
    tags.push(`style=${node.$style}`);
  if (node instanceof MarkdownItalicBlock && node.$style)
    tags.push(`style=${node.$style}`);
  if (node instanceof MarkdownUnorderedListItemBlock && node.$style)
    tags.push(`style=${node.$style}`);
  if (node instanceof MarkdownHorizontalRuleBlock) {
    if (node.$style) tags.push(`style=${node.$style}`);
    tags.push(`count=${node.$count}`);
  }
  if (node instanceof MarkdownTaskItemBlock) {
    tags.push(node.$checked ? "checked" : "unchecked");
    if (node.$style) tags.push(`style=${node.$style}`);
  }
  if (node instanceof MarkdownOrderedListItemBlock)
    tags.push(`index=${node.$index}`);
  if (node instanceof MarkdownCodeBlock && node.$language)
    tags.push(`lang=${node.$language}`);
  if (node instanceof MarkdownLinkBlock) tags.push(`url=${node.$url}`);
  if (node instanceof MarkdownImageBlock) tags.push(`src=${node.$src}`);
  if (node instanceof MarkdownFootnoteBlock && node.$identifier)
    tags.push(`id=${node.$identifier}`);
  if (node instanceof MarkdownEmojiBlock) tags.push(`name=${node.$emoji}`);
  if (node instanceof MarkdownHeadingBlock && node.$id)
    tags.push(`id=${node.$id}`);
  if (node instanceof MarkdownListBlock && node.$indent)
    tags.push(`indent=${node.$indent}`);
  return tags.length > 0 ? ` [${tags.join(", ")}]` : "";
}

function getChildren(
  node: MarkdownBlock,
): Array<PrimitiveValues | MarkdownBlock> {
  if (node instanceof MarkdownMultilineBlock) return node.$lines;
  if (node instanceof MarkdownLineBlock) return node.$line;
  if (node instanceof MarkdownInlineBlock) return node.$content;
  return [];
}

function inspectNode(
  node: PrimitiveValues | MarkdownBlock,
  prefix: string,
  isLast: boolean,
): string[] {
  const connector = isLast ? "└── " : "├── ";
  const childPrefix = prefix + (isLast ? "    " : "│   ");

  if (node === null) return [`${prefix}${connector}null`];
  if (node === undefined) return [`${prefix}${connector}undefined`];
  if (typeof node !== "object") {
    const str = String(node);
    const display =
      typeof node === "string"
        ? `"${str.length > 60 ? str.slice(0, 57) + "..." : str}"`
        : str;
    return [`${prefix}${connector}${display}`];
  }

  const name = node.constructor.name;
  const meta = blockMeta(node);
  const lines: string[] = [`${prefix}${connector}${name}${meta}`];
  const children = getChildren(node);

  for (let i = 0; i < children.length; i++) {
    lines.push(
      ...inspectNode(children[i], childPrefix, i === children.length - 1),
    );
  }

  return lines;
}

export function inspect(block: MarkdownBlock): string {
  const name = block.constructor.name;
  const meta = blockMeta(block);
  const lines: string[] = [`${name}${meta}`];
  const children = getChildren(block);

  for (let i = 0; i < children.length; i++) {
    lines.push(...inspectNode(children[i], "", i === children.length - 1));
  }

  return lines.join("\n");
}

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
  parse,
  inspect,
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
