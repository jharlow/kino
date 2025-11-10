export interface OrdinalOptions {
  numberProcessor?: (value: number) => string;
}

export type Suffix = string;

export const ordinal = (value: number, options?: OrdinalOptions): string => {
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
