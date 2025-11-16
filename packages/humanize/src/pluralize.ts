/**
 * Conditionally returns the plural vs singular form of a word based on a supplied count
 *
 * @param count The count of the singular form in this instance
 * @param singular The singular form of the word
 * @param plural Optional: the plural form of the singular
 * @returns The appropriate singular or plural form based on the count
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
