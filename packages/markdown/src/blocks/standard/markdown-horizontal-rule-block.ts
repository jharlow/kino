import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import { MarkdownLineBlock } from "../primitives/markdown-line-block";

export type MarkdownHorizontalRuleStyle = "-" | "*" | "_";

export class MarkdownHorizontalRuleBlock extends MarkdownLineBlock {
  public $style: MarkdownHorizontalRuleStyle | undefined;
  private readonly _defaultStyle: MarkdownHorizontalRuleStyle = "-";
  public $count: number | undefined = undefined;
  private readonly _defaultCount: number = 3;

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
      options?.enforce?.horizontalRule?.style ??
      this.$style ??
      this._defaultStyle;
    return `\n${style.repeat(this.$count ?? this._defaultCount)}\n`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$style ? [`style=${this.$style}`] : [])
      .concat(this.$count ? [`count=${this.$count}`] : []);
  }
}

export const horizontalRule = (): MarkdownHorizontalRuleBlock => {
  return new MarkdownHorizontalRuleBlock();
};
export const hr = horizontalRule;
