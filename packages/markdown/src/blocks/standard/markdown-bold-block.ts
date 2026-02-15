import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../primitives/markdown-inline-block";
export type MarkdownBoldStyle = "**" | "__";
export class MarkdownBoldBlock extends MarkdownInlineBlock {
  public $style: MarkdownBoldStyle | undefined;
  private readonly _defaultStyle: MarkdownBoldStyle = "**";

  public style(opt: MarkdownBoldStyle): this {
    this.$style = opt;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    const style =
      options?.enforce?.bold?.style ?? this.$style ?? this._defaultStyle;
    return `${style}${content}${style}`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$style ? [`style=${this.$style}`] : []);
  }
}

export const bold = (
  ...content: Array<MarkdownInlineBlockContent>
): MarkdownBoldBlock => {
  return new MarkdownBoldBlock(...content);
};

MarkdownInlineBlock._register("bold", MarkdownBoldBlock);
