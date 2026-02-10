export interface StringReadable {
  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string;
  toString(): string;
}

export abstract class MarkdownBlock implements StringReadable {
  readonly _EMPTY_STRING = "";
  readonly _SPACE_STRING = " ";
  abstract isEmpty: boolean;
  abstract render(): string | null;
  abstract [Symbol.toPrimitive](hint: "default" | "string" | "number"): string;
}

export type MarkdownInlineBlockContent = string | MarkdownInlineBlock;
export class MarkdownInlineBlock extends MarkdownBlock {
  public $content: Array<MarkdownInlineBlockContent> = [];

  constructor(...content: Array<MarkdownInlineBlockContent>) {
    super();
    this.$content.push(...content);
  }

  $if(condition: boolean): this {
    if (condition) return this;
    this.$content = [];
    return this;
  }

  $alt(
    condition: boolean,
    ...content: Array<MarkdownInlineBlockContent>
  ): this {
    if (!condition) return this;
    this.$content = content;
    return this;
  }

  get isEmpty(): boolean {
    return (
      this.$content.length === 0 ||
      this.$content.every((block) =>
        block instanceof MarkdownBlock ? block.isEmpty : block.length === 0,
      )
    );
  }

  render(): string | null {
    if (this.isEmpty) return null;
    return this.$content
      .map((block) => (block instanceof MarkdownBlock ? block.render() : block))
      .join(this._EMPTY_STRING);
  }

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return this.render() ?? "";
    if (hint === "number") return this.$content.length.toString();
    return this.render() ?? "";
  }
}

export type MarkdownLineBlockContent = string | MarkdownInlineBlock;
export class MarkdownLineBlock extends MarkdownBlock {
  public $line: Array<MarkdownLineBlockContent> = [];

  constructor(...line: Array<MarkdownLineBlockContent>) {
    super();
    this.$line.push(...line);
  }

  $if(condition: boolean): this {
    if (condition) return this;
    this.$line = [];
    return this;
  }

  $alt(condition: boolean, ...line: Array<MarkdownLineBlockContent>): this {
    if (!condition) return this;
    this.$line = line;
    return this;
  }

  get isEmpty(): boolean {
    return (
      this.$line.length === 0 ||
      this.$line.every((block) =>
        block instanceof MarkdownBlock ? block.isEmpty : block.length === 0,
      )
    );
  }

  render(): string | null {
    if (this.isEmpty) return null;
    return this.$line
      .map((line) => (line instanceof MarkdownBlock ? line.render() : line))
      .join(this._EMPTY_STRING);
  }

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return this.render() ?? "";
    if (hint === "number") return this.$line.length.toString();
    return this.render() ?? "";
  }
}

export type MarkdownMultilineBlockOptions = {
  excludeMultiline: boolean;
};
export type MarkdownMultilineBlockContent<
  OPTS extends MarkdownMultilineBlockOptions = { excludeMultiline: false },
> = OPTS["excludeMultiline"] extends true
  ? string | MarkdownInlineBlock | MarkdownLineBlock
  : string | MarkdownInlineBlock | MarkdownLineBlock | MarkdownMultilineBlock;
export class MarkdownMultilineBlock<
  OPTS extends MarkdownMultilineBlockOptions = { excludeMultiline: false },
> extends MarkdownBlock {
  public $lines: Array<MarkdownMultilineBlockContent<OPTS>> = [];
  private $depth: number = 0;

  constructor(...lines: Array<MarkdownMultilineBlockContent<OPTS>>) {
    super();
    this.$lines.push(...lines);
  }

  $if(condition: boolean): this {
    if (condition) return this;
    this.$lines = [];
    return this;
  }

  $alt(condition: boolean, ...lines: Array<MarkdownLineBlockContent>): this {
    if (!condition) return this;
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
        line instanceof MarkdownBlock ? line.isEmpty : line.length === 0,
      )
    );
  }

  render(): string | null {
    if (this.isEmpty) return null;
    return this.$lines
      .map((line) => {
        if (typeof line === "string") return line;
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
        return line.render();
      })
      .filter((line) => line !== null)
      .join("\n");
  }

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return this.render() ?? "";
    if (hint === "number") return this.$lines.length.toString();
    return this.render() ?? "";
  }
}

export type MarkdownDocumentContent =
  | string
  | MarkdownInlineBlock
  | MarkdownLineBlock
  | MarkdownMultilineBlock;
export class MarkdownDocument implements StringReadable {
  public $lines: Array<MarkdownDocumentContent> = [];

  constructor(...lines: Array<MarkdownDocumentContent>) {
    this.$lines.push(...lines);
  }

  private render(): string {
    return this.$lines
      .map((block) => (block instanceof MarkdownBlock ? block.render() : block))
      .filter((block) => block !== null)
      .join("\n");
  }

  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return this.render();
    if (hint === "number") return this.$lines.length.toString();
    return this.render();
  }
}

export const document = (...lines: Array<MarkdownDocumentContent>) => {
  return new MarkdownDocument(...lines);
};
export const doc = document;
export const d = document;

export class MarkdownSectionBlock extends MarkdownMultilineBlock {}

export const section = (
  ...lines: Array<MarkdownMultilineBlockContent>
): MarkdownSectionBlock => {
  return new MarkdownSectionBlock(...lines);
};
export const sec = section;
export const s = section;

export class MarkdownParagraphBlock extends MarkdownInlineBlock {}

export const paragraph = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownParagraphBlock => {
  return new MarkdownParagraphBlock(...line);
};
export const para = paragraph;
export const p = paragraph;

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export class MarkdownHeadingBlock extends MarkdownLineBlock {
  private $level: MarkdownHeadingLevel | undefined;
  private $defaultLevel: MarkdownHeadingLevel = 1;

  private $id: string | undefined;

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

  render(): string | null {
    const content = super.render();
    if (content === null || this.isEmpty) return null;
    return `${"#".repeat(this.$level ?? this.$defaultLevel)} ${super.render()}${this.$id ? ` {#${this.$id}}` : ""}`;
  }
}

export const heading = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownHeadingBlock => {
  return new MarkdownHeadingBlock(...line);
};
export const head = heading;
export const h = heading;

export type MarkdownBoldStyle = "**" | "__";
export class MarkdownBoldBlock extends MarkdownInlineBlock {
  private $style: MarkdownBoldStyle | undefined;
  private $defaultStyle: MarkdownBoldStyle = "**";

  style(opt: MarkdownBoldStyle): this {
    this.$style = opt;
    return this;
  }

  render(): string | null {
    const content = super.render();
    if (content === null || this.isEmpty) return null;
    return `${this.$style ?? this.$defaultStyle}${content}${this.$style ?? this.$defaultStyle}`;
  }
}

export const bold = (
  ...content: Array<MarkdownInlineBlockContent>
): MarkdownBoldBlock => {
  return new MarkdownBoldBlock(...content);
};
export const b = bold;

export type MarkdownItalicStyle = "*" | "_";
export class MarkdownItalicBlock extends MarkdownInlineBlock {
  private $style: MarkdownItalicStyle | undefined;
  private $defaultStyle: MarkdownItalicStyle = "*";

  style(opt: MarkdownItalicStyle): this {
    this.$style = opt;
    return this;
  }

  render(): string | null {
    const content = super.render();
    if (content === null || this.isEmpty) return null;
    return `${this.$style ?? this.$defaultStyle}${content}${this.$style ?? this.$defaultStyle}`;
  }
}

export const italic = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownItalicBlock => {
  return new MarkdownItalicBlock(...content);
};
export const i = italic;

export class MarkdownStrikethroughBlock extends MarkdownInlineBlock {
  render(): string | null {
    const content = super.render();
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

export class MarkdownHighlightBlock extends MarkdownInlineBlock {
  render(): string | null {
    const content = super.render();
    if (content === null || this.isEmpty) return null;
    return `==${content}==`;
  }
}

export const highlight = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownHighlightBlock => {
  return new MarkdownHighlightBlock(...content);
};
export const hl = highlight;

export class MarkdownSubscriptBlock extends MarkdownInlineBlock {
  render(): string | null {
    const content = super.render();
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
  render(): string | null {
    const content = super.render();
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
  private $url: string;

  constructor(url: string, ...label: Array<MarkdownInlineBlockContent>) {
    super(...label);
    this.$url = url;
  }

  $alt(
    condition: boolean,
    url: string,
    ...label: Array<MarkdownInlineBlockContent>
  ): this {
    if (!condition) return this;
    this.$url = url;
    this.$content = label;
    return this;
  }

  render(): string {
    const content = super.render();
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
const url = link;

export type MarkdownListType = "ul" | "ol";
export type MarkdownListStyle = "*" | "-" | "+";
export class MarkdownListBlock extends MarkdownMultilineBlock<{
  excludeMultiline: true;
}> {
  private $type: MarkdownListType = "ul";
  private $style: MarkdownListStyle | undefined;
  private $defaultStyle: MarkdownListStyle = "-";

  ordered(): this {
    this.$type = "ol";
    return this;
  }

  unordered(): this {
    this.$type = "ul";
    return this;
  }

  style(opt: MarkdownListStyle): this {
    this.$style = opt;
    return this;
  }

  render(): string | null {
    if (this.isEmpty) return null;
    return `${this.$lines
      .map((line, index) => {
        const content = line instanceof MarkdownBlock ? line.render() : line;
        if (content === null) return null;
        return this.$type === "ol"
          ? `${index + 1}. ${content}`
          : `${this.$style ?? this.$defaultStyle} ${content}`;
      })
      .join("\n")}`;
  }
}

export const list = (
  ...lines: Array<MarkdownLineBlockContent | MarkdownLineBlock>
): MarkdownListBlock => {
  return new MarkdownListBlock(...lines);
};
export const li = list;

type MarkdownTaskBlockStyle = "x" | "X";
export class MarkdownTaskBlock extends MarkdownLineBlock {
  private $checked: boolean = false;
  private $style: MarkdownTaskBlockStyle | undefined;
  private $defaultStyle: MarkdownTaskBlockStyle = "x";

  constructor(checked: boolean, ...line: Array<MarkdownLineBlockContent>) {
    super(...line);
    this.$checked = checked;
  }

  style(opt: MarkdownTaskBlockStyle): this {
    this.$style = opt;
    return this;
  }

  render(): string | null {
    const content = super.render();
    if (content === null) return null;
    return `- [${this.$checked ? (this.$style ?? this.$defaultStyle) : this._SPACE_STRING}] ${content}`;
  }
}

export const task = (
  checked: boolean,
  ...line: Array<MarkdownLineBlockContent>
): MarkdownTaskBlock => {
  return new MarkdownTaskBlock(checked, ...line);
};

export type MarkdownCodeBlockLanguage = string;
export class MarkdownCodeBlock extends MarkdownMultilineBlock {
  private $language: MarkdownCodeBlockLanguage | undefined;

  language(opt: MarkdownCodeBlockLanguage): this {
    this.$language = opt;
    return this;
  }

  render(): string | null {
    const content = super.render();
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
export const code = codeblock;

export class MarkdownImageBlock extends MarkdownInlineBlock {
  private $src: string;

  constructor(src: string, ...alt: Array<MarkdownInlineBlockContent>) {
    super(...alt);
    this.$src = src;
  }

  $alt(
    condition: boolean,
    src: string,
    ...alt: Array<MarkdownInlineBlockContent>
  ): this {
    if (!condition) return this;
    this.$src = src;
    this.$content = alt;
    return this;
  }

  render(): string | null {
    const content = super.render();
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

export type MarkdownHorizontalRuleStyle = "-" | "*" | "_";
export class MarkdownHorizontalRuleBlock extends MarkdownLineBlock {
  private $style: MarkdownHorizontalRuleStyle | undefined;
  private $defaultStyle: MarkdownHorizontalRuleStyle = "-";

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
    return `\n${(this.$style ?? this.$defaultStyle).repeat(this.$count)}\n`;
  }
}

export const horizontalRule = (): MarkdownHorizontalRuleBlock => {
  return new MarkdownHorizontalRuleBlock();
};
export const hr = horizontalRule;

export class MarkdownBlockquoteBlock extends MarkdownMultilineBlock {
  render(): string | null {
    if (this.isEmpty) return null;
    return this.$lines
      .flatMap((line) => {
        const content = line instanceof MarkdownBlock ? line.render() : line;
        if (content === null) return [];
        const lineIsBlockquote = line instanceof MarkdownBlockquoteBlock;
        const prefix = `>${lineIsBlockquote ? this._EMPTY_STRING : this._SPACE_STRING}`;
        return content.split("\n").map((l) => `${prefix}${l}`);
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

  private validateIdentifier(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  identifier(value: string): this {
    const content = super.render();
    if (!this.validateIdentifier(value) || content === null || this.isEmpty)
      return this;
    if (this.$identifier) return this;
    this.$identifier = value;
    return this;
  }

  render(): string | null {
    const content = super.render();
    if (
      !this.$identifier ||
      !this.validateIdentifier(this.$identifier) ||
      content === null ||
      this.isEmpty
    )
      return null;
    return `[^${this.$identifier}`;
  }
}

export const footnote = (
  ...content: Array<MarkdownInlineBlockContent>
): MarkdownFootnoteBlock => {
  return new MarkdownFootnoteBlock(...content);
};
export const foot = footnote;
export const fn = footnote;

export const m = {
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
  b,
  italic,
  i,
  strikethrough,
  strike,
  highlight,
  hl,
  subscript,
  sub,
  superscript,
  sup,
  link,
  url,
  image,
  img,
  list,
  li,
  codeblock,
  code,
  horizontalRule,
  hr,
  task,
  footnote,
  foot,
  fn,
};

/**
 * 
Headings X
Paragraphs X
Line Breaks
Emphasis X
Blockquotes X
Lists X
Code X
Horizontal Rules X
Links X
Images X

Tables
Fenced Code Blocks X
Footnotes
Heading IDs X
Definition Lists
Strikethrough X
Task Lists X
Emoji
Highlight X
Subscript X
Superscript X
 * DONE:
 * bold
 * italic
 * link
 * image
 * code
 * heading
 * paragraph
 * codeblock
 * ordered list
 * unordered list
 * horizontal rule
 * task list
 *
 *
 * TODO:
 * strikethrough
 * footnote
 * blockquote
 * table
 * details
 *
 */
