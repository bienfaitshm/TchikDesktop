import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useGetPreviewOfUserQuery } from "@/renderer/libs/queries/application";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface StudentUser {
  userId: string;
  lastName: string;
  middleName?: string | null;
  firstName?: string | null;
  username: string;
  gender: string;
  role: string;
  birthDate: string;
  birthPlace: string;
}

export interface Classroom {
  classId: string;
  identifier: string;
  shortIdentifier: string;
  section: string;
}

export interface AcademicYear {
  yearId: string;
  yearName: string;
  startDate: string;
  endDate: string;
}

export interface SeatingAssignment {
  assignmentId: string;
  rowPosition: number;
  columnPosition: number;
  localroom: { name: string };
  session: { sessionName: string };
}

/** Structure inférée des frais — adapte selon ton API réelle */
export interface FeeAssignment {
  feeId: string;
  label: string;
  category?: string;
  amountDue: number;
  amountPaid: number;
  currency?: string;
  dueDate?: string;
  status?: "PAID" | "PARTIAL" | "UNPAID" | "OVERDUE";
}

export interface Tutor {
  tutorId: string;
  profession: string;
  address: string;
  phoneNumber: string;
  enrollments?: Array<{
    enrollmentId: string;
    studentId?: string;
    student: StudentUser;
    classroom: Classroom;
  }>;
}

export interface StudentEnrollment {
  enrollmentId: string;
  status: string;
  isNewStudent: boolean;
  isProDeo: boolean;
  studentCode: string;
  studentId?: string;
  classroom: Classroom;
  year?: AcademicYear;
  tutor?: Tutor;
  seatingAssignments?: SeatingAssignment[];
  student?: StudentUser;
  feeAssignments?: FeeAssignment[];
}

export interface StudentPreviewData {
  subTitle: string;
  currentEnrollment: StudentEnrollment;
  enrollments: StudentEnrollment[];
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function formatFullName(person?: {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
}): string {
  if (!person) return "";
  return [person.lastName, person.middleName, person.firstName]
    .filter((n): n is string => Boolean(n && n.trim().length > 0))
    .join(" ");
}

function getInitials(person?: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const f = person?.firstName?.trim()?.[0] ?? "";
  const l = person?.lastName?.trim()?.[0] ?? "";
  return `${f}${l}`.toUpperCase() || "?";
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("fr-FR")} ${currency}`;
  }
}

function sectionLabel(section?: string): string {
  switch (section) {
    case "SECONDARY":
      return "Secondaire";
    case "KINDERGARTEN":
      return "Maternelle";
    case "PRIMARY":
      return "Primaire";
    default:
      return section ?? "—";
  }
}

function getFeeStatus(
  fee: FeeAssignment,
): NonNullable<FeeAssignment["status"]> {
  if (fee.status) return fee.status;
  if (fee.amountPaid >= fee.amountDue) return "PAID";
  if (fee.amountPaid > 0) return "PARTIAL";
  if (fee.dueDate && new Date(fee.dueDate) < new Date()) return "OVERDUE";
  return "UNPAID";
}

/* -------------------------------------------------------------------------- */
/*                              UI Sub-components                             */
/* -------------------------------------------------------------------------- */

const Badge: React.FC<{
  children: React.ReactNode;
  tone?: "green" | "amber" | "purple" | "gray" | "red" | "blue";
}> = ({ children, tone = "gray" }) => {
  const tones: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const InfoTile: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
      {label}
    </div>
    <div className="text-sm font-medium text-gray-900 mt-0.5 truncate">
      {value || "—"}
    </div>
  </div>
);

const Section: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <section>
    <header className="flex items-center gap-2 mb-3">
      {icon && (
        <span className="text-gray-400 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      )}
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex-1 h-px bg-gray-100" />
    </header>
    {children}
  </section>
);

/* Icons inline */
const Icon = {
  Graduation: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  Seat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 19v-3m12 3v-3M6 16V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10M4 16h16" />
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Wallet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2Z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/*                                 Tabs Bar                                   */
/* -------------------------------------------------------------------------- */

type TabKey = "overview" | "fees" | "history";

const TabsBar: React.FC<{
  active: TabKey;
  onChange: (k: TabKey) => void;
  feesBadge?: number;
  historyCount?: number;
}> = ({ active, onChange, feesBadge, historyCount }) => {
  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeTone?: "red" | "gray";
  }> = [
    { key: "overview", label: "Aperçu", icon: <Icon.Graduation /> },
    {
      key: "fees",
      label: "Frais",
      icon: <Icon.Wallet />,
      badge: feesBadge,
      badgeTone: "red",
    },
    {
      key: "history",
      label: "Historique",
      icon: <Icon.History />,
      badge: historyCount,
      badgeTone: "gray",
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex px-2" role="tablist">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap [&>svg]:w-4 [&>svg]:h-4 ${
                isActive ? "text-blue-700" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className={isActive ? "text-blue-600" : "text-gray-400"}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                    tab.badgeTone === "red"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Fees Panel                                  */
/* -------------------------------------------------------------------------- */

const FeeStatusBadge: React.FC<{
  status: NonNullable<FeeAssignment["status"]>;
}> = ({ status }) => {
  switch (status) {
    case "PAID":
      return (
        <Badge tone="green">
          <Icon.Check /> Payé
        </Badge>
      );
    case "PARTIAL":
      return <Badge tone="amber">Partiel</Badge>;
    case "OVERDUE":
      return (
        <Badge tone="red">
          <Icon.Alert /> En retard
        </Badge>
      );
    default:
      return <Badge tone="gray">Impayé</Badge>;
  }
};

const FeeRow: React.FC<{ fee: FeeAssignment }> = ({ fee }) => {
  const status = getFeeStatus(fee);
  const currency = fee.currency || "USD";
  const progress =
    fee.amountDue > 0
      ? Math.min(100, Math.round((fee.amountPaid / fee.amountDue) * 100))
      : 0;

  const barColor =
    status === "PAID"
      ? "bg-emerald-500"
      : status === "OVERDUE"
        ? "bg-red-500"
        : status === "PARTIAL"
          ? "bg-amber-500"
          : "bg-gray-300";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {fee.label}
            </span>
            {fee.category && (
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                {fee.category}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Échéance : {formatDate(fee.dueDate)}
          </div>
        </div>
        <FeeStatusBadge status={status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Dû
          </div>
          <div className="text-sm font-semibold text-gray-800 mt-0.5">
            {formatMoney(fee.amountDue, currency)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Payé
          </div>
          <div className="text-sm font-semibold text-emerald-700 mt-0.5">
            {formatMoney(fee.amountPaid, currency)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Solde
          </div>
          <div
            className={`text-sm font-semibold mt-0.5 ${
              fee.amountDue - fee.amountPaid > 0
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {formatMoney(fee.amountDue - fee.amountPaid, currency)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] text-gray-400 font-medium">
            {progress}% réglé
          </span>
          {progress < 100 && (
            <span className="text-[10px] text-gray-400 font-medium">
              Reste {formatMoney(fee.amountDue - fee.amountPaid, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const FeesPanel: React.FC<{ fees: FeeAssignment[] }> = ({ fees }) => {
  const stats = useMemo(() => {
    const totalDue = fees.reduce((s, f) => s + (f.amountDue || 0), 0);
    const totalPaid = fees.reduce((s, f) => s + (f.amountPaid || 0), 0);
    const unpaidCount = fees.filter((f) => getFeeStatus(f) !== "PAID").length;
    const overdueCount = fees.filter(
      (f) => getFeeStatus(f) === "OVERDUE",
    ).length;
    return {
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
      unpaidCount,
      overdueCount,
    };
  }, [fees]);

  /* Empty state */
  if (fees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-6">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3 [&>svg]:w-7 [&>svg]:h-7">
          <Icon.Receipt />
        </div>
        <p className="text-sm font-semibold text-gray-700">
          Aucun frais assigné
        </p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Aucun frais scolaire n'a encore été enregistré pour cette inscription.
        </p>
      </div>
    );
  }

  const currency = fees[0]?.currency || "USD";
  const globalProgress =
    stats.totalDue > 0
      ? Math.round((stats.totalPaid / stats.totalDue) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            Total dû
          </div>
          <div className="text-base font-bold text-gray-900 mt-0.5 truncate">
            {formatMoney(stats.totalDue, currency)}
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-medium">
            Payé
          </div>
          <div className="text-base font-bold text-emerald-800 mt-0.5 truncate">
            {formatMoney(stats.totalPaid, currency)}
          </div>
        </div>
        <div
          className={`rounded-xl border p-3 ${
            stats.balance > 0
              ? "bg-red-50 border-red-100"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <div
            className={`text-[10px] uppercase tracking-wider font-medium ${
              stats.balance > 0 ? "text-red-700" : "text-gray-500"
            }`}
          >
            Solde
          </div>
          <div
            className={`text-base font-bold mt-0.5 truncate ${
              stats.balance > 0 ? "text-red-700" : "text-gray-700"
            }`}
          >
            {formatMoney(stats.balance, currency)}
          </div>
        </div>
      </div>

      {/* Global progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-gray-600">
            Progression globale
          </span>
          <span className="text-[11px] font-bold text-gray-700">
            {globalProgress}%
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        {stats.overdueCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-600 font-medium">
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">
              <Icon.Alert />
            </span>
            {stats.overdueCount} frais en retard de paiement
          </div>
        )}
      </div>

      {/* Liste des frais */}
      <div className="space-y-3">
        {fees.map((fee) => (
          <FeeRow key={fee.feeId} fee={fee} />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Overview Panel                                */
/* -------------------------------------------------------------------------- */

const OverviewPanel: React.FC<{ data: StudentPreviewData }> = ({ data }) => {
  const { currentEnrollment } = data;
  const seating = currentEnrollment.seatingAssignments?.[0];
  const tutor = currentEnrollment.tutor;

  const otherChildren =
    tutor?.enrollments?.filter(
      (e) =>
        e.enrollmentId !== currentEnrollment.enrollmentId &&
        e.studentId !== currentEnrollment.studentId,
    ) ?? [];

  return (
    <div className="space-y-6">
      {/* Classe */}
      <Section title="Classe actuelle" icon={<Icon.Graduation />}>
        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            label="Classe"
            value={currentEnrollment.classroom.identifier}
          />
          <InfoTile
            label="Code"
            value={currentEnrollment.classroom.shortIdentifier}
          />
          {currentEnrollment.year && (
            <>
              <InfoTile
                label="Année scolaire"
                value={currentEnrollment.year.yearName.trim()}
              />
              <InfoTile
                label="Période"
                value={`${formatDate(currentEnrollment.year.startDate)} → ${formatDate(currentEnrollment.year.endDate)}`}
              />
            </>
          )}
        </div>
      </Section>

      {/* Examen */}
      {seating && (
        <Section title="Placement d'examen" icon={<Icon.Seat />}>
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="text-sm font-semibold text-blue-900">
              {seating.session.sessionName}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-blue-700 font-medium">
                  Local
                </div>
                <div className="text-sm font-bold text-blue-900 mt-0.5">
                  {seating.localroom.name}
                </div>
              </div>
              <div className="text-center border-x border-blue-200">
                <div className="text-[10px] uppercase tracking-wider text-blue-700 font-medium">
                  Rangée
                </div>
                <div className="text-sm font-bold text-blue-900 mt-0.5">
                  {seating.rowPosition}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-blue-700 font-medium">
                  Colonne
                </div>
                <div className="text-sm font-bold text-blue-900 mt-0.5">
                  {seating.columnPosition}
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Tuteur */}
      {tutor && (
        <Section title="Tuteur responsable" icon={<Icon.User />}>
          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0">
                {tutor.profession?.trim()?.[0]?.toUpperCase() ?? "T"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {tutor.profession || "Tuteur"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {tutor.address}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <span className="text-gray-400 [&>svg]:w-3.5 [&>svg]:h-3.5">
                  <Icon.Phone />
                </span>
                <span className="font-medium">{tutor.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <span className="text-gray-400">📍</span>
                <span className="truncate">{tutor.address}</span>
              </div>
            </div>

            {otherChildren.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Autres enfants à charge
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                    {otherChildren.length}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {otherChildren.map((item) => (
                    <li
                      key={item.enrollmentId}
                      className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium text-gray-800 truncate">
                        {formatFullName(item.student) || "—"}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-600 bg-white border border-gray-200 rounded px-2 py-0.5 whitespace-nowrap">
                        {item.classroom.shortIdentifier}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             History Panel                                  */
/* -------------------------------------------------------------------------- */

const HistoryPanel: React.FC<{ enrollments: StudentEnrollment[] }> = ({
  enrollments,
}) => {
  if (!enrollments.length) {
    return (
      <div className="text-center py-10 text-xs text-gray-400">
        Aucun historique disponible.
      </div>
    );
  }

  return (
    <div className="relative pl-5 space-y-4">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
      {enrollments.map((history, idx) => (
        <div
          key={history.enrollmentId}
          className="relative flex items-start gap-3"
        >
          <span
            className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
              idx === 0 ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
          <div className="flex-1 min-w-0 pl-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-800 truncate">
                {history.classroom.identifier}
              </span>
              {idx === 0 && <Badge tone="blue">Actuel</Badge>}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {history.year?.yearName.trim() || "Année inconnue"}
            </div>
          </div>
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 rounded px-2 py-0.5 whitespace-nowrap">
            {history.classroom.shortIdentifier}
          </span>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            Main Preview Component                          */
/* -------------------------------------------------------------------------- */

export const StudentPreviewCard: React.FC<{ data: StudentPreviewData }> = ({
  data,
}) => {
  const { currentEnrollment, enrollments, subTitle } = data;
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const student = currentEnrollment.student;
  const fullName = formatFullName(student);
  const displayName = fullName || subTitle.split("•")[0].trim();
  const isActive = currentEnrollment.status === "ACTIVE";

  const fees = currentEnrollment.feeAssignments ?? [];
  const unpaidCount = fees.filter((f) => getFeeStatus(f) !== "PAID").length;

  return (
    <div className="max-w-2xl w-full rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden font-sans text-gray-800">
      {/* -------------------------------- HEADER ------------------------------- */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-6 py-5 text-white">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-14 h-14 rounded-full bg-white/15 backdrop-blur ring-2 ring-white/30 flex items-center justify-center text-lg font-bold tracking-wide">
            {getInitials(student) || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.12em] text-blue-100 font-semibold">
              Élève • {sectionLabel(currentEnrollment.classroom?.section)}
            </div>
            <h2
              className="text-xl font-semibold leading-tight truncate mt-0.5"
              title={displayName}
            >
              {displayName}
            </h2>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge tone={isActive ? "green" : "gray"}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                />
                {currentEnrollment.status}
              </Badge>
              {currentEnrollment.isNewStudent && (
                <Badge tone="amber">NOUVEAU</Badge>
              )}
              {currentEnrollment.isProDeo && (
                <Badge tone="purple">PRO DEO</Badge>
              )}
              <span className="text-[11px] font-mono text-blue-100/90 bg-white/10 px-2 py-0.5 rounded">
                #{currentEnrollment.studentCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------- TABS -------------------------------- */}
      <TabsBar
        active={activeTab}
        onChange={setActiveTab}
        feesBadge={unpaidCount}
        historyCount={enrollments.length}
      />

      {/* -------------------------------- CONTENT ------------------------------ */}
      <div className="p-6">
        {activeTab === "overview" && <OverviewPanel data={data} />}
        {activeTab === "fees" && <FeesPanel fees={fees} />}
        {activeTab === "history" && <HistoryPanel enrollments={enrollments} />}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             Container / Search                             */
/* -------------------------------------------------------------------------- */

export const ResultSearch: React.FC = () => {
  const { yearId, schoolId } = useCurrentConfig();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("user") ?? "";

  const { data: preview, isLoading } = useGetPreviewOfUserQuery({
    schoolId,
    yearId,
    search: searchQuery,
  });

  if (isLoading) {
    return (
      <div className="p-6 w-full max-w-2xl animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-gray-600 text-sm font-medium">
          Aucun résultat trouvé
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Vérifiez le matricule ou le nom recherché.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center">
      <StudentPreviewCard data={preview as StudentPreviewData} />
    </div>
  );
};
