import { describe, it, expect } from "vitest";
import { b } from "../index";

describe("MarkdownLiteral", () => {
  it("should create a literal from a tagged template with no interpolations", () => {
    const literal = b.md`hello world`;
    expect(String(literal)).toBe("hello world");
  });

  it("should return null for an empty literal", () => {
    const literal = b.md``;
    expect(literal.render()).toBeNull();
  });

  it("should interpolate a string value", () => {
    const name = "world";
    const literal = b.md`hello ${name}`;
    expect(String(literal)).toBe("hello world");
  });

  it("should interpolate a bold block", () => {
    const literal = b.md`hello ${b.bold("world")}`;
    expect(String(literal)).toBe("hello **world**");
  });

  it("should interpolate an italic block", () => {
    const literal = b.md`this is ${b.italic("emphasized")} text`;
    expect(String(literal)).toBe("this is *emphasized* text");
  });

  it("should interpolate nested inline blocks", () => {
    const literal = b.md`check ${b.bold("bold ", b.italic("and italic"))} out`;
    expect(String(literal)).toBe("check **bold *and italic*** out");
  });

  it("should handle multiple interpolations", () => {
    const literal = b.md`${b.bold("hello")} and ${b.italic("world")}`;
    expect(String(literal)).toBe("**hello** and *world*");
  });

  it("should be coercible via String()", () => {
    const literal = b.md`simple text`;
    expect(String(literal)).toBe("simple text");
  });

  it("should be coercible via template literal", () => {
    const literal = b.md`simple text`;
    expect(`${literal}`).toBe("simple text");
  });

  it("should interpolate a strikethrough block", () => {
    const literal = b.md`this is ${b.strike("deleted")} text`;
    expect(String(literal)).toBe("this is ~~deleted~~ text");
  });

  it("should interpolate a link block", () => {
    const literal = b.md`visit ${b.url("https://example.com", "here")}`;
    expect(String(literal)).toBe("visit [here](https://example.com)");
  });

  it("should interpolate a code inline block", () => {
    const literal = b.md`use ${b.code("console.log")} for debugging`;
    expect(String(literal)).toBe("use `console.log` for debugging");
  });

  it("should interpolate a highlight block", () => {
    const literal = b.md`this is ${b.highlight("important")} info`;
    expect(String(literal)).toBe("this is ==important== info");
  });

  it("should interpolate an emoji block", () => {
    const literal = b.md`hello ${b.emoji("wave")} there`;
    expect(String(literal)).toBe("hello :wave: there");
  });

  it("should handle many interpolations in sequence", () => {
    const literal = b.md`${b.bold("a")}${b.italic("b")}${b.strike("c")}`;
    expect(String(literal)).toBe("**a***b*~~c~~");
  });

  it("should handle interpolation at the start", () => {
    const literal = b.md`${b.bold("start")} of text`;
    expect(String(literal)).toBe("**start** of text");
  });

  it("should handle interpolation at the end", () => {
    const literal = b.md`end of ${b.bold("text")}`;
    expect(String(literal)).toBe("end of **text**");
  });

  it("should be usable via b.markdown alias", () => {
    const literal = b.markdown`hello ${b.bold("world")}`;
    expect(String(literal)).toBe("hello **world**");
  });

  it("should accept paragraph blocks as interpolation values", () => {
    const literal = b.md`before ${b.para("paragraph content")} after`;
    expect(String(literal)).toBe("before paragraph content after");
  });

  it("should return null when all interpolated content is empty", () => {
    const empty = b.bold().emptyIf(false);
    const literal = b.md`${empty}`;
    expect(literal.render()).toBeNull();
  });

  it("should interpolate a deeply nested block", () => {
    const literal = b.md`text ${b.bold(b.italic(b.strike("deep")))} end`;
    expect(String(literal)).toBe("text ***~~deep~~*** end");
  });

  it("should interpolate a deeply nested block with explicit underscore italic style", () => {
    const literal = b.md`text ${b.bold(b.italic("nested").style("_"))} end`;
    expect(String(literal)).toBe("text **_nested_** end");
  });

  it("should work with number interpolations", () => {
    const literal = b.md`count: ${42}`;
    expect(String(literal)).toBe("count: 42");
  });

  it("should parse a document that contains no blocks", () => {
    const literal = b.md`
    # Heading 1
    Hey, here's some Q's for you:
    
    | Table | Header 2 |
    | --- | --- |
    | Row 1 | Row 2 |
    - List item 1
    - List item 2
    ## Header 2
    > Blockquote
    > Paragraph text
    > > **bold** and *italic*
    > [link](https://example.com)
    > ==highlighted==
    > ~sub~
    ### Header 3
    - [ ] Task item 1
    ## Header 2-2
    - [x] Task item 2-1
    - [ ] Task item 2-2
    - [x] Task item 2-3
    ### Header 3-1
    - [ ] Task item 3-1
    - [x] Task item 3-2
    #### Header 4
  
    - [ ] Task item 3-3
    `.parse();
    console.log(literal.inspect());
  });
});
