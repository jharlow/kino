import { describe, expect, it } from "vitest";
import { list } from "./list";

describe(list.name, () => {
  const items = ["apple", "orange", "banana", "pear", "pineapple"];

  it("should return an empty string when given an empty list", () => {
    expect(list(items.slice(0, 0))).toEqual("");
  });

  it("should return a string version of a list that has only one value", () => {
    expect(list(items.slice(0, 1))).toEqual("apple");
  });

  it("should return items separated by 'and' when given a list of two values", () => {
    expect(list(items.slice(0, 2))).toEqual("apple and orange");
  });

  it("should convert a list into a humanized list", () => {
    expect(list(items.slice(0))).toEqual(
      "apple, orange, banana, pear and pineapple"
    );
  });

  it("should convert a list to an oxford commafied string", () => {
    expect(list(items.slice(0), { oxfordComma: true })).toEqual(
      "apple, orange, banana, pear, and pineapple"
    );
  });

  it("should truncate a large list of items with proper pluralization", () => {
    expect(list(items.slice(0), { limit: 3 })).toEqual(
      "apple, orange, banana and 2 others"
    );
    expect(list(items.slice(0), { limit: 4 })).toEqual(
      "apple, orange, banana, pear and 1 other"
    );
  });

  it("should accept custom trucation strings", () => {
    const limitString = "and some other fruits";

    expect(list(items, { limit: 3, limitString })).toEqual(
      `apple, orange, banana ${limitString}`
    );
    expect(list(items.slice(0, 3), { limit: 3, limitString })).toEqual(
      "apple, orange and banana"
    );
  });

  it("should accept custom joiner and other strings", () => {
    expect(
      list(items, { limit: 3, joinString: "et", otherString: "more fruit" })
    ).toEqual("apple, orange, banana et 2 more fruits");
    expect(
      list(items, { limit: 4, joinString: "et", otherString: "more fruit" })
    ).toEqual("apple, orange, banana, pear et 1 more fruit");
    expect(
      list(["john", "jane", "jombah"], {
        limit: 1,
        otherString: { singular: "more person", plural: "more people" },
      })
    ).toEqual("john and 2 more people");
    expect(
      list(["john", "jane", "jombah"], {
        limit: 2,
        otherString: { singular: "more person", plural: "more people" },
      })
    ).toEqual("john, jane and 1 more person");
  });
});
