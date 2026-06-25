import { Notification } from "electron";
import { getResourcePath } from "./path";

const DEFAULT_ICON = getResourcePath("icon.png");
type Urgency = "normal" | "critical" | "low";

interface NotifyOptions {
  title: string;
  body?: string;
  icon?: string;
  urgency?: Urgency;
}

/**
 * Affiche une notification système native.
 *
 * @param options - Configuration de la notification.
 * @param options.title - Titre obligatoire (chaîne non vide).
 * @param options.body - Texte complémentaire (facultatif).
 * @param options.icon - Chemin vers l'icône (utilise `DEFAULT_ICON` par défaut).
 * @param options.urgency - Niveau d'urgence (normal, critical, low).
 * @returns `true` si la notification a été affichée avec succès.
 *
 * @example
 * // Notification simple
 * notify({ title: "Téléchargement terminé" });
 *
 * @example
 * // Avec toutes les options
 * notify({
 *   title: "Alerte critique",
 *   body: "Espace disque faible",
 *   urgency: "critical",
 *   icon: "/chemin/vers/alerte.png"
 * });
 */
export function notify(options: NotifyOptions): boolean {
  if (
    !options ||
    typeof options.title !== "string" ||
    options.title.trim() === ""
  ) {
    console.error("Notification : un titre non vide est requis.");
    return false;
  }

  if (!Notification.isSupported()) {
    console.warn(
      "Les notifications ne sont pas supportées dans cet environnement.",
    );
    return false;
  }

  const { title, body = "", icon = DEFAULT_ICON, urgency = "normal" } = options;

  try {
    const notification = new Notification({
      title,
      body,
      icon,
      urgency,
    });

    notification.show();
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Échec de l'affichage de la notification : ${message}`);
    return false;
  }
}
