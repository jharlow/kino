import {
  BlockMetadataTags,
  MarkdownBlock,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../primitives/markdown-inline-block";

export class MarkdownImageBlock extends MarkdownInlineBlock {
  public $src: string;
  public $caption: Array<MarkdownInlineBlockContent> | undefined = undefined;

  constructor(src: string, ...alt: Array<MarkdownInlineBlockContent>) {
    super(...alt);
    this.$src = src;
  }

  public caption(...content: Array<MarkdownInlineBlockContent>): this {
    this.$caption = content;
    return this;
  }

  public defaultIfEmpty(
    src: string,
    ...alt: Array<MarkdownInlineBlockContent>
  ): this {
    if (!this.isEmpty) return this;
    this.$src = src;
    this.$content = alt;
    return this;
  }

  public default(src: string, ...alt: Array<MarkdownInlineBlockContent>): this {
    return this.defaultIfEmpty(src, ...alt);
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (this.$caption) {
      const captionContent = this.$caption
        .map((block) =>
          block instanceof MarkdownBlock
            ? block.render(options)
            : String(block),
        )
        .join("\n");
      const altTag = content ? ` alt="${content}"` : "";
      return `<figure>\n  <img src="${this.$src}"${altTag}>\n  <figcaption>${captionContent}</figcaption>\n</figure>`;
    }
    if (content === null) return null;
    return `![${content}](${this.$src})`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super.getMetadataTags().concat(`src=${this.$src}`);
  }
}

export const image = (
  src: string,
  ...alt: Array<MarkdownInlineBlockContent>
): MarkdownImageBlock => {
  return new MarkdownImageBlock(src, ...alt);
};
export const img = image;

MarkdownInlineBlock._register("image", MarkdownImageBlock);
