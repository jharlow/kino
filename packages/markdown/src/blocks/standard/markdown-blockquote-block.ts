import {
  BlockMetadataTags,
  MarkdownBlock,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";
import {
  MarkdownMultilineBlock,
  MarkdownMultilineBlockContent,
} from "../primitives/markdown-multiline-block";

export type GithubFlavoredBlockquoteAlert =
  | "note"
  | "tip"
  | "important"
  | "warning"
  | "caution";
export class MarkdownBlockquoteBlock extends MarkdownMultilineBlock<{
  excludeMultiline: false;
}> {
  public $alert: GithubFlavoredBlockquoteAlert | undefined = undefined;

  public alert(alert: GithubFlavoredBlockquoteAlert | undefined): this {
    this.$alert = alert;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const prefix = this.$alert ? `[!${this.$alert.toUpperCase()}]` : "";
    const lines = this.$alert ? [prefix, ...this.$lines] : this.$lines;
    return lines
      .filter((line) => this.shouldFilter(line, options))
      .flatMap((line) => {
        const content =
          line instanceof MarkdownBlock ? line.render(options) : line;
        if (content === null) return [];
        const lineIsBlockquote = line instanceof MarkdownBlockquoteBlock;
        const prefix = `>${lineIsBlockquote ? this._EMPTY_STRING : this._SPACE_STRING}`;
        return String(content)
          .split("\n")
          .map((l) => `${prefix}${l}`);
      })
      .filter((line) => line !== null)
      .join("\n");
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$alert ? [`alert=${this.$alert}`] : []);
  }
}

export const blockquote = (
  ...lines: Array<MarkdownMultilineBlockContent<{ excludeMultiline: false }>>
): MarkdownBlockquoteBlock => {
  return new MarkdownBlockquoteBlock(...lines);
};
export const block = blockquote;
export const bq = blockquote;

MarkdownInlineBlock._register("blockquote", MarkdownBlockquoteBlock);
