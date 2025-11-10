import { pluralize } from "./pluralize";

export interface ListOptions {
  /**
   * Use an oxford comma (adds a comma after the last list item before 'and')
   * @example true
   * @default false
   */
  oxfordComma?: boolean;
  /**
   * The limit of items to enumerate - if supplied array exceeds this length, the list will be
   * contracted, and the remaining count will be appended to the list using `joinString` and
   * `otherString`.
   * @example 2
   * @default undefined - will not contract the list
   */
  limit?: number;
  /**
   * If supplied, will override the default appended remaining count phrase in the event the array
   * length exceeds the `limit` option
   * @example 'and some other fruits'
   * @default undefined - will fall back to 'and {x} other(s)'
   */
  limitString?: string;
  /**
   * If supplied, will override the default joining string used for all lists with more than 2 items
   * @example 'et'
   * @default 'and'
   */
  joinString?: string;
  /**
   * If supplied, will override the default other string used when contracting lists, but when a
   * `limitString` is not supplied. Always pluralized, use an object value to set both a singular and
   * pluralized form.
   * @example 'more fruits' || { singular: 'more person', plural: 'more people' }
   * @default 'other'
   */
  otherString?: string | { singular: string; plural: string };
}

const getExtra = (array: Array<string>, options?: ListOptions): number =>
  options?.limit ? Math.max(array.length - options.limit, 0) : 0;

const DEFAULT_JOINER = "and";

const getJoiner = (options?: ListOptions): string =>
  options?.joinString ?? DEFAULT_JOINER;

const getOther = (
  options?: ListOptions
): { singular: string; plural?: string } => {
  const otherSingular = options?.otherString
    ? typeof options.otherString === "string"
      ? options.otherString
      : options.otherString.singular
    : "other";
  const otherPlural = options?.otherString
    ? typeof options.otherString === "string"
      ? undefined
      : options.otherString.plural
    : undefined;
  return { singular: otherSingular, plural: otherPlural };
};

const getLimitString = (array: Array<string>, options?: ListOptions) => {
  const extra = getExtra(array, options);
  const joiner = getJoiner(options);
  const { singular: otherSingular, plural: otherPlural } = getOther(options);
  if (options?.limitString) {
    return `${options.oxfordComma ? ", " : " "}${options.limitString}`;
  } else {
    return `${options?.oxfordComma ? ", " : " "}${joiner} ${extra} ${pluralize(extra, otherSingular, otherPlural)}`;
  }
};

/**
 * Converts a list of items to a human readable string
 */
export const list = (
  /**
   * The array of strings (items) to convert to a humanized list
   */
  array: Array<string>,
  /**
   * Options for customizing the list output
   */
  options?: ListOptions
): string => {
  const extra = getExtra(array, options);
  const listOverLimit = extra > 0;
  const joiner = getJoiner(options);
  const listWithinLimit = array.slice(0, options?.limit);
  if (listWithinLimit.length < 2 && !listOverLimit) {
    return String(listWithinLimit);
  } else if (listWithinLimit.length === 2 && !listOverLimit) {
    return listWithinLimit.join(` ${joiner} `);
  } else if (listOverLimit) {
    return listWithinLimit.join(", ") + getLimitString(array, options);
  }
  return (
    array.slice(0, -1).join(", ") +
    `${options?.oxfordComma ? ", " : " "}${joiner} ${array[array.length - 1]}`
  );
};
