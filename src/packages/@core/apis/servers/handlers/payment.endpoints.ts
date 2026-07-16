import z from "zod";
import { paymentService } from "@/packages/@core/data-access/db/queries";
import {
  HttpMethod,
  IpcRequest,
  ValidationSchemas,
  AbstractEndpoint,
} from "@/packages/electron-ipc-rest";
import { PaymentRoutes } from "../../routes-constant";
import {
  ProcessPaymentPayload,
  ProcessPaymentSchema,
} from "@/packages/@core/data-access/schema-validations";
import { renderTemplate } from "@/packages/document-template";
import { defaultPrinterManagementService } from "@/packages/electron-utility";
import { printReceipt } from "@/packages/pos-printer";

const donneesAInjecter = {
  entreprise: {
    nom: "BOUTIQUE TECH & CO",
    adresse: "45 Rue de la République, Lyon",
    telephone: "04.72.00.11.22",
  },
  numeroFacture: "FAC-2026-0412",
  date: "15/07/2026 11:15",
  caissier: "Marc K.",
  articles: [
    { nom: "Souris Sans Fil RGB", quantite: 1, prixTotal: "25.00" },
    { nom: "Câble USB-C 2m", quantite: 2, prixTotal: "12.00" },
    { nom: "Clé USB 64Go", quantite: 1, prixTotal: "15.00", remise: 10 },
  ],
  totalBrut: "52.00",
  tva: {
    taux: "20",
    montant: "10.40",
  },
  netAPayer: "52.00",
  modePaiement: "CARTE BANCAIRE",
  logicielInfo: "POS Système v2.1 - Sécurisé",
};

const ClassroomFilterSchema = z.object({
  schoolId: z.string().nonempty(),
  yearId: z.string().nonempty(),
  classId: z.string().nonempty(),
});
type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;

const AssignFeesToStudentSchema = z.object({
  schoolId: z.string().nonempty(),
  yearId: z.string().nonempty(),
  enrollmentId: z.string().nonempty(),
  classroomId: z.string().nonempty(),
});
type AssignFeesToStudentPayload = z.infer<typeof AssignFeesToStudentSchema>;

/**
 * Récupérer le tableau matriciel des assignations et des statuts de paiement d'une classe
 */
export class GetClassroomAssignmentTable extends AbstractEndpoint<any> {
  route = PaymentRoutes.CLASSROOM_TABLE;
  method = HttpMethod.GET;
  schemas: ValidationSchemas = {
    params: ClassroomFilterSchema,
  };

  protected handle({
    params,
    context,
  }: IpcRequest<any, ClassroomFilter>): Promise<unknown> {
    return paymentService.getAssignmentTableOfClassroom(
      params,
      ({ message, pourcent }) => {
        context.sender.send(this.route, { message, pourcent });
      },
    );
  }
}

/**
 * Déclencher manuellement ou automatiquement l'assignation de frais initiaux pour un étudiant
 */
export class PostAssignFeesToStudent extends AbstractEndpoint<any> {
  route = PaymentRoutes.ASSIGN_FEES;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: AssignFeesToStudentSchema,
  };

  protected handle({
    body,
  }: IpcRequest<AssignFeesToStudentPayload, any>): Promise<unknown> {
    return paymentService.assignFeesToStudent(body);
  }
}

/**
 * Encaisser un versement étudiant (gère les multi-devises et les écritures comptables au guichet)
 */
export class PostProcessStudentPayment extends AbstractEndpoint<any> {
  route = PaymentRoutes.PROCESS_PAYMENT;
  method = HttpMethod.POST;
  schemas: ValidationSchemas = {
    body: ProcessPaymentSchema,
  };

  protected async handle({
    body,
    context,
  }: IpcRequest<ProcessPaymentPayload, any>): Promise<unknown> {
    const payment = await paymentService.processStudentPayment(body);
    if (payment && context.window) {
      // create facture and print
      // const facture: string = await renderTemplate(
      //   "facture.hbs",
      //   donneesAInjecter,
      // );
      // await defaultPrinterManagementService.printHtmlContent(facture, {
      //   landscape: true,
      //   pageSize: "A6",
      // });
      const printers = await defaultPrinterManagementService.getSystemPrinters(
        context.window,
      );
      console.log("=======>PRINTERS", printers);
      printReceipt();
    }
    return payment;
  }
}
