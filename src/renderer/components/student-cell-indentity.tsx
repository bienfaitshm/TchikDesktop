import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { StudentAvatar } from "./student-avatar";
import type { USER_GENDER_ENUM } from "@/packages/@core/data-access/db";
import { cn } from "../utils";

export type StudentCellIdentityProps = {
  fullName?: string;
  isNewStudent?: boolean;
  isProDeo?: boolean;
  gender: USER_GENDER_ENUM;
  className?: string;
};

/**
 * Resolves the localized status label for a student according to gender agreement.
 * @param isNewStudent - Flag indicating whether the student is newly enrolled.
 * @param gender - The gender enum value of the student.
 * @returns The gender-adjusted status string ("Nouveau", "Nouvelle", "Ancien", "Ancienne").
 */
function getStudentStatusLabel(
  isNewStudent: boolean | undefined,
  gender: USER_GENDER_ENUM,
): string {
  const normalizedGender = String(gender).toUpperCase();
  const isFemale = normalizedGender === "FEMALE" || normalizedGender === "F";

  if (isNewStudent) {
    return isFemale ? "Nouvelle" : "Nouveau";
  }
  return isFemale ? "Ancienne" : "Ancien";
}

/**
 * Renders a compact student identity cell with avatar, full name, and gender-aware status flags.
 * @param props - Component properties containing student attributes and flags.
 * @returns The rendered StudentCellIdentity component.
 */
export const StudentCellIdentity: React.FC<StudentCellIdentityProps> = ({
  fullName = "-",
  isNewStudent,
  isProDeo,
  gender,
  className,
}) => {
  const statusLabel = getStudentStatusLabel(isNewStudent, gender);

  return (
    <Item
      className={cn(
        "bg-transparent border-none p-0 gap-3 min-w-37.5",
        className,
      )}
    >
      <ItemMedia>
        <StudentAvatar fullName={fullName} />
      </ItemMedia>
      <ItemContent className="gap-0.5">
        <ItemTitle className="text-xs font-medium leading-none text-foreground">
          {fullName}
        </ItemTitle>
        <ItemDescription className="text-[10px] font-semibold tracking-wider flex items-center gap-1.5">
          <span
            className={
              isNewStudent ? "text-primary font-bold" : "text-muted-foreground"
            }
          >
            {statusLabel}
          </span>
          {isProDeo && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-foreground/80">Pro Deo</span>
            </>
          )}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
