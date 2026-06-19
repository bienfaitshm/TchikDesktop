import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import { getSectionLabel } from "@/packages/@core/data-access/db/options";
import { School, GraduationCap, Building } from "lucide-react";

/**
 * Mappage des icônes Lucide React aux sections.
 * Cela ajoute une représentation visuelle à chaque type de section.
 */
const SECTION_ICON_MAP = {
  [SECTION_ENUM.KINDERGARTEN]: School,
  [SECTION_ENUM.PRIMARY]: GraduationCap,
  [SECTION_ENUM.SECONDARY]: Building,
};

/**
 * Propriétés attendues par le composant SectionBadge.
 */
interface SectionBadgeProps {
  /**
   * Le type de section (ex: MATERNELLE, PRIMAIRE, SECONDAIRE).
   */
  section?: SECTION_ENUM;
}

/**
 * Composant `SectionBadge`
 *
 * Affiche un badge stylisé avec une icône et le nom traduit de la section.
 * La couleur et l'icône du badge varient en fonction du type de section.
 *
 * @param {SectionBadgeProps} props Les propriétés du composant.
 * @returns {JSX.Element} Le composant Badge avec l'icône et le texte de la section.
 */
export const SectionBadge = ({
  section = SECTION_ENUM.SECONDARY,
}: SectionBadgeProps) => {
  const IconComponent = SECTION_ICON_MAP[section];

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium rounded-full w-fit">
      {IconComponent && <IconComponent className="size-3.5" />}
      {getSectionLabel(section)}
    </div>
  );
};
