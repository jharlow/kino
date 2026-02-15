import type { MarkdownBoldBlock } from "../standard/markdown-bold-block";
import type { MarkdownImageBlock } from "../standard/markdown-image-block";
import type { MarkdownItalicBlock } from "../standard/markdown-italic-block";
import type { MarkdownLinkBlock } from "../standard/markdown-link-block";
import type { MarkdownHighlightBlock } from "../extended/markdown-highlight-block";
import type { MarkdownStrikethroughBlock } from "../extended/markdown-strikethrough-block";
import type { MarkdownSubscriptBlock } from "../extended/markdown-subscript-block";
import type { MarkdownSuperscriptBlock } from "../extended/markdown-superscript-block";
import { MarkdownBlock, OptionalRenderingOptions } from "./markdown-block";
import { BooleanCoercibleValue, PrimitiveValue } from "./values";

export type MarkdownInlineBlockContent = PrimitiveValue | MarkdownInlineBlock;

export class MarkdownInlineBlock extends MarkdownBlock {
  public $content: Array<MarkdownInlineBlockContent> = [];

  static _factories = new Map<string, new (...args: any[]) => MarkdownInlineBlock>();

  static _register(name: string, ctor: new (...args: any[]) => MarkdownInlineBlock) {
    MarkdownInlineBlock._factories.set(name, ctor);
  }

  private _create(name: string, ...args: any[]): MarkdownInlineBlock {
    const Ctor = MarkdownInlineBlock._factories.get(name);
    if (!Ctor) throw new Error(`Block type '${name}' not registered`);
    return new Ctor(...args);
  }

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
    return this._create("bold", this) as unknown as MarkdownBoldBlock;
  }

  public b(): MarkdownBoldBlock {
    return this.bold();
  }

  public italic(): MarkdownItalicBlock {
    return this._create("italic", this) as unknown as MarkdownItalicBlock;
  }

  public i(): MarkdownItalicBlock {
    return this.italic();
  }

  public strikethrough(): MarkdownStrikethroughBlock {
    return this._create("strikethrough", this) as unknown as MarkdownStrikethroughBlock;
  }

  public st(): MarkdownStrikethroughBlock {
    return this.strikethrough();
  }

  public highlight(): MarkdownHighlightBlock {
    return this._create("highlight", this) as unknown as MarkdownHighlightBlock;
  }

  public hl(): MarkdownHighlightBlock {
    return this.highlight();
  }

  public subscript(): MarkdownSubscriptBlock {
    return this._create("subscript") as unknown as MarkdownSubscriptBlock;
  }

  public sub(): MarkdownSubscriptBlock {
    return this.subscript();
  }

  public superscript(): MarkdownSuperscriptBlock {
    return this._create("superscript", this) as unknown as MarkdownSuperscriptBlock;
  }

  public sup(): MarkdownSuperscriptBlock {
    return this.superscript();
  }

  public link(url: string): MarkdownLinkBlock {
    return this._create("link", url, this) as unknown as MarkdownLinkBlock;
  }

  public url(url: string): MarkdownLinkBlock {
    return this.link(url);
  }

  public image(src: string): MarkdownImageBlock {
    return this._create("image", src, this) as unknown as MarkdownImageBlock;
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
