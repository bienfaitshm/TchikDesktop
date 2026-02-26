import { dialog } from "electron";
import { writeFile } from "fs/promises";

export interface SaveFileOptions {
  title?: string;
  defaultPath?: string;
  filters?: Electron.FileFilter[];
}

/**
 * Affiche une boîte de dialogue pour enregistrer un fichier et écrit les données.
 * @param data Les données à écrire dans le fichier.
 * @param options Les options de la boîte de dialogue d'enregistrement, incluant titre, chemin par défaut et filtres.
 * @returns Le chemin du fichier sauvegardé ou `null` si l'opération est annulée ou échoue.
 */
export async function saveFileWithDialog(
  data: string | NodeJS.ArrayBufferView,
  options: SaveFileOptions = {}
): Promise<string | null> {
  const { title = "Enregistrer le fichier", defaultPath, filters } = options;

  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title,
      defaultPath,
      filters,
    });

    if (canceled || !filePath) {
      console.log("Opération d'enregistrement annulée.");
      return null;
    }

    await writeFile(filePath, data);
    console.log(`Fichier sauvegardé avec succès à : ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du fichier:", error);
    return null;
  }
}
