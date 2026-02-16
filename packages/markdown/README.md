# `bamd` - block architected markdown documents

Write context agnostic Markdown documents that look good wherever they're rendered

## What is `bamd`?

By using a block architecture, `bamd` allows you to write complex Markdown documents that are context-agnostic and always render well. You're documents can easily interlace defaults, hide blocks conditionally, and adjust automatically when injected into other `bamd` documents.

```ts
import { b } from "bamd";

type User = { name?: string; email?: string; alternateEmail?: string };
const createUserDoc = (user: User): MarkdownDocument => {
  const footnote = b
    .footnote(`Alternate email: ${user.alternateEmail}`)
    .if(user.alternateEmail);
  return b
    .doc(
      b.heading("User details"),
      b`The users name is ${b.p(user.name).default("unknown")}`,
      b`${b.b("The users email is")}: ${user.email}${footnote}`.if(user.email),
    )
    .if(user.name || user.email);
};

const user: User = { email: "john@email.com", alternateEmail: "john@work.com" };
const userDoc = createUserDoc(user);
console.log(`${userDoc}`);
// # User details
// The users name is unknown
// **The users email is**: john@email.com[^1]
//
// [^1]: Alternate email: john@work.com

const prompt = b
  .doc(
    b.heading("Instructions"),
    "Greet the user and introduce yourself as a helpful AI assistant.",
    userDoc,
    "Once you have done this, call the `welcomeGiven` tool.",
  )
  .setRenderingOptions({
    enforce: { bold: { style: "__" } },
    newlineStrategy: "between_blocks",
  });
console.log(String(prompt));
// # Instructions
//
// Greet the user and introduce yourself as a helpful AI assistant.
//
// ## User details
//
// The users name is unknown
//
// __The users email is__: john@email.com[^1]
//
// Once you have done this, call the `welcomeGiven` tool.
//
// [^1]: Alternate email: john@work.com
```

Notice that in this example:

- The user document reacts to the data using a simple, declarative syntax
- When `userDoc` is injected into the prompt, the `bamd` doc reorganizes the headings to make sense contextually, and moves the footer to the bottom of the document
- You can enforce consistent rendering at the root document level, which applies recursively to sub-documents
- The document is readable by embedding it in template literals, passing to `String()`, or calling the `.toString()` method directly from the document

This is the magic of a block-based architecture. By keeping a walkable block structure until the document needs to be rendered, documents are able to be context-agnostic and react to where they're embedded.

```ts
console.log(userDoc.inspect());
// MarkdownDocument
// ├── MarkdownHeadingBlock
// │   └── "User details"
// ├── MarkdownLiteral [trimmed]
// │   ├── "The users name is "
// │   └── MarkdownParagraphBlock
// │       └── "unknown"
// └── MarkdownLiteral [trimmed]
//     ├── MarkdownBoldBlock
//     │   └── "The users email is"
//     ├── ": "
//     ├── "john@email.com"
//     └── MarkdownFootnoteBlock
//         └── footer
//             └── "Alternate email: john@work.com"
```

It also enables you to use a comfortable, chainable syntax to create your documents, which is perfect for building complex prompts programmatically.

```ts
type PullRequest = { title: string; reviewer: string; approved: boolean };
const createPrDoc = (pr: PullRequest): MarkdownDocument => {
  const reviewer = b.b(pr.reviewer).change((block) => {
    if (pr.approved) return block.strikethrough();
    return block;
  });
  return b.doc(b.b(pr.title).h(), b.p("Reviewer: ", reviewer));
};

const pr: PullRequest = { title: "100", reviewer: "John", approved: true };
console.log(String(createPrDoc(pr)));
// # **100**
// Reviewer: ~~**John**~~

console.log(String(createPrDoc({ ...pr, approved: false })));
// # **100**
// Reviewer: **John**
```

Because `bamd` allows all primitive data types as inputs, and it's resulting documents are swappable to anywhere you currently use `string`s, it's very easy to incrementally adopt `bamd`.

For near instant adoption anywhere you use template literals today, just prefix them with `b`. By default, `b` detects injected blocks and encapsulates them (see the first example above), but if you would prefer to write markdown as you normally would, you can combine `b` with the `.parse()` method.

```ts
//                    👇 add `b` to existing template literals
const existingPrompt = b` 
  # About our company
  We are a company that makes widgets.

  ## Our process
  We follow a _rigorous_ process to make ==widgets==.

  ## Our customers
  | Name       | Email                  |
  |------------|------------------------|
  | John Doe   | john.doe@example.com   |
  | Jane Smith | jane.smith@example.com |
`.parse(); // 👈 and then `.parse()` it to convert it automatically

console.log(existingPrompt.inspect());
// MarkdownDocument
// ├── MarkdownHeadingBlock
// │   └── "About our company"
// ├── MarkdownParagraphBlock
// │   └── "We are a company that makes widgets."
// ├── MarkdownLineBreakBlock
// ├── MarkdownSectionBlock
// │   ├── MarkdownHeadingBlock
// │   │   └── "Our process"
// │   ├── MarkdownParagraphBlock
// │   │   ├── "We follow a "
// │   │   ├── MarkdownItalicBlock [style=_]
// │   │   │   └── "rigorous"
// │   │   ├── " process to make "
// │   │   ├── MarkdownHighlightBlock
// │   │   │   └── "widgets"
// │   │   └── "."
// │   └── MarkdownLineBreakBlock
// └── MarkdownSectionBlock
//     ├── MarkdownHeadingBlock
//     │   └── "Our customers"
//     └── MarkdownTableBlock [columns=Name,Email, rows=2]
//         ├── columns
//         │   ├── "Name"
//         │   └── "Email"
//         └── rows
//             ├── row 0
//             │   ├── "John Doe"
//             │   └── "john.doe@example.com"
//             └── row 1
//                 ├── "Jane Smith"
//                 └── "jane.smith@example.com"
```

`b` also improves on standard template literals by automatically removing empty lines at the top and bottom of your document, and removes leading whitespace from each line, unless it's a code block or indented list, meaning you can forget about causing indentation issues.

## Features

- Full support for standard, extended, and Github Flavored Markdown syntax specifications
- Additional support for common Markdown hacks like underlines, comments, details, and image captions
- Sub-document and section handling renders your blocks perfectly wherever they're injected
- Concise chaining API that focuses on terseness
- Simple return interfaces enable easy typing for document factories
- Automatic parsing using `b``.parse()` enables quick adoption
- Documents convert to strings automatically in `String()` and template literals
- Zero dependencies and minimal bundle size

## Installation

```bash
npm install bamd
```

## Advice

### Encode as much block data as possible

The most important thing to understand about `bamd` is that the more metadata you encode in the block system, the more able it is to ensure that your documents are truly context-agnostic.

`bamd` exposes many ways to achieve this, which allows you to pick whichever one suits your use case best. Parse encoding is best for quickly adopting existing template literals, functional encoding works best for constructing complex, conditional documents, and template encoding offers a mix of the conveniences of both syntaxes.

```ts
const templateEncoding = b`
${b.h("Example document").l(2).id("example-document")}
${b.b("Important text")}${b.fn("example footnote")}
`;

const functionalEncoding = b.doc(
  b.h("Example document").l(2).id("example-document"),
  b.p(b.b("Important text"), b.fn("example footnote")),
);

const parseEncoding = b`
## Example document {#example-document}
**Important text**[^1]

[^1]: example footnote
`.parse();

expect(String(templateEncoding)).toBe(String(functionalEncoding));
expect(String(functionalEncoding)).toBe(String(parseEncoding));
```

### Use chaining to express conditions

When creating complex documents that need to respond to state, use the provided methods to easily handle most scenarios. `.if()`, `.default()`, and `.change()` should cover most use cases.

```ts
const createUserTemplate = (
  userName: string,
  isWorking: boolean,
  status: string,
): MarkdownInlineBlock => {
  return b
    .p(userName)
    .if(isWorking)
    .default("Unknown")
    .change((block) => {
      if (status === "active") return block.bold();
      if (status === "inactive") return block.strikethrough();
      return block;
    });
};

expect(String(createUserTemplate("", true, "unknown"))).toBe("Unknown");
expect(String(createUserTemplate("John", false, "active"))).toBe("**Unknown**");
expect(String(createUserTemplate("John", true, "active"))).toBe("**John**");
expect(String(createUserTemplate("John", true, "inactive"))).toBe("~~John~~");
expect(String(createUserTemplate("John", true, "unknown"))).toBe("John");
```

### Keep typing as simple as possible

Types in `bamd` have been designed carefully to avoid complexity. There is a three-tier hierarchy of types which will help keep your I/O extremely lean when embedding/returning `bamd` blocks.

```bash
Tier 1: MarkdownBlock
└── Tier 2: MarkdownInlineBlock | MarkdownLineBlock | MarkdownMultilineBlock
    └── Tier 3: Specific Markdown blocks (MarkdownBoldBlock etc)
```

As a general rule, use the highest level of specificity that it is convenient for a function to accept/return. For the most part, `bamd` should type to tier 3 for you automatically, however if you need to declare type signatures yourself, it can be more convenient to duck down to the next lowest tier.

```ts
const createUserTemplate = (
  userName: string,
  status: string,
): MarkdownInlineBlock => {
  // 👆 the inferred return type is
  //    MarkdownParagraphBlock | MarkdownBoldBlock | MarkdownStrikethroughBlock
  //    however, it was more convenient to explicitly type the return as MarkdownInlineBlock
  return b.p(userName).change((block) => {
    if (status === "active") return block.bold();
    if (status === "inactive") return block.strikethrough();
    return block;
  });
};
```

### Use rendering options at call time

### Convenience functions

As shown throughout this doc, if you want to see the current state of any block and it's sub-blocks, you can call `.inspect()`
