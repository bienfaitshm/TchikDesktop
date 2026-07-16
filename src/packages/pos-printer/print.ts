import escpos from "escpos";
import Network from "escpos-network";

// Injection du module réseau dans escpos
escpos.Network = Network;

// =========================================================================
// 1. INTERFACES
// =========================================================================

export interface FeeItem {
  label: string;
  installment: string;
  amount: number;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  studentName: string;
  className: string;
  fees: FeeItem[];
  totalPaid: number;
  balance: number;
  verifyUrl: string;
}

export interface PrinterConfig {
  ip: string;
  port: number;
  encoding?: string;
}

// =========================================================================
// 2. SERVICE D'IMPRESSION (Orienté Objet)
// =========================================================================

export class ReceiptPrinterService {
  private device: escpos.Network;
  private printer: escpos.Printer;
  private encoding: string;

  constructor(config: PrinterConfig) {
    this.device = new escpos.Network(config.ip, config.port);
    this.encoding = config.encoding || "CP850";
    this.printer = new escpos.Printer(this.device, { encoding: this.encoding });
  }

  /**
   * Ouvre la connexion réseau
   */
  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.device.open((error?: Error | null) => {
        if (error) {
          reject(
            new Error(
              `Impossible de se connecter à l'imprimante: ${error.message}`,
            ),
          );
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * [NOUVEAU] Envoie directement des octets bruts (Buffer) à l'imprimante
   * sans passer par les méthodes capricieuses de la librairie.
   */
  private sendRawCommand(buffer: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.device.write(buffer, (err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Génère un QR Code via des commandes matérielles pures
   */
  private async printHardwareQRAndClose(url: string): Promise<void> {
    try {
      const bufferStore = Buffer.from(url, "ascii");
      const length = bufferStore.length + 3;
      const pL = length % 256;
      const pH = Math.floor(length / 256);

      // Centrer avant d'injecter le QR Code
      this.printer.align("ct");

      //   // Concaténation de toutes les commandes matérielles du QR Code
      //   const qrCommands = Buffer.concat([
      //     Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]),
      //     Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x06]),
      //     Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31]),
      //     Buffer.from([0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30]),
      //     bufferStore,
      //     Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]),
      //   ]);

      //   // Envoi du Buffer direct au socket réseau
      //   await this.sendRawCommand(qrCommands);

      // Finalisation et coupe
      this.printer.text("\n").cut();

      // Sécurité réseau : pause de 500ms avant de couper la socket TCP
      setTimeout(() => {
        this.device.close();
      }, 500);
    } catch (err: any) {
      this.device.close();
      throw new Error(`Échec de l'impression du QR Code brut: ${err.message}`);
    }
  }

  /**
   * Imprime le reçu de paiement avec des données dynamiques.
   */
  public async printReceipt(data: ReceiptData): Promise<void> {
    console.info("[PrinterService] Tentative de connexion à l'imprimante...");

    try {
      await this.connect();
      console.info(
        "[PrinterService] Connexion réussie. Début de l'impression...",
      );

      // --- INITIALISATION MATÉRIELLE POUR LES ACCENTS ---
      this.printer.hardware("init"); // Réinitialise l'imprimante

      // Envoi sécurisé des commandes d'encodage via sendRawCommand
      await this.sendRawCommand(Buffer.from([0x1b, 0x52, 0x08])); // ESC R 8 (France)
      await this.sendRawCommand(Buffer.from([0x1b, 0x74, 0x02])); // ESC t 2 (CP850)

      this.printer
        // --- En-tête de l'école ---
        .font("a")
        .align("ct")
        .style("b")
        .size(1, 1)
        .text("COMPLEXE SCOLAIRE LA SAGESSE")
        .size(0, 0)
        .style("normal")
        .text("123, Avenue de l'Education, Kinshasa")
        .text("Tél: +243 81 000 0000")
        .text("--------------------------------")

        // --- Titre du reçu ---
        .style("bu")
        .text("RECU DE PAIEMENT - FRAIS SCOLAIRES")
        .style("normal")
        .text("--------------------------------")

        // --- Infos Élève & Facture ---
        .align("lt")
        .text(`Reçu N° : ${data.receiptNumber}`)
        .text(`Date    : ${data.date}`)
        .text(`Élève   : ${data.studentName}`)
        .text(`Classe  : ${data.className}`)
        .text("--------------------------------")

        // --- Tableau des Frais ---
        .tableCustom(
          [
            { text: "Libellé", align: "LEFT", width: 0.5, style: "B" },
            { text: "Tranche", align: "CENTER", width: 0.2, style: "B" },
            { text: "Montant", align: "RIGHT", width: 0.3, style: "B" },
          ],
          { encoding: this.encoding },
        )
        .text("- - - - - - - - - - - - - - - -");

      // --- Remplissage dynamique ---
      data.fees.forEach((fee) => {
        this.printer.tableCustom(
          [
            { text: fee.label, align: "LEFT", width: 0.5 },
            { text: fee.installment, align: "CENTER", width: 0.2 },
            {
              text: `${fee.amount.toFixed(2)} USD`,
              align: "RIGHT",
              width: 0.3,
            },
          ],
          { encoding: this.encoding },
        );
      });

      this.printer
        .text("--------------------------------")

        // --- Totaux ---
        .style("b")
        .tableCustom(
          [
            { text: "TOTAL PAYE :", align: "LEFT", width: 0.6, style: "B" },
            {
              text: `${data.totalPaid.toFixed(2)} USD`,
              align: "RIGHT",
              width: 0.4,
              style: "B",
            },
          ],
          { encoding: this.encoding },
        )
        .style("normal")
        .text(`Reste à payer : ${data.balance.toFixed(2)} USD (Solde)`)
        .text("--------------------------------")

        // --- Pied de page ---
        .align("ct")
        .text("Merci pour votre confiance !")
        .text("L'éducation est la clé de l'avenir.")
        .text("--------------------------------");

      // --- Validation & Clôture (QR CODE BRUT) ---
      await this.printHardwareQRAndClose(data.verifyUrl);
      console.info("[PrinterService] Impression terminée avec succès !");
    } catch (error) {
      console.error("[PrinterService] Échec critique de l'impression :", error);
      throw error;
    }
  }
}
