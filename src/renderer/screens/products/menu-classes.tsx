import { TMenu } from "@renderer/components/button-actions"
import { Download, CheckCircle, Printer, Edit, Trash2 } from "lucide-react"

type TGetClassMenuParams = {
  onEdit(): void
  onDebarquer(): void
  onDelete(): void
}

export function getClassMenu({ onDebarquer, onDelete, onEdit }: TGetClassMenuParams): TMenu[] {
  return [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      type: "submenu",
      info: "Modifier",
      action: onEdit,
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      type: "submenu",
      info: "Debarquer",
      action: onDebarquer,
    },

    {
      icon: <CheckCircle className="h-4 w-4" />,
      type: "submenu",
      info: "Supprimer",
      inSeparator: true,
      action: onDelete,
    },
  ]
}

type TGetClassesToolbarMenu = {
  onDownload(): void
  onEdit(): void
  onPrintPrevision(): void
  onPrintCalendar(): void
  onDelete(): void
}

export function getClassesToolbarMenu({
  onDownload,
  onEdit,
  onPrintPrevision,
  onPrintCalendar,
  onDelete,
}: TGetClassesToolbarMenu): TMenu[] {
  return [
    {
      icon: <Download className="h-4 w-4" />,
      type: "button",
      info: "Telecharger le calendrier",
      action: onDownload,
    },
    {
      icon: <Edit className="h-4 w-4" />,
      type: "submenu",
      info: "Modifier",
      action: onEdit,
    },
    {
      icon: <Printer className="h-4 w-4" />,
      type: "submenu",
      info: "Imprimer les previsions",
      action: onPrintPrevision,
    },
    {
      icon: <Printer className="h-4 w-4" />,
      type: "submenu",
      info: "Imprimer le calendrier",
      action: onPrintCalendar,
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      type: "submenu",
      inSeparator: true,
      info: "Supprimer",
      action: onDelete,
    },
  ]
}
