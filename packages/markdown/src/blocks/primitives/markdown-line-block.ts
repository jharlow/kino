import { MarkdownBlock, OptionalRenderingOptions } from "./markdown-block";
import { MarkdownInlineBlock } from "./markdown-inline-block";
import { BooleanCoercibleValue, PrimitiveValue } from "./values";

export type MarkdownLineBlockContent = PrimitiveValue | MarkdownInlineBlock;
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
