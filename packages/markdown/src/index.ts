import { type EmojiShortname } from "./emojis";

export interface StringReadable {
  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string;
  toString(): string;
}

export type PrimitiveValues = string | number | boolean | null | undefined;

export interface RenderingOptions {
  renderNullish: boolean;
  lineJoinString: string;
}

export type OptionalRenderingOptions = Partial<RenderingOptions>;

export type BooleanCoercibleValue =
  | boolean
  | null
  | undefined
  | string
  | number;

export abstract class MarkdownBlock implements StringReadable {
  protected readonly _EMPTY_STRING = "";
  protected readonly _SPACE_STRING = " ";

  protected $renderingOptions: RenderingOptions | undefined;
  protected readonly _defaultRenderingOptions: RenderingOptions = {
    renderNullish: false,
    lineJoinString: this._EMPTY_STRING,
  };

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

  abstract isEmpty: boolean;
  abstract render(options?: OptionalRenderingOptions): string | null;

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

  abstract [Symbol.toPrimitive](hint: "default" | "string" | "number"): string;
}

export type MarkdownInlineBlockContent = PrimitiveValues | MarkdownInlineBlock;

export class MarkdownInlineBlock extends MarkdownBlock {
  public $content: Array<MarkdownInlineBlockContent> = [];

  constructor(...content: Array<MarkdownInlineBlockContent>) {
    super();
    this.$content.push(...content);
  }

  if(condition: BooleanCoercibleValue): this {
    if (Boolean(condition)) return this;
    this.$content = [];
    return this;
  }

  default(...content: Array<MarkdownInlineBlockContent>): this {
    if (!this.isEmpty) return this;
    this.$content = content;
    return this;
  }

  get isEmpty(): boolean {
    return (
      this.$content.length === 0 ||
      this.$content.every((block) =>
        block instanceof MarkdownBlock
          ? block.isEmpty
          : this.isPrimitiveEmpty(block),
      )
    );
  }

  bold() {
    return new MarkdownBoldBlock(this);
  }
  b() {
    return this.bold();
  }

  italic() {
    return new MarkdownItalicBlock(this);
  }
  i() {
    return this.italic();
  }

  strikethrough() {
    return new MarkdownStrikethroughBlock(this);
  }
  st() {
    return this.strikethrough();
  }

  highlight() {
    return new MarkdownHighlightBlock(this);
  }
  hl() {
    return this.highlight();
  }

  subscript() {
    return new MarkdownSubscriptBlock();
  }
  sub() {
    return this.subscript();
  }

  superscript() {
    return new MarkdownSuperscriptBlock(this);
  }
  sup() {
    return this.superscript();
  }

  link(url: string) {
    return new MarkdownLinkBlock(url, this);
  }
  url(url: string) {
    return this.link(url);
  }

  image(src: string) {
    return new MarkdownImageBlock(src, this);
  }
  img(src: string) {
    return this.image(src);
  }

  render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const { lineJoinString } = this.getRenderingOptions(options);
    return this.$content
      .filter((line) => this.shouldFilter(line, options))
      .map((block) =>
        block instanceof MarkdownBlock ? block.render(options) : String(block),
      )
      .join(lineJoinString);
  }

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
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

  if(condition: BooleanCoercibleValue): this {
    if (Boolean(condition)) return this;
    this.$line = [];
    return this;
  }

  default(...line: Array<MarkdownLineBlockContent>): this {
    if (!this.isEmpty) return this;
    this.$line = line;
    return this;
  }

  get isEmpty(): boolean {
    return (
      this.$line.length === 0 ||
      this.$line.every((block) =>
        block instanceof MarkdownBlock
          ? block.isEmpty
          : this.isPrimitiveEmpty(block),
      )
    );
  }

  render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const { lineJoinString } = this.getRenderingOptions(options);
    return this.$line
      .filter((line) => this.shouldFilter(line, options))
      .map((line) =>
        line instanceof MarkdownBlock ? line.render(options) : line,
      )
      .join(lineJoinString);
  }

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
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

  if(condition: BooleanCoercibleValue): this {
    if (Boolean(condition)) return this;
    this.$lines = [];
    return this;
  }

  default(...lines: Array<MarkdownLineBlockContent>): this {
    if (!this.isEmpty) return this;
    this.$lines = lines;
    return this;
  }

  set depth(value: number) {
    this.$depth = value;
  }

  get depth(): number {
    return this.$depth;
  }

  get isEmpty(): boolean {
    return (
      this.$lines.length === 0 ||
      this.$lines.every((line) =>
        line instanceof MarkdownBlock
          ? line.isEmpty
          : this.isPrimitiveEmpty(line),
      )
    );
  }

  render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    return this.$lines
      .filter((line) => this.shouldFilter(line, options))
      .map((line) => {
        if (this.isPrimitive(line)) return line;
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
        return line.render(options);
      })
      .join("\n");
  }

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
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

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "number") return this.$lines.length.toString();

    const footnotes = this.collectFootnotes();
    let counter = 1;
    for (const fn of footnotes) {
      if (!fn.$identifier && !fn.$footer.isEmpty) {
        fn.$identifier = String(counter++);
      }
    }

    const body = this.render(this.getRenderingOptions()) ?? "";

    if (footnotes.length === 0) return body;

    const definitions = footnotes
      .map((fn) => fn.renderDefinition())
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

export type MarkdownDocumentContent = MarkdownMultilineBlockContent;
export class MarkdownDocument extends MarkdownSectionBlock {}

export const document = (...lines: Array<MarkdownDocumentContent>) => {
  return new MarkdownDocument(...lines);
};

export class MarkdownParagraphBlock extends MarkdownInlineBlock {}

export const paragraph = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownParagraphBlock => {
  return new MarkdownParagraphBlock(...line);
};

export class MarkdownLiteral extends MarkdownInlineBlock {}

export function md(
  strings: TemplateStringsArray,
  ...exprs: Array<MarkdownLineBlockContent>
): MarkdownLiteral {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < exprs.length) result += String(exprs[i]);
  }
  return new MarkdownLiteral(result);
}

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export class MarkdownHeadingBlock extends MarkdownLineBlock {
  public $level: MarkdownHeadingLevel | undefined;
  private _defaultLevel: MarkdownHeadingLevel = 1;

  public $id: string | undefined;

  id(value: string): this {
    if (this.$id) return this;
    this.$id = value;
    return this;
  }

  level(opt: MarkdownHeadingLevel): this {
    if (this.$level) return this;
    this.$level = opt;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
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

export type MarkdownBoldStyle = "**" | "__";
export class MarkdownBoldBlock extends MarkdownInlineBlock {
  public $style: MarkdownBoldStyle | undefined;
  private _defaultStyle: MarkdownBoldStyle = "**";

  style(opt: MarkdownBoldStyle): this {
    this.$style = opt;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `${this.$style ?? this._defaultStyle}${content}${this.$style ?? this._defaultStyle}`;
  }
}

export const bold = (
  ...content: Array<MarkdownInlineBlockContent>
): MarkdownBoldBlock => {
  return new MarkdownBoldBlock(...content);
};

export type MarkdownItalicStyle = "*" | "_";
export class MarkdownItalicBlock extends MarkdownInlineBlock {
  public $style: MarkdownItalicStyle | undefined;
  private _defaultStyle: MarkdownItalicStyle = "*";

  style(opt: MarkdownItalicStyle): this {
    this.$style = opt;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `${this.$style ?? this._defaultStyle}${content}${this.$style ?? this._defaultStyle}`;
  }
}

export const italic = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownItalicBlock => {
  return new MarkdownItalicBlock(...content);
};

export class MarkdownStrikethroughBlock extends MarkdownInlineBlock {
  render(options?: OptionalRenderingOptions): string | null {
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

export class MarkdownHighlightBlock extends MarkdownInlineBlock {
  render(options?: OptionalRenderingOptions): string | null {
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

export class MarkdownSubscriptBlock extends MarkdownInlineBlock {
  render(options?: OptionalRenderingOptions): string | null {
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

export class MarkdownSuperscriptBlock extends MarkdownInlineBlock {
  render(options?: OptionalRenderingOptions): string | null {
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

export class MarkdownLinkBlock extends MarkdownInlineBlock {
  public $url: string;

  constructor(url: string, ...label: Array<MarkdownInlineBlockContent>) {
    super(...label);
    this.$url = url;
  }

  otherwise(
    condition: BooleanCoercibleValue,
    url: string,
    ...label: Array<MarkdownInlineBlockContent>
  ): this {
    if (!Boolean(condition)) return this;
    this.$url = url;
    this.$content = label;
    return this;
  }

  render(options?: OptionalRenderingOptions): string {
    const content = super.render(options);
    if (content === null) return `<${this.$url}>`;
    return `[${content}](${this.$url})`;
  }
}

export const link = (
  url: string,
  ...label: Array<string | MarkdownInlineBlock>
) => {
  return new MarkdownLinkBlock(url, ...label);
};

export class MarkdownListBlock extends MarkdownMultilineBlock {
  public $indent: number = 2;

  indent(value: number): this {
    this.$indent = value;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    return this.$lines
      .map((line) => {
        if (line instanceof MarkdownListBlock) {
          line.$indent = this.$indent;
          const rendered = line.render(options);
          if (rendered === null) return null;
          return rendered
            .split("\n")
            .map((l) => this._SPACE_STRING.repeat(this.$indent) + l)
            .join("\n");
        }
        if (this.isPrimitive(line)) return line;
        return line.render(options);
      })
      .filter((line) => line !== null)
      .join("\n");
  }
}

export type MarkdownUnorderedListItemStyle = "*" | "-" | "+";

export class MarkdownUnorderedListItemBlock extends MarkdownLineBlock {
  $style: MarkdownUnorderedListItemStyle | undefined;
  private _defaultStyle: MarkdownUnorderedListItemStyle = "-";

  style(opt: MarkdownUnorderedListItemStyle): this {
    this.$style = opt;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    return `${this.$style ?? this._defaultStyle} ${content}`;
  }
}

export const unorderedListItem = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownUnorderedListItemBlock => {
  return new MarkdownUnorderedListItemBlock(...line);
};

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

  style(opt: MarkdownUnorderedListItemStyle): this {
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

export class MarkdownOrderedListItemBlock extends MarkdownLineBlock {
  public $index: number;

  constructor(index: number, ...line: Array<MarkdownLineBlockContent>) {
    super(...line);
    this.$index = index;
  }

  index(value: number): this {
    this.$index = value;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
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

export class MarkdownOrderedListBlock extends MarkdownListBlock {
  startingIndex(value: number): this {
    let itemIndex = 0;
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownOrderedListItemBlock) {
        line.index(itemIndex + value);
        itemIndex++;
      }
    });
    return this;
  }

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
}

export const orderedList = (
  ...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>
): MarkdownOrderedListBlock => {
  return new MarkdownOrderedListBlock(...lines);
};

type MarkdownTaskItemBlockStyle = "x" | "X";
export class MarkdownTaskItemBlock extends MarkdownLineBlock {
  public $checked: boolean = false;
  public $style: MarkdownTaskItemBlockStyle | undefined;
  private _defaultStyle: MarkdownTaskItemBlockStyle = "x";

  constructor(checked: boolean, ...line: Array<MarkdownLineBlockContent>) {
    super(...line);
    this.$checked = checked;
  }

  style(opt: MarkdownTaskItemBlockStyle): this {
    this.$style = opt;
    return this;
  }

  checked(value: boolean): this {
    this.$checked = value;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    return `- [${this.$checked ? (this.$style ?? this._defaultStyle) : this._SPACE_STRING}] ${content}`;
  }
}

export const taskItem = (
  checked: boolean,
  ...line: Array<MarkdownLineBlockContent>
): MarkdownTaskItemBlock => {
  return new MarkdownTaskItemBlock(checked, ...line);
};

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

  style(opt: MarkdownTaskItemBlockStyle): this {
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownTaskItemBlock) {
        line.style(opt);
      }
    });
    return this;
  }
}

export const tasks = (
  ...lines: Array<[boolean, ...MarkdownLineBlockContent[]] | MarkdownListBlock>
): MarkdownTaskListBlock => {
  return new MarkdownTaskListBlock(...lines);
};

export type MarkdownCodeBlockLanguage = string;
export class MarkdownCodeBlock extends MarkdownMultilineBlock {
  public $language: MarkdownCodeBlockLanguage | undefined;

  language(opt: MarkdownCodeBlockLanguage): this {
    this.$language = opt;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    const containsNewlines = content.includes("\n");
    if (!this.$language && this.$lines.length === 1 && !containsNewlines) {
      return `\`${content}\``;
    }
    return `\`\`\`${this.$language ?? this._EMPTY_STRING}\n${content}\n\`\`\``;
  }
}

export const codeblock = (
  ...lines: Array<MarkdownLineBlockContent>
): MarkdownCodeBlock => {
  return new MarkdownCodeBlock(...lines);
};

export class MarkdownImageBlock extends MarkdownInlineBlock {
  public $src: string;

  constructor(src: string, ...alt: Array<MarkdownInlineBlockContent>) {
    super(...alt);
    this.$src = src;
  }

  otherwise(
    condition: BooleanCoercibleValue,
    src: string,
    ...alt: Array<MarkdownInlineBlockContent>
  ): this {
    if (!Boolean(condition)) return this;
    this.$src = src;
    this.$content = alt;
    return this;
  }

  render(options?: OptionalRenderingOptions): string | null {
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

export type MarkdownHorizontalRuleStyle = "-" | "*" | "_";
export class MarkdownHorizontalRuleBlock extends MarkdownLineBlock {
  public $style: MarkdownHorizontalRuleStyle | undefined;
  private _defaultStyle: MarkdownHorizontalRuleStyle = "-";

  constructor() {
    super();
  }

  private $count: number = 3;

  style(opt: MarkdownHorizontalRuleStyle): this {
    this.$style = opt;
    return this;
  }

  count(opt: number): this {
    if (opt < 3) return this;
    this.$count = opt;
    return this;
  }

  render(): string | null {
    return `\n${(this.$style ?? this._defaultStyle).repeat(this.$count)}\n`;
  }
}

export const horizontalRule = (): MarkdownHorizontalRuleBlock => {
  return new MarkdownHorizontalRuleBlock();
};

export class MarkdownBlockquoteBlock extends MarkdownMultilineBlock {
  render(options?: OptionalRenderingOptions): string | null {
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

  identifier(value: string): this {
    if (!this.validateIdentifier(value)) return this;
    if (this.$identifier) return this;
    this.$identifier = value;
    return this;
  }

  id(value: string): this {
    return this.identifier(value);
  }

  render(): string | null {
    if (!this.$identifier || this.$footer.isEmpty) return null;
    return `[^${this.$identifier}]`;
  }

  renderDefinition(options?: OptionalRenderingOptions): string | null {
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

export class MarkdownLineBreakBlock extends MarkdownInlineBlock {
  render(): string | null {
    return "\n";
  }
}

export const lineBreak = (): MarkdownLineBreakBlock => {
  return new MarkdownLineBreakBlock();
};

export class MarkdownEmojiBlock extends MarkdownInlineBlock {
  public $emoji: EmojiShortname;

  constructor(emoji: EmojiShortname) {
    super();
    this.$emoji = emoji;
  }

  render(): string | null {
    return `:${this.$emoji}:`;
  }
}

export const emoji = (emoji: EmojiShortname): MarkdownEmojiBlock => {
  return new MarkdownEmojiBlock(emoji);
};

const list = {
  unordered: unorderedList,
  ul: unorderedList,
  ordered: orderedList,
  ol: orderedList,
  tasks,
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
  md,
  document,
  doc: document,
  d: document,
  section,
  sec: section,
  s: section,
  heading,
  head: heading,
  h: heading,
  paragraph,
  para: paragraph,
  p: paragraph,
  blockquote,
  block: blockquote,
  bq: blockquote,
  bold,
  b: bold,
  italic,
  i: italic,
  strikethrough,
  strike: strikethrough,
  highlight,
  hl: highlight,
  subscript,
  sub: subscript,
  superscript,
  sup: superscript,
  link,
  url: link,
  image,
  img: image,
  emoji,
  e: emoji,
  list,
  ls: list,
  listItem,
  li: listItem,
  codeblock,
  code: codeblock,
  horizontalRule,
  hr: horizontalRule,
  footnote,
  foot: footnote,
  fn: footnote,
  lineBreak,
  br: lineBreak,
};

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
