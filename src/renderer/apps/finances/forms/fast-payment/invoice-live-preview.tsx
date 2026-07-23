import { memo, useMemo } from "react";
import { Landmark, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  School,
  EnrollmentPayment,
} from "@/packages/@core/data-access/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/packages/currency";
import { formatDate } from "@/packages/times";
import type { EnrollmentOption, ScheduleOption } from "./types";

type InvoiceLivePreviewProps = {
  school?: School;
  selectedStudent?: EnrollmentOption;
  selectedFeeType?: EnrollmentPayment;
  selectedSchedule?: ScheduleOption;
  amountDue: number;
};

export const InvoiceLivePreview = memo<InvoiceLivePreviewProps>(
  ({
    school,
    selectedStudent,
    selectedFeeType,
    selectedSchedule,
    amountDue,
  }) => {
    const currentDateFormatted = useMemo(
      () => new Date().toLocaleDateString("fr-FR"),
      [],
    );
    const currentYearFormatted = useMemo(
      () => formatDate(new Date(), "yyyy"),
      [],
    );

    return (
      <Card className="border-dashed bg-slate-50/50 dark:bg-zinc-900/40 shadow-sm sticky top-6 overflow-hidden">
        <CardHeader className="pb-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 font-mono tracking-tight text-[11px]"
            >
              APERÇU LIVE FACTURE
            </Badge>
            <Landmark className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 font-sans text-xs">
          <div className="text-center flex flex-col gap-1">
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-foreground">
              {school?.name}
            </h3>
            <p className="text-muted-foreground text-[10px]">
              {school?.address}
            </p>
            <div className="text-[10px] font-mono text-muted-foreground pt-1">
              Date: {currentDateFormatted}
            </div>
          </div>

          <Separator className="border-dashed" />

          <div className="flex flex-col gap-2 min-h-15">
            <AnimatePresence mode="popLayout">
              {selectedStudent ? (
                <motion.div
                  key={selectedStudent.enrollmentId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Nom, Postnom et Prénom
                    </span>
                    <span className="font-bold text-right text-foreground">
                      {selectedStudent.student.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Code de l'élève :
                    </span>
                    <span className="font-mono text-right">
                      {selectedStudent.studentCode || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Classe / Option :
                    </span>
                    <span className="font-medium text-right text-foreground">
                      {selectedStudent.classroom?.shortIdentifier || "—"}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-student"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full text-muted-foreground italic text-[11px]"
                >
                  En attente de sélection d'un élève...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator className="border-dashed" />

          <div className="flex flex-col gap-2 min-h-10">
            <AnimatePresence mode="popLayout">
              {selectedFeeType && selectedSchedule && (
                <motion.div
                  key={selectedSchedule.scheduleId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-between items-start"
                >
                  <div>
                    <p className="font-bold text-foreground">
                      {selectedFeeType.label}
                    </p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">
                      Échéance : {selectedSchedule.label}
                    </p>
                  </div>
                  <motion.span
                    key={amountDue}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono font-bold text-sm text-foreground"
                  >
                    {formatCurrency(amountDue)}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator className="border-neutral-300 dark:border-neutral-700 my-2" />

          <div className="flex justify-between items-center bg-white dark:bg-black p-3 rounded-lg border shadow-xs">
            <span className="text-xs font-black uppercase tracking-wider text-foreground">
              Net Payé
            </span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={amountDue}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono font-black text-lg text-primary"
              >
                {formatCurrency(amountDue)}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="text-center text-[10px] text-muted-foreground pt-2 flex flex-col gap-1">
            <p className="font-mono text-[9px]">
              ID Caisse: CAISSE_A_{currentYearFormatted}
            </p>
          </div>

          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="size-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed">
              Ce montant sera imputé immédiatement. Les transactions archivées
              ne sont plus modifiables sans droits d'administration.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="bg-muted/40 p-3 rounded-b-xl flex gap-2" />
      </Card>
    );
  },
);

InvoiceLivePreview.displayName = "InvoiceLivePreview";
