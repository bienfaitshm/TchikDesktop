import { lazyNamed } from "@/renderer/utils/react";

export const ClassroomPaymentLayout = lazyNamed(
  () => import("@/renderer/apps/finances/screens/classroom-payments"),
  "ClassroomPaymentPage",
);
export const ClassroomPaymentEmptyPage = lazyNamed(
  () => import("@/renderer/apps/finances/screens/classrooms-payment-empty"),
  "ClassroomPaymentEmptyState",
);
export const ClassroomPaymentDetailPage = lazyNamed(
  () => import("@/renderer/apps/finances/screens/classroom-payments-detail"),
  "ClassroomPaymentDetailPage",
);

// Finances (L'application la plus lourde, désormais segmentée !)
export const SchoolFinanceDashboard = lazyNamed(
  () => import("@/renderer/apps/finances/screens/dashboard"),
  "SchoolFinanceDashboard",
);
export const SchoolWalletPage = lazyNamed(
  () => import("@/renderer/apps/finances/screens/wallet"),
  "SchoolWalletPage",
);
export const SchoolPaymentConfigPage = lazyNamed(
  () => import("@/renderer/apps/finances/screens/payement-config"),
  "SchoolPaymentConfigPage",
);

export const PaymentPage = lazyNamed(
  () => import("@/renderer/apps/finances/screens/payments"),
  "FastPaymentPage",
);
export const PaymentsHistoryPage = lazyNamed(
  () => import("@/renderer/apps/finances/screens/payement-histories"),
  "PaymentsHistoryPage",
);
