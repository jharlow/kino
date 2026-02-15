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
  constructor(...line: Array<MarkdownInlineBlockContent>) {
    super(...(line as Array<MarkdownLineBlockContent>));
  }

  public parse(): MarkdownDocument {
    return new MarkdownBlockParser().parse(this.render() ?? "");
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    return content;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super.getMetadataTags().concat(this.$trim ? ["trimmed"] : []);
  }
}

export function markdown(
  strings: TemplateStringsArray,
  ...exprs: Array<MarkdownMultilineBlockContent>
): MarkdownLiteral {
  const parts: Array<MarkdownMultilineBlockContent> = [];
  for (let i = 0; i < strings.length; i++) {
    parts.push(strings[i]);
    if (i < exprs.length) parts.push(exprs[i]);
  }
  console.log("parts", parts);
  return new MarkdownLiteral(...(parts as Array<MarkdownInlineBlockContent>));
}
export const md = markdown;
