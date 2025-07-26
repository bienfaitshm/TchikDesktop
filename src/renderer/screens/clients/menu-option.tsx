import { TMenu } from "@renderer/components/button-actions"
import { Download, CheckCircle, Printer, Edit, Trash2 } from "lucide-react"

export function getScolarSessionMenuOptions(): TMenu[] {
  return [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      type: "button",
      info: "Activer l'annee scolaire",
      action(): void {
        console.log("info Telecharger")
      },
    },
    {
      icon: <Download className="h-4 w-4" />,
      type: "button",
      info: "Telecharger le calendrier",
      action(): void {
        console.log("info Telecharger")
      },
    },
    {
      icon: <Edit className="h-4 w-4" />,
      type: "submenu",
      info: "Modifier",
      action(): void {
        console.log("info Telecharger")
      },
    },
    {
      icon: <Printer className="h-4 w-4" />,
      type: "submenu",
      info: "Imprimer les previsions",
      action(): void {
        console.log("info Telecharger")
      },
    },
    {
      icon: <Printer className="h-4 w-4" />,
      type: "submenu",
      info: "Imprimer le calendrier",
      action(): void {
        console.log("info Telecharger")
      },
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      type: "submenu",
      inSeparator: true,
      info: "Supprimer",
      action(): void {
        console.log("info Telecharger")
      },
    },
  ]
}
