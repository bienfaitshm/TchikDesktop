import { InvoiceContainer } from "./base";

export const EnrollmentInvoice = () => {
  return (
    <div>
      <InvoiceContainer title="Recu d'inscription">
        <div className="text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-zinc-400">NOM :</span>
            <span className="font-bold text-right truncate max-w-40">
              "ticketPreview.studentName"
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-zinc-400">CODE :</span>
            <span className="text-right">selectedStudent?.studentCode</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-zinc-400">CLASSE :</span>
            <span className="text-right">
              selectedStudent?.classroom?.shortIdentifier
            </span>
          </div>
        </div>
      </InvoiceContainer>
    </div>
  );
};
