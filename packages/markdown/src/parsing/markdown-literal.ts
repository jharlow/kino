import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../blocks/primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../blocks/primitives/markdown-inline-block";
import { MarkdownLineBlockContent } from "../blocks/primitives/markdown-line-block";
import { MarkdownMultilineBlockContent } from "../blocks/primitives/markdown-multiline-block";
import { MarkdownDocument } from "../blocks/utilities/markdown-document-block";
import { MarkdownBlockParser } from "./markdown-block-parser";

export class MarkdownLiteral extends MarkdownInlineBlock {
  private _document: MarkdownDocument;
  constructor(...line: Array<MarkdownInlineBlockContent>) {
    super(...(line as Array<MarkdownLineBlockContent>));
    this._document = new MarkdownDocument(new MarkdownInlineBlock(...line));
  }

  public parse(): MarkdownDocument {
    // this makes sure we parse the full document, not just the inline content
    return new MarkdownBlockParser().parse(String(this));
  }

  public getMetadataTags(): BlockMetadataTags {
    return super.getMetadataTags().concat(this.$trim ? ["trimmed"] : []);
  }

  // this ensures that a full document is rendered when the literal is used in a template literal or String()
  // useful for writing markdown as you normally would, but still getting the benefits of the block system
  [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "string") return String(this._document);
    return super[Symbol.toPrimitive](hint);
  }
}

export function markdown(
  strings: TemplateStringsArray,
  ...exprs: Array<MarkdownMultilineBlockContent>
): MarkdownLiteral {
  // Calculate common indent from lines that start at column 0 in the template
  // (i.e., lines after a newline in string parts, not continuations from expressions)
  const indentLines: string[] = [];
  for (const s of strings) {
    const segments = s.split("\n");
    for (let j = 1; j < segments.length; j++) {
      indentLines.push(segments[j]);
    }
  }
  const nonEmptyLines = indentLines.filter((l) => l.trim() !== "");
  const minIndent =
    nonEmptyLines.length > 0
      ? Math.min(
          ...nonEmptyLines.map(
            (l) => (l.match(/^(\s*)/) ?? ["", ""])[1].length,
          ),
        )
      : 0;

  const parts: Array<MarkdownMultilineBlockContent> = [];
  for (let i = 0; i < strings.length; i++) {
    let str = strings[i];
    if (minIndent > 0) {
      const segments = str.split("\n");
      // Only strip segments after the first (those that start a new line)
      for (let j = 1; j < segments.length; j++) {
        segments[j] = segments[j].slice(
          Math.min(minIndent, segments[j].length),
        );
      }
      str = segments.join("\n");
    }
    parts.push(str);
    if (i < exprs.length) parts.push(exprs[i]);
  }
  return new MarkdownLiteral(...(parts as Array<MarkdownInlineBlockContent>));
}
export const md = markdown;
