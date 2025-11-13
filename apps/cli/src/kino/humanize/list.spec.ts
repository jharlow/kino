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

  it.each([true, false])(
    "should accept custom trucation strings using oxfordComma=%s",
    (oxfordComma) => {
      const limitString = "and some other fruits";

      expect(list(items, { limit: 3, limitString, oxfordComma })).toEqual(
        `apple, orange, banana${oxfordComma ? "," : ""} ${limitString}`
      );
      expect(
        list(items.slice(0, 3), { limit: 3, limitString, oxfordComma })
      ).toEqual(`apple, orange${oxfordComma ? "," : ""} and banana`);
      expect(
        list(["john", "jane", "jombah", "jerediah"], {
          limit: 3,
          oxfordComma,
          limitString: "and other people",
        })
      ).toEqual(`john, jane, jombah${oxfordComma ? "," : ""} and other people`);
    }
  );

  it.each([true, false])(
    "should accept custom joiner and other strings using oxfordComma=%s",
    (oxfordComma) => {
      expect(
        list(items, {
          limit: 3,
          joinString: "et",
          otherString: "more fruit",
          oxfordComma,
        })
      ).toEqual(
        `apple, orange, banana${oxfordComma ? "," : ""} et 2 more fruits`
      );
      expect(
        list(items, {
          limit: 4,
          joinString: "et",
          otherString: "more fruit",
          oxfordComma,
        })
      ).toEqual(
        `apple, orange, banana, pear${oxfordComma ? "," : ""} et 1 more fruit`
      );
      expect(
        list(["john", "jane", "jombah"], {
          limit: 1,
          otherString: { singular: "more person", plural: "more people" },
          oxfordComma,
        })
      ).toEqual(`john${oxfordComma ? "," : ""} and 2 more people`);
      expect(
        list(["john", "jane", "jombah"], {
          limit: 2,
          otherString: { singular: "more person", plural: "more people" },
          oxfordComma,
        })
      ).toEqual(`john, jane${oxfordComma ? "," : ""} and 1 more person`);
    }
  );
});
