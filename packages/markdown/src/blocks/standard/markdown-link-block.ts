import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../primitives/markdown-inline-block";

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

  public getMetadataTags(): BlockMetadataTags {
    return super.getMetadataTags().concat(`url=${this.$url}`);
  }
}

export const link = (
  url: string,
  ...label: Array<string | MarkdownInlineBlock>
): MarkdownLinkBlock => {
  return new MarkdownLinkBlock(url, ...label);
};
export const url = link;

MarkdownInlineBlock._register("link", MarkdownLinkBlock);
