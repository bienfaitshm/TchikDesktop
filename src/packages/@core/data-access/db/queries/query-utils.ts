export interface UserNames {
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
}

const getSortableFullName = (user: UserNames | undefined | null): string => {
  if (!user) return "";

  const { lastName, middleName, firstName } = user;
  let fullName = "";

  if (lastName) fullName += lastName;
  if (middleName) fullName += (fullName ? " " : "") + middleName;
  if (firstName) fullName += (fullName ? " " : "") + firstName;

  return fullName.trim();
};

export const compareByFullName = <T>(
  extractUser: (item: T) => UserNames | undefined | null,
  locale = "fr",
) => {
  const collator = new Intl.Collator(locale, {
    sensitivity: "accent",
    numeric: true,
  });

  return (a: T, b: T): number => {
    const nameA = getSortableFullName(extractUser(a));
    const nameB = getSortableFullName(extractUser(b));

    return collator.compare(nameA, nameB);
  };
};
