import {
  MarkdownBlock,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownMultilineBlock,
  MarkdownMultilineBlockContent,
} from "../primitives/markdown-multiline-block";

export class MarkdownBlockquoteBlock extends MarkdownMultilineBlock<{
  excludeMultiline: false;
}> {
  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    return this.$lines
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
}

export const blockquote = (
  ...lines: Array<MarkdownMultilineBlockContent<{ excludeMultiline: false }>>
): MarkdownBlockquoteBlock => {
  return new MarkdownBlockquoteBlock(...lines);
};
export const block = blockquote;
export const bq = blockquote;
