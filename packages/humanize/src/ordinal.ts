export interface OrdinalOptions {
  /**
   * A function to process the number before converting it to an ordinal string,
   * useful to format large numbers with commas or other formatting.
   *
   * @example (value) => value.toLocaleString()
   *
   * @param value The number to be converted to an ordinal string
   * @returns A string representation of the ordinal number
   */
  numberProcessor?: (value: number) => string;
}

/**
 * Converts a number to its ordinal string representation (e.g., 1 to "1st", 2 to "2nd").
 *
 * @param value The number to be converted to an ordinal string
 * @param options Additional options for formatting the ordinal string
 * @returns The ordinal string representation of the number
 */
export const ordinal = (
  /**
   * The number to be converted to an ordinal string
   */
  value: number,
  /**
   * Additional options for formatting the ordinal string
   */
  options?: OrdinalOptions
): string => {
  const numberProcessor =
    options?.numberProcessor ?? ((val: number) => val.toString());
  if (value === 0) return numberProcessor(value).toString();
  const specialCase = value % 100;
  if ([11, 12, 13].indexOf(specialCase) >= 0)
    return `${numberProcessor(value)}th`;
  const leastSignificant = value % 10;
  switch (leastSignificant) {
    case 1:
      return `${numberProcessor(value)}st`;
    case 2:
      return `${numberProcessor(value)}nd`;
    case 3:
      return `${numberProcessor(value)}rd`;
    default:
      return `${numberProcessor(value)}th`;
  }
};
