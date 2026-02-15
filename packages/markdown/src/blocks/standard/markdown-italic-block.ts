import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";

export type MarkdownItalicStyle = "*" | "_";

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

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$style ? [`style=${this.$style}`] : []);
  }
}

export const italic = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownItalicBlock => {
  return new MarkdownItalicBlock(...content);
};
export const i = italic;

MarkdownInlineBlock._register("italic", MarkdownItalicBlock);
