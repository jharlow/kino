/**
 * Converts a count into a human readable phrasing of occurrences
 */
export const times = (
  /**
   * The number of occurrences
   * @example 2
   */
  count: number,
  /**
   * Overrides for specific numbers
   * @example { 2: 'dos times'}
   * @default { 0: "never", 1: "once", 2: "twice", }"
   */
  overrides?: { [key in number]: string },
  /**
   * The suffix used if no override is present
   * @example 'occurrences'
   * @default 'times'
   */
  defaultSuffix?: string
): string => {
  const calculatedOverrides: { [key in number]: string } = {
    0: "never",
    1: "once",
    2: "twice",
    ...(overrides ?? {}),
  };
  return (
    calculatedOverrides[count] ??
    `${count.toString()} ${defaultSuffix ?? "times"}`
  );
};
