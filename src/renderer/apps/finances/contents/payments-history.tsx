"use client";

import { useGetStudentPayments } from "@/renderer/libs/queries/finances";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { PaymentTable } from "@/renderer/apps/finances/tables/payement-history";
import { HistoryIcon, RefreshCwIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_PAYMENTS_LIMIT = 50;

/**
 * Interface defining the properties for the EmptyHistory component.
 */
interface EmptyHistoryProps {
  /** Callback triggered when the refresh button is clicked. */
  onRefresh?: () => void;
}

/**
 * Displays the payment history table for the current school and academic year.
 * Handles loading, empty, and data-loaded states automatically.
 * @returns The rendered React element corresponding to the current state.
 */
export const PaymentHistoryContent = () => {
  const { schoolId, yearId } = useCurrentConfig();
  const {
    data: payments,
    isLoading,
    refetch,
  } = useGetStudentPayments({
    where: {
      studentPayments: {
        schoolId: { $eq: schoolId },
        yearId: { $eq: yearId },
      },
    },
    limit: DEFAULT_PAYMENTS_LIMIT,
  });

  if (isLoading) {
    return <PaymentHistorySkeleton />;
  }

  if (!payments || payments.length === 0) {
    return <EmptyHistory onRefresh={refetch} />;
  }

  return <PaymentTable payments={payments} />;
};

/**
 * Placeholder component displayed when no payment history records are found.
 * @param props - Component properties.
 * @param props.onRefresh - Optional function to refetch history data.
 * @returns The empty state view with localized text.
 */
export function EmptyHistory({ onRefresh }: EmptyHistoryProps) {
  return (
    <Empty className="my-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HistoryIcon />
        </EmptyMedia>
        <EmptyTitle>Aucun historique de paiement</EmptyTitle>
        <EmptyDescription>
          Aucune transaction n'a été enregistrée pour cette année scolaire. Les
          nouveaux paiements apparaîtront automatiquement ici.
        </EmptyDescription>
      </EmptyHeader>
      {onRefresh && (
        <EmptyContent className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCwIcon data-icon="inline-start" />
            Actualiser
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

/**
 * Skeleton loader component matching the visual layout of the payment table.
 * @returns Skeleton representation during data fetching.
 */
export function PaymentHistorySkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
