/**
 * Conditionally returns the plural vs singular form of a word based on a supplied count
 */
export const pluralize = (
  /**
   * The count of the singular form in this instance
   * @example 2
   */
  count: number,
  /**
   * The singular form of the word
   * @example 'shoe'
   */
  singular: string,
  /**
   * Optional: the plural form of the singular
   * @default - the singular form with an 's' prefixed
   * @example - 'children'
   */
  plural?: string
): string => {
  return count === 1 ? singular : (plural ?? `${singular}s`);
};
