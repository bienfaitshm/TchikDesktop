import { exec } from "node:child_process";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

export function getPrinters() {
  const platform = os.platform();
  let command = "";

  if (platform === "win32") {
    // Select-Object au lieu de Select-Name
    command =
      'powershell -Command "Get-CimInstance -ClassName Win32_Printer | Select-Object Name, PrinterStatus, WorkOffline"';
  } else if (platform === "darwin" || platform === "linux") {
    command = "lpstat -p -d";
  } else {
    console.error("Système d'exploitation non supporté");
    return;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur d'exécution : ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Erreur : ${stderr}`);
      return;
    }

    console.log("--- Statut des Imprimantes ---");
    console.log(parsePrinterOutput(stdout));
  });

  const monTexte = `--------------------------------
       TICKET DE TEST NODE.JS
--------------------------------
Date : ${new Date().toLocaleString()}
Imprimante : CX-588-POS

- Article 1 : 10.00 EUR
- Article 2 :  5.50 EUR
--------------------------------
TOTAL       : 15.50 EUR
--------------------------------
Merci de votre visite !
\n\n\n`; // Les \n supplémentaires permettent de faire avancer le papier sur ticket de caisse

  printText("CX-588-POS", monTexte);
}

function parsePrinterOutput(rawText) {
  if (!rawText) return [];

  const lines = rawText.trim().split(/\r?\n/);
  const printers: any[] = [];

  // Capture : (Nom de l'imprimante) (Statut numérique) (True/False)
  const lineRegex = /^\s*(.*?)\s+(\d+)\s+(True|False)\s*$/i;

  for (const line of lines) {
    // Ignore les en-têtes "Name ..." et "---- ..."
    if (line.startsWith("Name") || line.startsWith("----")) continue;

    const match = line.match(lineRegex);
    if (match) {
      printers.push({
        name: match[1].trim(),
        printerStatus: parseInt(match[2], 10),
        workOffline: match[3].toLowerCase() === "true",
      });
    }
  }

  return printers;
}

/**
 * Lance l'impression d'une page de test sur l'imprimante spécifiée.
 * @param {string} printerName - Nom exact de l'imprimante.
 */
function printTestPage(printerName) {
  const platform = os.platform();

  if (platform === "win32") {
    // rundll32 utilise le fichier printui.dll natif de Windows (/k = imprimer page de test, /n = nom)
    const command = `rundll32 printui.dll,PrintUIEntry /k /n "${printerName}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur : ${error.message}`);
        return;
      }
      console.log(`Page de test envoyée à "${printerName}"`);
    });
  } else {
    // Linux / macOS (CUPS)
    const command = `echo "Test d'impression" | lpr -P "${printerName}"`;
    exec(command, (error) => {
      if (error) console.error(`Erreur : ${error.message}`);
      else console.log(`Page de test envoyée à "${printerName}"`);
    });
  }
}

/**
 * Imprime du texte sur une imprimante spécifique.
 * @param {string} printerName - Nom exact de l'imprimante.
 * @param {string} text - Contenu à imprimer.
 */
function printText(printerName, text) {
  const platform = os.platform();

  if (platform === "win32") {
    const tempFile = path.join(os.tmpdir(), `print_${Date.now()}.txt`);

    // Le caractère \uFEFF (BOM UTF-8) force Notepad à lire correctement les accents
    fs.writeFileSync(tempFile, "\uFEFF" + text, "utf8");

    // Commande qui lance l'impression via Notepad silencieusement vers l'imprimante ciblée
    const command = `notepad /pt "${tempFile}" "${printerName}"`;

    exec(command, (error) => {
      // Suppression du fichier temporaire après un court délai
      setTimeout(() => fs.unlink(tempFile, () => {}), 2000);

      if (error) {
        console.error("Erreur d'impression :", error.message);
        return;
      }
      console.log(`Impression envoyée avec succès à "${printerName}" !`);
    });
  } else {
    // Linux / macOS (CUPS)
    const command = `echo "${text.replace(/"/g, '\\"')}" | lpr -P "${printerName}"`;
    exec(command, (error) => {
      if (error) console.error("Erreur :", error.message);
      else console.log(`Impression envoyée avec succès à "${printerName}" !`);
    });
  }
}
