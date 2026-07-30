import {
  FileSpreadsheet,
  FileText,
  FileCode,
  FileJson,
  Presentation,
  ShieldAlert,
  Wallet,
  GraduationCap,
  Database,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

export type CategoryTheme = {
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
};

/**
 * Thème visuel par catégorie fonctionnelle de documents.
 */
export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  FINANCES: {
    icon: Wallet,
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
  },
  DATA_SCHOOL: {
    icon: GraduationCap,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
  },
  APP_DATA: {
    icon: Database,
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
  },
  OTHER: {
    icon: HelpCircle,
    colorClass: "text-slate-400",
    bgClass: "bg-slate-500/10",
    borderClass: "border-slate-500/20",
  },
};

/**
 * Config des icônes et badges par extension de fichier.
 */
export const EXTENSION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  // Tableurs (Vert)
  xlsx: {
    label: "XLSX",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: FileSpreadsheet,
  },
  xls: {
    label: "XLS",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: FileSpreadsheet,
  },
  ods: {
    label: "ODS",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: FileSpreadsheet,
  },
  csv: {
    label: "CSV",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    icon: FileSpreadsheet,
  },

  // Lecture seule (Rouge/Rose)
  pdf: {
    label: "PDF",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    icon: ShieldAlert,
  },

  // Textes & Docs (Bleu)
  docx: {
    label: "DOCX",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: FileText,
  },
  doc: {
    label: "DOC",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: FileText,
  },
  odt: {
    label: "ODT",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: FileText,
  },
  txt: {
    label: "TXT",
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    icon: FileText,
  },
  md: {
    label: "MD",
    color: "text-indigo-300",
    bg: "bg-indigo-500/10",
    icon: FileText,
  },

  // Données structurées (Jaune/Violet)
  json: {
    label: "JSON",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    icon: FileJson,
  },
  xml: {
    label: "XML",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    icon: FileCode,
  },
  yaml: {
    label: "YAML",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    icon: FileCode,
  },

  // Présentations (Orange)
  pptx: {
    label: "PPTX",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    icon: Presentation,
  },
  ppt: {
    label: "PPT",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    icon: Presentation,
  },
};
