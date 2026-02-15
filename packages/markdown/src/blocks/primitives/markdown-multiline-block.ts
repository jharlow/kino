import {
  MarkdownHeadingBlock,
  MarkdownHeadingLevel,
} from "../standard/markdown-heading-block";
import { MarkdownLineBreakBlock } from "../standard/markdown-line-break-block";
import { MarkdownBlock, OptionalRenderingOptions } from "./markdown-block";
import { MarkdownInlineBlock } from "./markdown-inline-block";
import { MarkdownLineBlock } from "./markdown-line-block";
import { BooleanCoercibleValue, PrimitiveValue } from "./values";

export type MarkdownMultilineBlockOptions = {
  excludeMultiline: boolean;
};
export type MarkdownMultilineBlockContent<
  OPTS extends MarkdownMultilineBlockOptions = { excludeMultiline: false },
> = OPTS["excludeMultiline"] extends true
  ? PrimitiveValue | MarkdownInlineBlock | MarkdownLineBlock
  :
      | PrimitiveValue
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
    if (!Boolean(condition)) return this;
    this.$lines = [];
    return this;
  }

  public if(condition: BooleanCoercibleValue): this {
    return this.emptyIf(!condition);
  }

  public defaultIfEmpty(
    ...lines: Array<MarkdownMultilineBlockContent<OPTS>>
  ): this {
    if (!this.isEmpty) return this;
    this.$lines = lines;
    return this;
  }

  public default(...lines: Array<MarkdownMultilineBlockContent<OPTS>>): this {
    return this.defaultIfEmpty(...lines);
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

  private isSectionBlock(
    line: unknown,
  ): line is MarkdownMultilineBlock & { depth: number } {
    return (
      line instanceof MarkdownMultilineBlock &&
      (line.constructor.name === "MarkdownSectionBlock" ||
        line.constructor.name === "MarkdownDocument")
    );
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const { newlineStrategy } = this.getRenderingOptions(options);
    const entries = this.$lines
      .filter((line) => this.shouldFilter(line, options))
      .map((line) => {
        if (this.isPrimitive(line)) return { rendered: line, source: line };
        if (this.isSectionBlock(line)) {
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
