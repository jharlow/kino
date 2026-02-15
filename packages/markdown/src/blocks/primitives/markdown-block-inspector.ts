import { MarkdownBlock } from "./markdown-block";
import { PrimitiveValue } from "./values";

export class MarkdownBlockInspector {
  constructor(private readonly block: MarkdownBlock) {}

  private getBlockMeta(node: MarkdownBlock): string {
    const tags: string[] = node.getMetadataTags();
    return tags.length > 0 ? ` [${tags.join(", ")}]` : "";
  }

  private isTableBlock(
    node: MarkdownBlock,
  ): node is MarkdownBlock & { $columns: any[]; $rows: any[] } {
    return "$columns" in node && "$rows" in node;
  }

  private getChildren(
    node: MarkdownBlock,
  ): Array<PrimitiveValue | MarkdownBlock> {
    if (this.isTableBlock(node)) return [];
    if ("$lines" in node) return (node as any).$lines;
    if ("$line" in node) return (node as any).$line;
    if ("$content" in node) return (node as any).$content;
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
