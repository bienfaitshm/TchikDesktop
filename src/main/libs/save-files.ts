import { dialog } from "electron";
import fs from "fs";

export async function dialogSaveDocxFile(
  fileName: string = "document.docx",
  contentToSave: string | NodeJS.ArrayBufferView
) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save your file",
    defaultPath: fileName, // Suggest a default filename
    filters: [
      { name: "Document word", extensions: ["docx"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (!canceled && filePath) {
    try {
      fs.writeFileSync(filePath, contentToSave);
      console.log("File saved successfully to:", filePath);
    } catch (err) {
      console.error("Error saving file:", err);
    }
  } else {
    console.log("File save canceled.");
  }
}
