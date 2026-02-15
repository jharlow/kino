import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../primitives/markdown-inline-block";

export type MarkdownLinkTarget = "_blank" | "_self" | "_parent" | "_top";
export class MarkdownLinkBlock extends MarkdownInlineBlock {
  public $url: string;
  public $target: MarkdownLinkTarget | undefined = undefined;

  constructor(url: string, ...label: Array<MarkdownInlineBlockContent>) {
    super(...label);
    this.$url = url;
  }

  public target(target: MarkdownLinkTarget): this {
    this.$target = target;
    return this;
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
    if (this.$target) {
      const tagContent = content ? content : this.$url;
      const targetAttr = this.$target ? ` target="${this.$target}"` : "";
      return `<a href="${this.$url}"${targetAttr}>${tagContent}</a>`;
    }
    if (content === null) return `<${this.$url}>`;
    return `[${content}](${this.$url})`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(`url=${this.$url}`)
      .concat(this.$target ? [`target=${this.$target}`] : []);
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
