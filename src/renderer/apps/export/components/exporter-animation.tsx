import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileQuestion, Sparkles } from "lucide-react";
import type { ComboBoxOption } from "@/renderer/components/form/fields/generic-combo-box";
import type { DocumentMetadata } from "@/packages/electron-data-exporter";
import { CATEGORY_THEMES, EXTENSION_CONFIG, CategoryTheme } from "../constants";
import {
  getDocumentCategoryLabel,
  DocumentCategory,
} from "@/packages/@core/documents-exports/constants";
import { cn } from "@/renderer/utils";

export type ExportAnimationProps = {
  docOptions?: ComboBoxOption<DocumentMetadata<unknown>>[];
  selected?: string;
};

export function ExportInfos({
  docOptions = [],
  selected,
}: ExportAnimationProps) {
  const documentSelected = useMemo(() => {
    return docOptions.find((el) => el.value === selected)?.data;
  }, [docOptions, selected]);

  const categoryTheme: CategoryTheme = useMemo(() => {
    if (!documentSelected?.category) return CATEGORY_THEMES.OTHER;
    return CATEGORY_THEMES[documentSelected.category] ?? CATEGORY_THEMES.OTHER;
  }, [documentSelected]);

  const CategoryIcon = categoryTheme.icon;

  return (
    <div className="w-full rounded-2xl border border-border p-4 shadow-sm backdrop-blur-md transition-all duration-300">
      {/* HEADER : Titre + Catégorie */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${categoryTheme.bgClass} ${categoryTheme.colorClass} border ${categoryTheme.borderClass}`}
          >
            <CategoryIcon className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none text-foreground">
              Exportation de données
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {getDocumentCategoryLabel(
                documentSelected?.category as DocumentCategory,
              ) ?? "Sélectionnez un document"}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL : Détails du document ou État vide */}
      <AnimatePresence mode="wait">
        {documentSelected ? (
          <motion.div
            key={documentSelected.id ?? selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-border space-y-2.5"
          >
            {/* Titre & Description */}
            <div>
              <h3 className="text-xs font-medium text-foreground">
                {documentSelected.title}
              </h3>
              <p className="text-xs text-muted-foreground  mt-0.5">
                {documentSelected.description}
              </p>
            </div>

            {/* Formats / Extensions disponibles */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80 mr-1">
                Formats :
              </span>
              {documentSelected.extensions?.flatMap((extGroup) =>
                extGroup.extensions.map((ext) => {
                  const cleanExt = ext.replace(".", "").toLowerCase();
                  const config = EXTENSION_CONFIG[cleanExt] ?? {
                    label: cleanExt.toUpperCase(),
                    color: "text-foreground",
                    bg: "bg-muted",
                    icon: FileQuestion,
                  };
                  const ExtIcon = config.icon;

                  return (
                    <span
                      key={`${extGroup.name}-${ext}`}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border border-border/50",
                        config.bg,
                        config.color,
                      )}
                    >
                      <ExtIcon className="size-3" />
                      {config.label}
                    </span>
                  );
                }),
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 pt-3 border-t border-border text-center py-2"
          >
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              Sélectionnez un type de document pour lancer l'exportation
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
