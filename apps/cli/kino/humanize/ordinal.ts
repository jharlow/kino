export interface OrdinalOverrides {
  unique: { [k in number]: string };
  multipleOf: { [k in number]: string };
}

export const ordinal = (
  value: number,
  overrides?: OrdinalOverrides
): string => {
  if (value === 0) return value.toString();
  const specialCase = value % 100;
  if ([11, 12, 13].indexOf(specialCase) >= 0) return `${value}th`;
  const leastSignificant = value % 10;
  switch (leastSignificant) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};
