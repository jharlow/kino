import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownLineBlock,
  MarkdownLineBlockContent,
} from "../primitives/markdown-line-block";

export type MarkdownUnorderedListItemStyle = "*" | "-" | "+";

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
      options?.enforce?.unorderedListItem?.style ??
      this.$style ??
      this._defaultStyle;
    return `${style} ${content}`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$style ? [`style=${this.$style}`] : []);
  }
}

export const unorderedListItem = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownUnorderedListItemBlock => {
  return new MarkdownUnorderedListItemBlock(...line);
};
export const uli = unorderedListItem;
