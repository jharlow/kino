# `bamd` - block architected markdown documents

Write context agnostic Markdown documents that look good wherever they're rendered

## What is `bamd`?

By using a block architecture, `bamd` allows you to write complex Markdown documents that are context-agnostic and always render well. You're documents can easily interlace defaults, hide blocks conditionally, and adjust automatically when injected into other `bamd` documents.

```ts
import * as b from "bamd";

type User = { name?: string; email?: string; alternateEmail?: string };

const createUserDoc = (user: User): MarkdownDocument => {
  const footnote = b
    .footnote(`Alternate email: ${user.alternateEmail}`)
    .if(user.alternateEmail);
  return b
    .doc(
      b.headline("User details"),
      b.md`The users name is ${b.p(user.name).default("unknown")}`,
      b.md`${b.b("The users email is")}: ${user.email}${footnote}`.if(
        user.email,
      ),
    )
    .if(user.name || user.email);
};

const user: User = {
  email: "john.doe@example.com",
  alternateEmail: "john.doe@work.com",
};
const userDoc = createUserDoc(user);
console.log(`${userDoc}`);
// # User details
// The users name is unknown
// **The users email is**: john.doe@example.com[^1]
//
// [^1]: Alternate email: john.doe@work.com

const prompt = b
  .doc(
    b.headline("Instructions"),
    b.p("Greet the user and introduce yourself as a helpful AI assistant."),
    userDoc,
    b.p("Once you have done this, call the `welcomeGiven` tool."),
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
// __The users email is__: john.doe@example.com[^1]
//
// Once you have done this, call the `welcomeGiven` tool.
//
// [^1]: Alternate email: undefined
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
// ├── MarkdownHeadingBlock [level=2]
// │   └── "User details"
// ├── MarkdownLiteral [trimmed]
// │   ├── "The users name is "
// │   ├── MarkdownParagraphBlock
// │   │   └── "unknown"
// └── MarkdownLiteral [trimmed]
//     ├── MarkdownBoldBlock
//     │   └── "The users email is"
//     ├── ": "
//     ├── "john.doe@example.com"
//     └── MarkdownFootnoteBlock [identifier=1]
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
// # *100*
// Reviewer: ~~**John**~~

console.log(String(createPrDoc({ ...pr, approved: false })));
// # *100*
// Reviewer: **John**
```

Because `bamd` allows all primitive data types as inputs, and it's resulting documents are swappable to anywhere you currently use `string`s, it's very easy to incrementally adopt `bamd`.

For near instant adoption anywhere you use template literals today, just prefix them with `b.md`. By default, `b.md` detects injected blocks and encapsulates them (see the first example above), but if you would prefer to write markdown as you normally would, you can combine `b.md` with the `.parse()` method.

```ts
//                    👇 add `b.md` to existing template literals
const existingPrompt = b.md` 
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

`b.md` also improves on standard template literals by automatically removing empty lines at the top and bottom of your document, and removes leading whitespace from each line, unless it's a code block or indented list, meaning you can forget about causing indentation issues.

## Features

- Full support for standard, extended, and Github Flavored Markdown syntax specifications
- Sub-document and section handling renders your blocks perfectly whereever they're injected
- Concise chaining API that focuses on terseness
- Simple return interfaces enable easy typing for document factories
- Automatic parsing using `b.md``.parse()` enables quick adoption
- Documents convert to strings automatically in `String()` and template literals
- Zero dependencies and minimal bundle size
