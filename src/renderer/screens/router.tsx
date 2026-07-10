import type { JSX } from "react";
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
} from "lucide-react";
import { HashRouter as Router, Route, Routes } from "react-router";

import * as Layout from "@/renderer/screens/layouts";
import Launcher from "@/renderer/screens/launcher";
import { HomePage } from "@/renderer/screens/home";
import { StudyYearsPage } from "@/renderer/screens/study-years";
import { SchoolsPage } from "@/renderer/screens/schools";
import { OptionPage } from "@/renderer/screens/options";
import { LocalRoomPage } from "@/renderer/screens/locals";
import {
  ConfigurationLayoutScreen,
  ConfigCreateSchoolPage,
  SchoolConfigPage,
  StudyYearConfigPage,
  NewStudyYearConfigurationPage,
} from "@/renderer/screens/config";
import {
  AboutPage,
  DeveloperPage,
  HelpPage,
  SettingsPage,
} from "@/renderer/screens/settings";
import WorkInProgressPage from "@/renderer/components/work-in-progess-page";
import {
  SchoolFinanceDashboard,
  ClassroomsFinPage,
  PaymentsJournalPage,
  PaymentsHistoryPage,
  SchoolPaymentConfigPage,
  SchoolWalletPage,
} from "@/renderer/apps/finances";
import { EnrollmentPage } from "@/renderer/screens/enrollments";
import { ClassroomPage } from "@/renderer/screens/classrooms/classrooms";
import { StudentPage } from "@/renderer/screens/classrooms/students";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import {
  SeatingPage,
  SeatingSessionDetailPage,
  SeatingSessionAssignmentPage,
} from "@/renderer/screens/seating";
import { NotFoundPage } from "@/renderer/screens/not-found";

import { ROUTES, APP_ROUTES } from "@/renderer/constants";
import type {
  NavSection,
  NavItem,
} from "@/renderer/components/app-sidebar/app-sidebar";
import { DashBoardPage } from "./dashboard";

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

export const NAVIGATION_MENUS: NavSection[] = [
  {
    label: "Accès Rapide",
    items: [
      { name: "Accueil", url: APP_ROUTES.HOME, icon: Home },
      { name: "Paiements", url: APP_ROUTES.FIN.DASHBOARD, icon: Banknote },
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
          {/* Routes de base */}
          <Route index element={<HomePage />} />
          <Route path={ROUTES.ENROLLMENTS} element={<EnrollmentPage />} />

          {/* ========== SCHOOL ========== */}
          <Route
            path={ROUTES.SCHOOLS.ROOT}
            element={<Layout.SubNavigationLayout items={SCHOOL_SUB_MENUS} />}
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
          <Route
            path={ROUTES.FIN.ROOT}
            element={<Layout.SubNavigationLayout items={FINANCES_SUB_MENUS} />}
          >
            <Route index element={<SchoolFinanceDashboard />} />
            {/* 1. Portefeuilles */}
            <Route path={ROUTES.FIN.WALLET}>
              <Route index element={<SchoolWalletPage />} />
              <Route path={ROUTES.ACTIONS.NEW} element={<SchoolWalletPage />} />
              <Route
                path={ROUTES.PARAMS.WALLET_ID}
                element={<SchoolWalletPage />}
              />
              <Route
                path={`${ROUTES.PARAMS.WALLET_ID}/${ROUTES.ACTIONS.EDIT}`}
                element={<SchoolWalletPage />}
              />
            </Route>
            {/* 3. Configurations de frais */}
            <Route path={ROUTES.FIN.PAYMENT_CONFIG}>
              <Route index element={<SchoolPaymentConfigPage />} />
              <Route
                path={ROUTES.ACTIONS.NEW}
                element={<SchoolPaymentConfigPage />}
              />
              <Route
                path={ROUTES.PARAMS.FEE_CONFIG_ID}
                element={<SchoolPaymentConfigPage />}
              />
              <Route
                path={`${ROUTES.PARAMS.FEE_CONFIG_ID}/${ROUTES.ACTIONS.EDIT}`}
                element={<SchoolPaymentConfigPage />}
              />
            </Route>

            {/* 4. Gestion financière par classe */}
            <Route path={ROUTES.FIN.CLASSROOMS}>
              <Route index element={<ClassroomsFinPage />} />
              <Route path={ROUTES.PARAMS.CLASSROOM_ID}>
                <Route index element={<ClassroomsFinPage />} />
                <Route path={ROUTES.ACTIONS.ASSIGNMENTS}>
                  <Route index element={<ClassroomsFinPage />} />
                  <Route
                    path={ROUTES.ACTIONS.NEW}
                    element={<ClassroomsFinPage />}
                  />
                  <Route
                    path={`${ROUTES.PARAMS.ASSIGNMENT_ID}/${ROUTES.ACTIONS.EDIT}`}
                    element={<ClassroomsFinPage />}
                  />
                </Route>
                <Route path={ROUTES.ACTIONS.PAYMENTS}>
                  <Route index element={<ClassroomsFinPage />} />
                  <Route
                    path={ROUTES.PARAMS.PAYMENT_ID}
                    element={<ClassroomsFinPage />}
                  />
                </Route>
              </Route>
            </Route>

            {/* 5. Historique global des paiements */}
            <Route path={ROUTES.FIN.PAYMENTS}>
              <Route index element={<PaymentsJournalPage />} />
              <Route
                path={ROUTES.FIN.PAYMENTS_HISTORIES}
                element={<PaymentsHistoryPage />}
              />
              <Route
                path={ROUTES.PARAMS.PAYMENT_ID}
                element={<PaymentsJournalPage />}
              />
            </Route>

            {/* 6. Taux de change quotidiens */}
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
              element={<Layout.SeatingSessionLayout />}
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
          <Route path={ROUTES.SETTINGS.ROOT} element={<Layout.SettingLayout />}>
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

        {/* ========== CONFIGURATION (Hors du layout principal) ========== */}
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

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
