import { MarkdownBlock } from "./markdown-block";
import { PrimitiveValue } from "./values";

export class MarkdownBlockInspector {
  constructor(private readonly block: MarkdownBlock) {}

  private filterEmpty(items: any[]): any[] {
    return items.filter(
      (item) => typeof item !== "string" || !/^\s*$/.test(item),
    );
  }

  private getBlockMeta(node: MarkdownBlock): string {
    const tags: string[] = node.getMetadataTags();
    return tags.length > 0 ? ` [${tags.join(", ")}]` : "";
  }

  private isTableBlock(
    node: MarkdownBlock,
  ): node is MarkdownBlock & { $columns: any[]; $rows: any[] } {
    return "$columns" in node && "$rows" in node;
  }

  private isDetailsBlock(
    node: MarkdownBlock,
  ): node is MarkdownBlock & {
    $summary: any[] | undefined;
    $lines: any[];
  } {
    return "$summary" in node && "$lines" in node;
  }

  private isCaptionedImageBlock(
    node: MarkdownBlock,
  ): node is MarkdownBlock & {
    $src: string;
    $content: any[];
    $caption: any[];
  } {
    return "$src" in node && "$caption" in node && !!(node as any).$caption;
  }

  private isFootnoteBlock(
    node: MarkdownBlock,
  ): node is MarkdownBlock & {
    $footer: MarkdownBlock & { $lines: any[] };
  } {
    return "$footer" in node;
  }

  private getChildren(
    node: MarkdownBlock,
  ): Array<PrimitiveValue | MarkdownBlock> {
    if (this.isTableBlock(node)) return [];
    if (this.isDetailsBlock(node)) return [];
    if (this.isCaptionedImageBlock(node)) return [];
    if (this.isFootnoteBlock(node)) return [];
    if ("$lines" in node) return this.filterEmpty((node as any).$lines);
    if ("$line" in node) return this.filterEmpty((node as any).$line);
    if ("$content" in node) return this.filterEmpty((node as any).$content);
    return [];
  }

  private inspectTableContents(
    node: MarkdownBlock & { $columns: any[]; $rows: any[] },
    childPrefix: string,
  ): string[] {
    const lines: string[] = [];
    const hasRows = node.$rows.length > 0;

    // columns group
    const colGroupLast = !hasRows;
    const colGroupConnector = colGroupLast ? "└── " : "├── ";
    const colGroupChildPrefix = childPrefix + (colGroupLast ? "    " : "│   ");
    lines.push(`${childPrefix}${colGroupConnector}columns`);
    node.$columns.forEach((col: any, i: number) => {
      const isLast = i === node.$columns.length - 1;
      lines.push(...this.inspectNode(col.name, colGroupChildPrefix, isLast));
    });

    // rows group
    if (hasRows) {
      lines.push(`${childPrefix}└── rows`);
      const rowsChildPrefix = childPrefix + "    ";
      node.$rows.forEach((row: any, r: number) => {
        const isLastRow = r === node.$rows.length - 1;
        const rowConnector = isLastRow ? "└── " : "├── ";
        const rowChildPrefix = rowsChildPrefix + (isLastRow ? "    " : "│   ");
        lines.push(`${rowsChildPrefix}${rowConnector}row ${r}`);
        node.$columns.forEach((col: any, c: number) => {
          const isLastCol = c === node.$columns.length - 1;
          lines.push(
            ...this.inspectNode(row[col.key], rowChildPrefix, isLastCol),
          );
        });
      });
    }

    return lines;
  }

  private inspectCaptionedImageContents(
    node: MarkdownBlock & { $content: any[]; $caption: any[] },
    childPrefix: string,
  ): string[] {
    const lines: string[] = [];
    const altItems = this.filterEmpty(node.$content);
    const captionItems = this.filterEmpty(node.$caption);
    const hasAlt = altItems.length > 0;
    const hasCaption = captionItems.length > 0;

    // alt group
    if (hasAlt) {
      const altGroupConnector = hasCaption ? "├── " : "└── ";
      const altGroupChildPrefix =
        childPrefix + (hasCaption ? "│   " : "    ");
      lines.push(`${childPrefix}${altGroupConnector}alt`);
      altItems.forEach((item: any, i: number) => {
        const isLast = i === altItems.length - 1;
        lines.push(...this.inspectNode(item, altGroupChildPrefix, isLast));
      });
    }

    // caption group
    if (hasCaption) {
      const captionGroupChildPrefix = childPrefix + "    ";
      lines.push(`${childPrefix}└── caption`);
      captionItems.forEach((item: any, i: number) => {
        const isLast = i === captionItems.length - 1;
        lines.push(
          ...this.inspectNode(item, captionGroupChildPrefix, isLast),
        );
      });
    }

    return lines;
  }

  private inspectDetailsContents(
    node: MarkdownBlock & { $summary: any[] | undefined; $lines: any[] },
    childPrefix: string,
  ): string[] {
    const lines: string[] = [];
    const summaryItems = node.$summary
      ? this.filterEmpty(node.$summary)
      : [];
    const contentItems = this.filterEmpty(node.$lines);
    const hasSummary = summaryItems.length > 0;
    const hasContent = contentItems.length > 0;

    // summary group
    if (hasSummary) {
      const summaryGroupConnector = hasContent ? "├── " : "└── ";
      const summaryGroupChildPrefix =
        childPrefix + (hasContent ? "│   " : "    ");
      lines.push(`${childPrefix}${summaryGroupConnector}summary`);
      summaryItems.forEach((item: any, i: number) => {
        const isLast = i === summaryItems.length - 1;
        lines.push(
          ...this.inspectNode(item, summaryGroupChildPrefix, isLast),
        );
      });
    }

    // content group
    if (hasContent) {
      const contentGroupChildPrefix = childPrefix + "    ";
      lines.push(`${childPrefix}└── content`);
      contentItems.forEach((item: any, i: number) => {
        const isLast = i === contentItems.length - 1;
        lines.push(
          ...this.inspectNode(item, contentGroupChildPrefix, isLast),
        );
      });
    }

    return lines;
  }

  private inspectFootnoteContents(
    node: MarkdownBlock & { $footer: MarkdownBlock & { $lines: any[] } },
    childPrefix: string,
  ): string[] {
    const lines: string[] = [];
    const footerItems = this.filterEmpty(node.$footer.$lines);
    if (footerItems.length > 0) {
      const footerChildPrefix = childPrefix + "    ";
      lines.push(`${childPrefix}└── footer`);
      footerItems.forEach((item: any, i: number) => {
        const isLast = i === footerItems.length - 1;
        lines.push(...this.inspectNode(item, footerChildPrefix, isLast));
      });
    }
    return lines;
  }

  private inspectNode(
    node: PrimitiveValue | MarkdownBlock,
    prefix: string,
    isLast: boolean,
  ): string[] {
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");

    if (node === null) return [`${prefix}${connector}null`];
    if (node === undefined) return [`${prefix}${connector}undefined`];
    if (typeof node !== "object") {
      const str = String(node);
      const display =
        typeof node === "string"
          ? `"${str.length > 60 ? str.slice(0, 57) + "..." : str}"`
          : str;
      return [`${prefix}${connector}${display}`];
    }

    const name = node.constructor.name;
    const meta = this.getBlockMeta(node);
    const lines: string[] = [`${prefix}${connector}${name}${meta}`];

    if (this.isTableBlock(node)) {
      lines.push(...this.inspectTableContents(node, childPrefix));
    } else if (this.isDetailsBlock(node)) {
      lines.push(...this.inspectDetailsContents(node, childPrefix));
    } else if (this.isCaptionedImageBlock(node)) {
      lines.push(...this.inspectCaptionedImageContents(node, childPrefix));
    } else if (this.isFootnoteBlock(node)) {
      lines.push(...this.inspectFootnoteContents(node, childPrefix));
    } else {
      const children = this.getChildren(node);
      for (let i = 0; i < children.length; i++) {
        lines.push(
          ...this.inspectNode(
            children[i],
            childPrefix,
            i === children.length - 1,
          ),
        );
      }
    }

    return lines;
  }

  public inspect(): string {
    const name = this.block.constructor.name;
    const meta = this.getBlockMeta(this.block);
    const lines: string[] = [`${name}${meta}`];

    if (this.isTableBlock(this.block)) {
      lines.push(...this.inspectTableContents(this.block, ""));
    } else if (this.isDetailsBlock(this.block)) {
      lines.push(...this.inspectDetailsContents(this.block, ""));
    } else if (this.isCaptionedImageBlock(this.block)) {
      lines.push(...this.inspectCaptionedImageContents(this.block, ""));
    } else if (this.isFootnoteBlock(this.block)) {
      lines.push(...this.inspectFootnoteContents(this.block, ""));
    } else {
      const children = this.getChildren(this.block);
      for (let i = 0; i < children.length; i++) {
        lines.push(
          ...this.inspectNode(children[i], "", i === children.length - 1),
        );
      }
    }

    return lines.join("\n");
  }
}

export const inspect = (block: MarkdownBlock): string => {
  return block.inspect();
};
