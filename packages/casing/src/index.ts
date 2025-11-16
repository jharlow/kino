/**
 * Represents a string cased in camelCase format. Starts with a lowercase letter,
 * followed by words with their first letter capitalized and no spaces or separators.
 *
 * Typically used in JS programming for variable and function names.
 *
 * @example 'fooBarBaz'
 */
type CamelCase = string;

/**
 * Represents a string cased in PascalCase format. Similar to camelCase but starts
 * with an uppercase letter. Each word's first letter is capitalized with no spaces.
 *
 * Typically used in JS programming for class names and constructors.
 *
 * @example 'FooBarBaz'
 */
type PascalCase = string;

/**
 * Represents a string cased in snake_case format. All letters are lowercase,
 * with words separated by underscores.
 *
 * Typically used in Python programming and some database naming conventions.
 *
 * @example 'foo_bar_baz'
 */
type SnakeCase = string;

/**
 * Represents a string cased in SCREAMING_SNAKE_CASE format. All letters are uppercase,
 * with words separated by underscores.
 *
 * Typically used for constants in various programming languages.
 *
 * @example 'FOO_BAR_BAZ'
 */
type ScreamingSnakeCase = string;

/**
 * Represents a string cased in kebab-case format. All letters are lowercase,
 * with words separated by hyphens.
 *
 * Typically used in URLs, CSS class names, and some configuration files.
 *
 * @example 'foo-bar-baz'
 */
type KebabCase = string;

/**
 * Represents a string cased in Sentence case format. The first letter of the
 * first word is capitalized, with the rest of the string in lowercase and words
 * separated by spaces.
 *
 * Typically used in titles and headings in prose writing.
 *
 * @example 'Foo bar baz'
 */
type SentenceCase = string;

/**
 * Represents a string cased in Title Case format. The first letter of each word
 * is capitalized, with the rest of the letters in lowercase and words separated by spaces.
 *
 * Some words (like conjunctions and prepositions) may remain lowercase depending on style guides.
 *
 * Typically used in titles and headings in prose writing.
 *
 * @example 'Foo, Bar and Baz'
 */
type TitleCase = string;

/**
 * Represents a string that does not strictly conform to any single casing convention.
 *
 * @example 'fOo-BaR_baz'
 */
type MixedCase = string;

type CasingMap = {
  camelCase: CamelCase;
  pascalCase: PascalCase;
  snakeCase: SnakeCase;
  screamingSnakeCase: ScreamingSnakeCase;
  kebabCase: KebabCase;
  sentenceCase: SentenceCase;
  titleCase: TitleCase;
  mixedCase: MixedCase;
};

export type CasingIdentifier = keyof CasingMap;

/**
 * Represents an array of words extracted from a string.
 * Each word is a substring that contributes to the overall casing format.
 *
 * @example ['the', 'quick', 'brown', 'fox']
 */
type Words = Array<string>;

const DEFAULT_WORD_MATCHER =
  /[A-Z\xc0-\xd6\xd8-\xde]?[a-z\xdf-\xf6\xf8-\xff]+(?:['’](?:d|ll|m|re|s|t|ve))?(?=[\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000]|[A-Z\xc0-\xd6\xd8-\xde]|$)|(?:[A-Z\xc0-\xd6\xd8-\xde]|[^\ud800-\udfff\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\d+\u2700-\u27bfa-z\xdf-\xf6\xf8-\xffA-Z\xc0-\xd6\xd8-\xde])+(?:['’](?:D|LL|M|RE|S|T|VE))?(?=[\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000]|[A-Z\xc0-\xd6\xd8-\xde](?:[a-z\xdf-\xf6\xf8-\xff]|[^\ud800-\udfff\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\d+\u2700-\u27bfa-z\xdf-\xf6\xf8-\xffA-Z\xc0-\xd6\xd8-\xde])|$)|[A-Z\xc0-\xd6\xd8-\xde]?(?:[a-z\xdf-\xf6\xf8-\xff]|[^\ud800-\udfff\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\d+\u2700-\u27bfa-z\xdf-\xf6\xf8-\xffA-Z\xc0-\xd6\xd8-\xde])+(?:['’](?:d|ll|m|re|s|t|ve))?|[A-Z\xc0-\xd6\xd8-\xde]+(?:['’](?:D|LL|M|RE|S|T|VE))?|\d*(?:1ST|2ND|3RD|(?![123])\dTH)(?=\b|[a-z_])|\d*(?:1st|2nd|3rd|(?![123])\dth)(?=\b|[A-Z_])|\d+|(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]|\ud83c[\udffb-\udfff])?)*/g;

const removeSpecialCharacters = (string: string): string =>
  string.replace(/[^A-Za-z0-9]+/g, " ");

const removeSpaces = (string: string): string => string.replace(/\s+/g, "");

const parseToWords = (string: string, fromCasing?: CasingIdentifier): Words => {
  switch (fromCasing) {
    case "camelCase":
      return removeSpaces(removeSpecialCharacters(string)).split(/(?=[A-Z])/);
    case "pascalCase":
      return removeSpaces(removeSpecialCharacters(string)).split(/(?=[A-Z])/);
    case "snakeCase":
      return string.split("_");
    case "screamingSnakeCase":
      return string.split("_");
    case "kebabCase":
      return string.split("-");
    case "sentenceCase":
      return string.split(" ").filter((s) => s.length > 0);
    case "titleCase":
      return string.split(" ");
    case "mixedCase":
      return string.match(DEFAULT_WORD_MATCHER) ?? [];
    default:
      return string.match(DEFAULT_WORD_MATCHER) ?? [];
  }
};

const upperFirst = (string: string): string =>
  string.length > 0 ? string[0].toUpperCase() + string.slice(1) : "";

/**
 * Options for customizing casing functions.
 */
interface CasingOptions {
  /**
   * If supplied, will use the specified casing as the source format resulting in better parsing
   *
   * By default, the casing is auto-detected and the string is broken into words using general rules.
   *
   * For example, if you know the input string is in snake_case, providing 'snakeCase' here will
   * ensure accurate word extraction.
   *
   * @example 'snakeCase'
   */
  fromCasing?: CasingIdentifier;
}

/**
 * Converts a given string to camelCase format.
 *
 * @param string The input string to be converted.
 * @param options Optional settings for the conversion.
 * @returns The camelCased version of the input string.
 */
export const camelCase = (
  /**
   * The input string to be converted.
   */
  string: string,
  /**
   * Optional settings for the conversion.
   */
  options?: CasingOptions
): CamelCase => {
  return parseToWords(string, options?.fromCasing).reduce(
    (acc, next) =>
      `${acc}${!acc ? next.toLowerCase() : upperFirst(next.toLowerCase())}`,
    ""
  );
};

/**
 * Converts a given string to PascalCase format.
 *
 * @param string The input string to be converted.
 * @param options Optional settings for the conversion.
 * @returns The PascalCased version of the input string.
 */
export const pascalCase = (
  /**
   * The input string to be converted.
   */
  string: string,
  /**
   * Optional settings for the conversion.
   */
  options?: CasingOptions
): PascalCase => upperFirst(camelCase(string, options));

/**
 * Converts a given string to snake_case format.
 *
 * @param string The input string to be converted.
 * @param options Optional settings for the conversion.
 * @returns The snake_cased version of the input string.
 */
export const snakeCase = (
  /**
   * The input string to be converted.
   */
  string: string,
  /**
   * Optional settings for the conversion.
   */
  options?: CasingOptions
): SnakeCase =>
  parseToWords(string, options?.fromCasing)
    .map((word) => word.toLowerCase())
    .join("_");

/**
 * Converts a given string to screaming_snake_case format.
 *
 * @param string The input string to be converted.
 * @param options Optional settings for the conversion.
 * @returns The screaming_snake_cased version of the input string.
 */
export const screamingSnakeCase = (
  /**
   * The input string to be converted.
   */
  string: string,
  /**
   * Optional settings for the conversion.
   */
  options?: CasingOptions
): ScreamingSnakeCase =>
  parseToWords(string, options?.fromCasing)
    .map((word) => word.toUpperCase())
    .join("_");

/**
 * Converts a given string to kebab-case format.
 *
 * @param string The input string to be converted.
 * @param options Optional settings for the conversion.
 * @returns The kebab-cased version of the input string.
 */
export const kebabCase = (
  /**
   * The input string to be converted.
   */
  string: string,
  /**
   * Optional settings for the conversion.
   */
  options?: CasingOptions
): KebabCase =>
  parseToWords(string, options?.fromCasing)
    .map((word) => word.toLowerCase())
    .join("-");

/**
 * Converts a given string to Sentence case format.
 *
 * @param string The input string to be converted.
 * @returns The Sentence cased version of the input string.
 */
export const sentenceCase = (
  /**
   * The input string to be converted.
   */
  string: string,
  /**
   * Optional settings for the conversion.
   */
  options?: CasingOptions
): SentenceCase =>
  upperFirst(parseToWords(string, options?.fromCasing).join(" ").toLowerCase());

/**
 * Options for customizing Title Case conversion.
 */
interface TitleCaseOptions extends CasingOptions {
  /**
   * An array of words to ignore when converting to Title Case. The only exception is the first
   * word, which will always be capitalized regardless of this list.
   *
   * These words will remain in lowercase.
   *
   * @default ["and", "or", "the", "a", "an", "in", "on", "with", "to", "for", "at", "by", "from", "of"]
   */
  ignoreWords?: Array<string>;
}

const DEFAULT_ENGLISH_TITLE_CASE_IGNORE_WORDS = [
  "and",
  "or",
  "the",
  "a",
  "an",
  "in",
  "on",
  "with",
  "to",
  "for",
  "at",
  "by",
  "from",
  "of",
];

/**
 * Converts a given string to Title Case format.
 *
 * @param string The input string to be converted.
 * @param options Optional settings for Title Case conversion.
 * @returns The Title Cased version of the input string.
 */
export const titleCase = (
  /**
   * The input string to be converted.
   */
  string: string,
  /**
   * Optional settings for Title Case conversion.
   */
  options?: TitleCaseOptions
): TitleCase =>
  parseToWords(string, options?.fromCasing)
    .map((s) => s.toLowerCase())
    .map((s, i) => {
      if (i === 0) {
        return upperFirst(s);
      }
      const ignoreWords =
        options?.ignoreWords ?? DEFAULT_ENGLISH_TITLE_CASE_IGNORE_WORDS;
      if (ignoreWords.includes(s.toLowerCase()) || ignoreWords.includes(s)) {
        return s.toLowerCase();
      }
      return upperFirst(s);
    })
    .join(" ");

/**
 * Analyzes the casing of a given string.
 *
 * @param string The input string to be analyzed.
 * @returns The detected casing style of the input string.
 */
export const detectCasing = (
  /**
   * The input string to be analyzed.
   */
  string: string
): CasingIdentifier => {
  if (string === camelCase(string)) return "camelCase";
  if (string === pascalCase(string)) return "pascalCase";
  if (string === snakeCase(string)) return "snakeCase";
  if (string === string.toUpperCase() && string === screamingSnakeCase(string))
    return "screamingSnakeCase";
  if (string === kebabCase(string)) return "kebabCase";
  if (string === sentenceCase(string)) return "sentenceCase";
  if (string === titleCase(string)) return "titleCase";
  return "mixedCase";
};
