import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";
import {
  MarkdownMultilineBlock,
  MarkdownMultilineBlockContent,
} from "../primitives/markdown-multiline-block";

export class MarkdownFootnoteBlock extends MarkdownInlineBlock {
  public $identifier: string | undefined;
  public $footer = new MarkdownMultilineBlock();

  constructor(...lines: Array<MarkdownMultilineBlockContent>) {
    super();
    this.$footer.$lines.push(...lines);
  }

  private validateIdentifier(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  public identifier(value: string): this {
    if (!this.validateIdentifier(value)) return this;
    if (this.$identifier) return this;
    this.$identifier = value;
    return this;
  }

  public id(value: string): this {
    return this.identifier(value);
  }

  public render(): string | null {
    if (!this.$identifier || this.$footer.isEmpty) return null;
    return `[^${this.$identifier}]`;
  }

  public renderDefinition(options?: OptionalRenderingOptions): string | null {
    const content = this.$footer.render(options);
    if (!this.$identifier || content === null || this.$footer.isEmpty)
      return null;
    return `[^${this.$identifier}]: ${content}`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$identifier ? [`identifier=${this.$identifier}`] : []);
  }
}

export const footnote = (
  ...lines: Array<MarkdownMultilineBlockContent>
): MarkdownFootnoteBlock => {
  return new MarkdownFootnoteBlock(...lines);
};
export const foot = footnote;
export const fn = footnote;
