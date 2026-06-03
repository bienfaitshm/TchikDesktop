export interface UserNames {
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
}

type WithFullName<T> = T & { fullName: string };

const getSortableFullName = (user: UserNames | undefined | null): string => {
  if (!user) return "";

  const { lastName, middleName, firstName } = user;
  let fullName = "";

  if (lastName) fullName += lastName;
  if (middleName) fullName += (fullName ? " " : "") + middleName;
  if (firstName) fullName += (fullName ? " " : "") + firstName;

  return fullName.trim();
};

/**
 * Formats a user's name components into a single, clean full name string.
 * Removes any empty, null, or undefined parts to prevent double spacing.
 */
export const formatFullName = (user: UserNames | null | undefined): string => {
  if (!user) return "";

  return [user.lastName, user.middleName, user.firstName]
    .map((name) => name?.trim())
    .filter(Boolean)
    .join(" ");
};

/**
 * Enriches a user object with a computed fullName property.
 * Safe-casts the return object to satisfy the generic constraint T.
 */
export const withFullName = <T extends UserNames | undefined | null>(
  user: T | null | undefined,
): WithFullName<T> => {
  return {
    ...user,
    fullName: formatFullName(user),
  } as WithFullName<T>;
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
