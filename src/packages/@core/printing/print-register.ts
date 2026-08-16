import type {
  ActionResult,
  PrinterService,
  PrinterThermal,
} from "@/packages/pos-printer";
import type { PrintInvoicePayload } from "@/packages/@core/data-access/schema-validations";
import {
  instantiateClasses,
  type ClassConstructor,
} from "@/packages/handler-factory";
import type {
  SchoolInfoService,
  SchoolInfo,
} from "@/packages/@core/data-access/db/queries";
import { TchikAppStore } from "@/packages/@core/data-access/stores";

export type Payload<TData> = TData & { schoolInfo: SchoolInfo };

/**
 * Strategy contract for specific invoice print job implementations.
 * @template TData - Type of entity data payload resolved for the print job.
 */
export interface IPrintInvoiceJob<TData = unknown> {
  /** Unique identifier corresponding to the invoice type. */
  invoiceCode: string;

  /**
   * Resolves the required entity payload data for printing.
   * @param id - Entity identifier to resolve.
   * @returns Resolved payload data for the print operation.
   */
  resolveData(id: string): TData;

  /**
   * Executes the thermal print job with resolved data and injected school info.
   * @param printer - Thermal printer instance.
   * @param invoiceRef - Unique invoice reference number.
   * @param payload - Complete payload combining entity data and school information.
   * @returns Result status of the print operation.
   */
  job(
    printer: PrinterThermal,
    invoiceRef: string,
    payload: Payload<TData>,
  ): Promise<ActionResult>;
}

/**
 * Service orchestrating invoice printing operations and job dispatching.
 */
export class PrintInvoiceService {
  private readonly jobRegistry: Map<string, IPrintInvoiceJob>;
  private readonly schoolInfoService: SchoolInfoService;

  /**
   * Initializes the service by instantiating and registering provided job classes.
   * @param invoiceJobs - Array of job class constructors to register.
   * @param schoolInfoService - Service instance resolving school metadata.
   */
  constructor(
    invoiceJobs: ClassConstructor<IPrintInvoiceJob>[],
    schoolInfoService: SchoolInfoService,
  ) {
    const jobs = instantiateClasses(invoiceJobs);
    this.jobRegistry = new Map(jobs.map((job) => [job.invoiceCode, job]));
    this.schoolInfoService = schoolInfoService;
  }

  /**
   * Validates setup, resolves the matching job strategy, and executes invoice printing.
   * @param payload - Print invoice request payload.
   * @param printerService - Service executing receipt rendering on hardware.
   * @param appStore - Application store holding current configuration state.
   * @returns Promise resolving when print job process completes.
   */
  public async printInvoice(
    payload: PrintInvoicePayload,
    printerService: PrinterService,
    appStore: TchikAppStore,
  ): Promise<void> {
    const { posPrint, currentSchool, currentStudyYear } =
      appStore.getCurrentConfig();

    if (!currentSchool || !currentStudyYear) {
      throw new Error("School configuration is missing!");
    }

    if (!posPrint?.posPrinter) {
      throw new Error("POS printer is not configured!");
    }

    const job = this.jobRegistry.get(payload.invoiceCode);
    if (!job) {
      throw new Error(
        `No print job found for invoice code "${payload.invoiceCode}"!`,
      );
    }

    const dataPayload = job.resolveData(payload.id);
    if (!dataPayload) {
      throw new Error("Payment data not found!");
    }

    const schoolInfo = this.schoolInfoService.getSchoolInfo(
      currentSchool.schoolId,
      currentStudyYear.yearId,
    );

    try {
      await printerService.printReceipt(
        posPrint.posPrinter.value,
        async (printer) => {
          const printJobResult = await job.job(printer, payload.invoiceRef, {
            ...dataPayload,
            schoolInfo,
          });
          return Boolean(printJobResult?.success);
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Print failed: ${error.message}`);
      }
      throw new Error("An unexpected error occurred during printing.");
    }
  }
}
