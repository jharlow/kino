import { describe, it, expect } from "vitest";
import {
  camelCase,
  CasingIdentifier,
  detectCasing,
  kebabCase,
  pascalCase,
  screamingSnakeCase,
  sentenceCase,
  snakeCase,
  titleCase,
} from ".";

const genericTestCases: Array<[CasingIdentifier, string]> = [
  ["camelCase", "theQuickBrownFox"],
  ["pascalCase", "TheQuickBrownFox"],
  ["snakeCase", "the_quick_brown_fox"],
  ["screamingSnakeCase", "THE_QUICK_BROWN_FOX"],
  ["kebabCase", "the-quick-brown-fox"],
  ["sentenceCase", "The quick brown fox"],
  ["titleCase", "The Quick Brown Fox"],
  ["mixedCase", "The - Quick - Brown - Fox"],
];

/**
 * These test cases include special characters and irregular spacing
 * to test the robustness of the casing functions when the input format
 * is known.
 */
const specifiedFromTestCases: Array<[CasingIdentifier, string]> = [
  ["camelCase", "the_Quick!Brown@Fox "],
  ["pascalCase", " The-Quick_Brown#Fox"],
  ["snakeCase", "the_Quick_Brown_Fox"],
  ["screamingSnakeCase", "THE_QuICK_BRoWN_FOX"],
  ["kebabCase", "the-Quick-Brown-Fox"],
  ["sentenceCase", " the  quick   brown    fox "],
  ["titleCase", "the quick BROWN fox"],
  ["mixedCase", " The_QuickBrownFox "],
];

const edgeCases: Array<[CasingIdentifier | undefined, string, string]> = [
  ["titleCase", "!_-!", "!_-!"],
  ["mixedCase", "___", ""],
  ["mixedCase", "   ", ""],
  [undefined, "", ""],
];

describe(camelCase.name, () => {
  it.each(genericTestCases)(
    "should convert various string formats to camelCase for case: %s",
    (_, testCase) => {
      expect(camelCase(testCase)).toBe("theQuickBrownFox");
    }
  );

  it.each(specifiedFromTestCases)(
    "should convert better if from case is known: %s",
    (caseType, testCase) => {
      expect(camelCase(testCase, { fromCasing: caseType })).toBe(
        "theQuickBrownFox"
      );
    }
  );

  it.each(edgeCases)(
    "should handle edge cases for case: %s",
    (from, testCase, expected) => {
      expect(camelCase(testCase, { fromCasing: from })).toBe(expected);
    }
  );
});

describe(pascalCase.name, () => {
  it.each(genericTestCases)(
    "should convert various string formats to PascalCase for case: %s",
    (_, testCase) => {
      expect(pascalCase(testCase)).toBe("TheQuickBrownFox");
    }
  );

  it.each(specifiedFromTestCases)(
    "should convert better if from case is known: %s",
    (caseType, testCase) => {
      expect(pascalCase(testCase, { fromCasing: caseType })).toBe(
        "TheQuickBrownFox"
      );
    }
  );

  it.each(edgeCases)(
    "should handle edge cases for case: %s",
    (from, testCase, expected) => {
      expect(pascalCase(testCase, { fromCasing: from })).toBe(expected);
    }
  );
});

describe(snakeCase.name, () => {
  it.each(genericTestCases)(
    "should convert various string formats to snake_case for case: %s",
    (_, testCase) => {
      expect(snakeCase(testCase)).toBe("the_quick_brown_fox");
    }
  );

  it.each(specifiedFromTestCases)(
    "should convert better if from case is known: %s",
    (caseType, testCase) => {
      expect(snakeCase(testCase, { fromCasing: caseType })).toBe(
        "the_quick_brown_fox"
      );
    }
  );

  it.each(edgeCases)(
    "should handle edge cases for case: %s",
    (from, testCase, expected) => {
      expect(snakeCase(testCase, { fromCasing: from })).toBe(expected);
    }
  );
});

describe(screamingSnakeCase.name, () => {
  it.each(genericTestCases)(
    "should convert various string formats to screaming_snake_case for case: %s",
    (_, testCase) => {
      expect(screamingSnakeCase(testCase)).toBe("THE_QUICK_BROWN_FOX");
    }
  );

  it.each(specifiedFromTestCases)(
    "should convert better if from case is known: %s",
    (caseType, testCase) => {
      expect(screamingSnakeCase(testCase, { fromCasing: caseType })).toBe(
        "THE_QUICK_BROWN_FOX"
      );
    }
  );

  it.each(edgeCases)(
    "should handle edge cases for case: %s",
    (from, testCase, expected) => {
      expect(screamingSnakeCase(testCase, { fromCasing: from })).toBe(expected);
    }
  );
});

describe(kebabCase.name, () => {
  it.each(genericTestCases)(
    "should convert various string formats to kebab-case for case: %s",
    (_, testCase) => {
      expect(kebabCase(testCase)).toBe("the-quick-brown-fox");
    }
  );

  it.each(specifiedFromTestCases)(
    "should convert better if from case is known: %s",
    (caseType, testCase) => {
      expect(kebabCase(testCase, { fromCasing: caseType })).toBe(
        "the-quick-brown-fox"
      );
    }
  );

  it.each(edgeCases)(
    "should handle edge cases for case: %s",
    (from, testCase, expected) => {
      expect(kebabCase(testCase, { fromCasing: from })).toBe(expected);
    }
  );
});

describe(sentenceCase.name, () => {
  it.each(genericTestCases)(
    "should convert various string formats to Sentence case for case: %s",
    (_, testCase) => {
      expect(sentenceCase(testCase)).toBe("The quick brown fox");
    }
  );

  it.each(specifiedFromTestCases)(
    "should convert better if from case is known: %s",
    (caseType, testCase) => {
      expect(sentenceCase(testCase, { fromCasing: caseType })).toBe(
        "The quick brown fox"
      );
    }
  );

  it.each(edgeCases)(
    "should handle edge cases for case: %s",
    (from, testCase, expected) => {
      expect(sentenceCase(testCase, { fromCasing: from })).toBe(expected);
    }
  );
});

describe(titleCase.name, () => {
  it.each(genericTestCases)(
    "should convert various string formats to Sentence case for case: %s",
    (_, testCase) => {
      expect(titleCase(testCase)).toBe("The Quick Brown Fox");
    }
  );

  it.each(specifiedFromTestCases)(
    "should convert better if from case is known: %s",
    (caseType, testCase) => {
      expect(titleCase(testCase, { fromCasing: caseType })).toBe(
        "The Quick Brown Fox"
      );
    }
  );

  it("should ignore default words in title case", () => {
    const testString =
      "the quick brown fox jumps over the lazy dog and runs into a house";
    expect(titleCase(testString)).toBe(
      "The Quick Brown Fox Jumps Over the Lazy Dog and Runs Into a House"
    );
  });

  it("should ignore custom words in title case", () => {
    const testString =
      "the quick brown fox jumps over the lazy dog and runs into a house";
    expect(
      titleCase(testString, {
        ignoreWords: ["quick", "lazy", "runs", "house"],
      })
    ).toBe("The quick Brown Fox Jumps Over The lazy Dog And runs Into A house");
  });

  it.each(edgeCases)(
    "should handle edge cases for case: %s",
    (from, testCase, expected) => {
      expect(titleCase(testCase, { fromCasing: from })).toBe(expected);
    }
  );
});

describe(detectCasing.name, () => {
  it.each(genericTestCases)(
    "should detect casing for case: %s",
    (caseType, testCase) => {
      expect(detectCasing(testCase)).toBe(caseType);
    }
  );
});
