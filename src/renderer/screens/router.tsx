import { lazy, Suspense, type JSX } from "react";
import { HashRouter as Router, Route, Routes } from "react-router";
import {
  Home,
  LayoutDashboard,
  Building,
  BookOpen,
  Users,
  Settings,
  Wallet,
  Banknote,
  UserPlus,
  LayoutGrid,
  Presentation,
  School,
  CircleDollarSign,
  History,
  Calendar,
  GraduationCap,
  User,
  Settings2,
  Bell,
  LifeBuoy,
  Info,
  Code2,
} from "lucide-react";
import * as Layout from "@/renderer/screens/layouts";
import * as Seating from "@/renderer/apps/seatings";
import { SubNavLayout } from "@/renderer/layouts/submenu.layout";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import { ROUTES, APP_ROUTES } from "@/renderer/constants";
import type {
  NavSection,
  NavItem,
} from "@/renderer/components/app-sidebar/app-sidebar";

import * as FinApp from "@/renderer/apps/finances";
// ==========================================
//  HELPER SENIOR POUR IMPORTS DE TYPE LAZY
// ==========================================
/**
 * Permet de charger à la demande des exports nommés (ex: export { HomePage })
 */
function lazyNamed<T extends Record<string, any>>(
  factory: () => Promise<T>,
  name: keyof T,
) {
  return lazy(() => factory().then((module) => ({ default: module[name] })));
}

// ==========================================
// ⚡ IMPORTS DYNAMIQUES (LAZY LOADING)
// ==========================================

// Base & Layouts
const Launcher = lazy(() => import("@/renderer/screens/launcher"));
const HomePage = lazyNamed(() => import("@/renderer/screens/home"), "HomePage");
const DashBoardPage = lazyNamed(() => import("./dashboard"), "DashBoardPage");
const NotFoundPage = lazyNamed(
  () => import("@/renderer/screens/not-found"),
  "NotFoundPage",
);
const WorkInProgressPage = lazy(
  () => import("@/renderer/components/work-in-progess-page"),
);

// Configuration hors-ligne (Setup initial)
const ConfigurationLayoutScreen = lazy(() =>
  import("@/renderer/screens/config").then((m) => ({
    default: m.ConfigurationLayoutScreen,
  })),
);
const SchoolConfigPage = lazyNamed(
  () => import("@/renderer/screens/config"),
  "SchoolConfigPage",
);
const ConfigCreateSchoolPage = lazyNamed(
  () => import("@/renderer/screens/config"),
  "ConfigCreateSchoolPage",
);
const StudyYearConfigPage = lazyNamed(
  () => import("@/renderer/screens/config"),
  "StudyYearConfigPage",
);
const NewStudyYearConfigurationPage = lazyNamed(
  () => import("@/renderer/screens/config"),
  "NewStudyYearConfigurationPage",
);

// École (Schools)
const SchoolsPage = lazyNamed(
  () => import("@/renderer/screens/schools"),
  "SchoolsPage",
);
const OptionPage = lazyNamed(
  () => import("@/renderer/screens/options"),
  "OptionPage",
);
const StudyYearsPage = lazyNamed(
  () => import("@/renderer/screens/study-years"),
  "StudyYearsPage",
);
const LocalRoomPage = lazyNamed(
  () => import("@/renderer/screens/locals"),
  "LocalRoomPage",
);

// Inscriptions & Classes
const EnrollmentPage = lazyNamed(
  () => import("@/renderer/screens/enrollments"),
  "EnrollmentPage",
);
const ClassroomPage = lazyNamed(
  () => import("@/renderer/screens/classrooms/classrooms"),
  "ClassroomPage",
);
const StudentPage = lazyNamed(
  () => import("@/renderer/screens/classrooms/students"),
  "StudentPage",
);

// Plan de classe (Seating)
const SeatingPage = lazyNamed(
  () => import("@/renderer/screens/seating"),
  "SeatingPage",
);
const SeatingSessionDetailPage = lazyNamed(
  () => import("@/renderer/screens/seating"),
  "SeatingSessionDetailPage",
);
const SeatingSessionAssignmentPage = lazyNamed(
  () => import("@/renderer/screens/seating"),
  "SeatingSessionAssignmentPage",
);

// Paramètres
const SettingsPage = lazyNamed(
  () => import("@/renderer/screens/settings"),
  "SettingsPage",
);
const HelpPage = lazyNamed(
  () => import("@/renderer/screens/settings"),
  "HelpPage",
);
const DeveloperPage = lazyNamed(
  () => import("@/renderer/screens/settings"),
  "DeveloperPage",
);
const AboutPage = lazyNamed(
  () => import("@/renderer/screens/settings"),
  "AboutPage",
);

// ==========================================
// CONFIGURATIONS MENUS (NAVIGATION)
// ==========================================
export const SCHOOL_SUB_MENUS: NavItem[] = [
  {
    name: "Vue d'ensemble",
    url: APP_ROUTES.SCHOOLS.ROOT,
    icon: LayoutDashboard,
  },
  { name: "Locaux", url: APP_ROUTES.SCHOOLS.LOCALS, icon: Building },
  {
    name: "Filières & Options",
    url: APP_ROUTES.SCHOOLS.OPTIONS,
    icon: BookOpen,
  },
  { name: "Parents & Tuteurs", url: APP_ROUTES.SCHOOLS.TUTORS, icon: Users },
  {
    name: "Années scolaires",
    url: APP_ROUTES.SCHOOLS.SCHOOL_YEARS,
    icon: Calendar,
  },
  { name: "Écoles", url: APP_ROUTES.SCHOOLS.LIST, icon: GraduationCap },
];

export const FINANCES_SUB_MENUS: NavItem[] = [
  { name: "Vue d'ensemble", url: ROUTES.FIN.ROOT, icon: LayoutDashboard },
  {
    name: "Historique des paiements",
    url: APP_ROUTES.FIN.PAYMENTS.HISTORIES,
    icon: History,
  },
  {
    name: "Configuration",
    url: APP_ROUTES.FIN.PAYMENT_CONFIGS.LIST,
    icon: Settings,
  },
  {
    name: "Portefeuilles & Types de frais",
    url: APP_ROUTES.FIN.WALLETS.LIST,
    icon: Wallet,
  },
];

export const SETTINGS_SUB_MENUS: NavItem[] = [
  { name: "Mon compte", url: ROUTES.SETTINGS.ACCOUNT, icon: User },
  { name: "Paramètres généraux", url: ROUTES.SETTINGS.ROOT, icon: Settings2 },
  { name: "Notifications", url: ROUTES.SETTINGS.NOTIFICATIONS, icon: Bell },
  { name: "Aide & Support", url: ROUTES.SETTINGS.HELP, icon: LifeBuoy },
  { name: "À propos", url: ROUTES.SETTINGS.ABOUT, icon: Info },
  { name: "Mode développeur", url: ROUTES.SETTINGS.DEVELOPER, icon: Code2 },
];

export const NAVIGATION_MENUS: NavSection[] = [
  {
    label: "Accès Rapide",
    items: [
      { name: "Accueil", url: APP_ROUTES.HOME, icon: Home },
      { name: "Paiements", url: APP_ROUTES.PAYEMENTS, icon: Banknote },
      { name: "Inscriptions", url: APP_ROUTES.ENROLLMENTS, icon: UserPlus },
      {
        name: "Plan de classe",
        url: APP_ROUTES.SEATING.ROOT,
        icon: LayoutGrid,
      },
    ],
  },
  {
    label: "Gestion de l'établissement",
    items: [
      { name: "Finances", url: ROUTES.FIN.ROOT, icon: CircleDollarSign },
      {
        name: "Salles de classe",
        url: APP_ROUTES.CLASSROOMS.ROOT,
        icon: Presentation,
      },
      { name: "Écoles", url: APP_ROUTES.SCHOOLS.ROOT, icon: School },
    ],
  },
] as const;

export default function RouterProvider(): JSX.Element {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            element={
              <Layout.ConfigGuard
                redirectTo={ROUTES.CONFIG.ROOT}
                loader={<LoadingSpinner />}
              >
                <Layout.AppLayout menus={NAVIGATION_MENUS} />
              </Layout.ConfigGuard>
            }
            errorElement={<Launcher />}
          >
            {/* Base Routes */}
            <Route index element={<HomePage />} />
            <Route path={ROUTES.ENROLLMENTS} element={<EnrollmentPage />} />
            <Route path={ROUTES.PAYMENTS} element={<FinApp.PaymentPage />} />

            {/* ========== SCHOOL ========== */}
            <Route
              path={ROUTES.SCHOOLS.ROOT}
              element={<SubNavLayout navItems={SCHOOL_SUB_MENUS} />}
            >
              <Route index element={<DashBoardPage />} />
              <Route path={ROUTES.SCHOOLS.LIST} element={<SchoolsPage />} />
              <Route path={ROUTES.SCHOOLS.OPTIONS} element={<OptionPage />} />
              <Route
                path={ROUTES.SCHOOLS.STUDY_YEARS}
                element={<StudyYearsPage />}
              />
              <Route path={ROUTES.SCHOOLS.LOCALS} element={<LocalRoomPage />} />
              <Route
                path={ROUTES.SCHOOLS.TUTORS}
                element={<WorkInProgressPage />}
              />
            </Route>

            {/* ========== FINANCES ========== */}
            <Route path={ROUTES.FIN.ROOT}>
              <Route
                path={ROUTES.FIN.CLASSROOMS}
                element={<FinApp.ClassroomPaymentLayout />}
              >
                <Route index element={<FinApp.ClassroomPaymentEmptyPage />} />
                <Route
                  path={ROUTES.PARAMS.CLASSROOM_ID}
                  element={<FinApp.ClassroomPaymentDetailPage />}
                />
              </Route>
            </Route>
            <Route
              path={ROUTES.FIN.ROOT}
              element={<SubNavLayout navItems={FINANCES_SUB_MENUS} />}
            >
              <Route index element={<FinApp.SchoolFinanceDashboard />} />
              {/* Portefeuilles */}
              <Route path={ROUTES.FIN.WALLET}>
                <Route index element={<FinApp.SchoolWalletPage />} />
                <Route
                  path={ROUTES.ACTIONS.NEW}
                  element={<FinApp.SchoolWalletPage />}
                />
                <Route
                  path={ROUTES.PARAMS.WALLET_ID}
                  element={<FinApp.SchoolWalletPage />}
                />
                <Route
                  path={`${ROUTES.PARAMS.WALLET_ID}/${ROUTES.ACTIONS.EDIT}`}
                  element={<FinApp.SchoolWalletPage />}
                />
              </Route>
              {/* Historique global des paiements */}
              <Route path={ROUTES.FIN.PAYMENTS}>
                <Route
                  path={ROUTES.FIN.PAYMENTS_HISTORIES}
                  element={<FinApp.PaymentsHistoryPage />}
                />
                {/* <Route
                  path={ROUTES.PARAMS.PAYMENT_ID}
                  element={<PaymentsJournalPage />}
                /> */}
              </Route>
              {/* Configurations de frais */}
              <Route path={ROUTES.FIN.PAYMENT_CONFIG}>
                <Route index element={<FinApp.SchoolPaymentConfigPage />} />
                <Route
                  path={ROUTES.ACTIONS.NEW}
                  element={<FinApp.SchoolPaymentConfigPage />}
                />
                <Route
                  path={ROUTES.PARAMS.FEE_CONFIG_ID}
                  element={<FinApp.SchoolPaymentConfigPage />}
                />
                <Route
                  path={`${ROUTES.PARAMS.FEE_CONFIG_ID}/${ROUTES.ACTIONS.EDIT}`}
                  element={<FinApp.SchoolPaymentConfigPage />}
                />
              </Route>
              {/* Gestion financière par classe */}
              {/* Taux de change */}
              <Route path={ROUTES.FIN.EXCHANGE_RATES}>
                <Route index element={<WorkInProgressPage />} />
                <Route
                  path={ROUTES.ACTIONS.NEW}
                  element={<WorkInProgressPage />}
                />
                <Route
                  path={`${ROUTES.PARAMS.RATE_ID}/${ROUTES.ACTIONS.EDIT}`}
                  element={<WorkInProgressPage />}
                />
              </Route>
            </Route>

            {/* ========== SEATING ========== */}
            <Route path={ROUTES.SEATING.ROOT}>
              <Route index element={<SeatingPage />} />
              <Route
                path={ROUTES.SEATING.SESSION}
                element={<Seating.LocalroomLayout />}
              >
                <Route index element={<SeatingSessionDetailPage />} />
                <Route
                  path={ROUTES.SEATING.SESSION_ASSIGNMENT}
                  element={<SeatingSessionAssignmentPage />}
                />
              </Route>
            </Route>

            {/* ========== CLASSROOMS ========== */}
            <Route path={ROUTES.CLASSROOMS.ROOT}>
              <Route index element={<ClassroomPage />} />
              <Route
                path={ROUTES.CLASSROOMS.CLASSROOM}
                element={<Layout.StudentLayout />}
              >
                <Route
                  path={ROUTES.CLASSROOMS.STUDENTS}
                  element={<StudentPage />}
                />
              </Route>
            </Route>

            {/* ========== SETTINGS ========== */}
            <Route
              path={ROUTES.SETTINGS.ROOT}
              element={<SubNavLayout navItems={SETTINGS_SUB_MENUS} />}
            >
              <Route index element={<SettingsPage />} />
              <Route path={ROUTES.SETTINGS.HELP} element={<HelpPage />} />
              <Route
                path={ROUTES.SETTINGS.DEVELOPER}
                element={<DeveloperPage />}
              />
              <Route
                path={ROUTES.SETTINGS.ACCOUNT}
                element={<WorkInProgressPage />}
              />
              <Route path={ROUTES.SETTINGS.ABOUT} element={<AboutPage />} />
              <Route
                path={ROUTES.SETTINGS.NOTIFICATIONS}
                element={<WorkInProgressPage />}
              />
            </Route>
          </Route>

          {/* ========== CONFIGURATION (Hors-Layout) ========== */}
          <Route
            path={ROUTES.CONFIG.ROOT}
            element={<ConfigurationLayoutScreen />}
          >
            <Route index element={<SchoolConfigPage />} />
            <Route
              path={ROUTES.CONFIG.SCHOOL_NEW}
              element={<ConfigCreateSchoolPage />}
            />
            <Route
              path={ROUTES.CONFIG.STUDY_YEAR}
              element={<StudyYearConfigPage />}
            />
            <Route
              path={ROUTES.CONFIG.STUDY_YEAR_NEW}
              element={<NewStudyYearConfigurationPage />}
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
