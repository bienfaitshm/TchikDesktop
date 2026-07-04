import type { JSX } from "react";
import {
  Home,
  LayoutDashboard,
  GraduationCap,
  School,
  Clipboard,
  List,
  Banknote,
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
  // AccountPage,
  DeveloperPage,
  HelpPage,
  SettingsPage,
  // NotificationPage,
} from "@/renderer/screens/settings";
import WorkInProgressPage from "@/renderer/components/work-in-progess-page";
import {
  SchoolFinanceDashboard,
  ClassroomsFinPage,
  FeeTypesPage,
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
import { ROUTES } from "@/renderer/constants";
import type { NavSection } from "@/renderer/components/app-sidebar/app-sidebar";

const NAVIGATION_MENUS: NavSection[] = [
  {
    label: "Application",
    items: [
      { name: "Accueil", url: ROUTES.HOME, icon: Home },
      { name: "Finances", url: ROUTES.FIN.DASHBOARD, icon: Banknote },
      { name: "Inscriptions", url: ROUTES.ENROLLMENTS, icon: Clipboard },
      {
        name: "Mise en place",
        url: ROUTES.SEATING.ROOT,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Écoles",
    items: [
      { name: "Classes", url: ROUTES.CLASSROOMS.ROOT, icon: School },
      { name: "Locaux", url: ROUTES.LOCALS, icon: List },
      { name: "Options", url: ROUTES.OPTIONS, icon: GraduationCap },
    ],
  },
  {
    label: "Finances",
    items: [
      { name: "Configuration", url: ROUTES.FIN.PAYMENT_CONFIG, icon: School },
      { name: "Porte Feuilles", url: ROUTES.FIN.WALLET, icon: List },
      { name: "Type de frais", url: ROUTES.FIN.FEE_TYPE, icon: List },
      {
        name: "Taux du jours",
        url: ROUTES.FIN.EXCHANGE_RATES,
        icon: GraduationCap,
      },
    ],
  },
];

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
          <Route index element={<HomePage />} />
          <Route path={ROUTES.ENROLLMENTS} element={<EnrollmentPage />} />
          <Route
            path={ROUTES.FIN.DASHBOARD}
            element={<SchoolFinanceDashboard />}
          />
          {/* ========== FINANCES ========== */}
          {/* 1. Portefeuilles (Wallets) */}
          <Route path={ROUTES.FIN.WALLET}>
            <Route index element={<SchoolWalletPage />} />
            <Route path="new" element={<SchoolWalletPage />} />
            <Route path=":walletId" element={<SchoolWalletPage />} />
            <Route path=":walletId/edit" element={<SchoolWalletPage />} />
          </Route>

          {/* 2. Types de frais */}
          <Route path={ROUTES.FIN.FEE_TYPE}>
            <Route index element={<FeeTypesPage />} />
            <Route path="new" element={<FeeTypesPage />} />
            <Route path=":feeTypeId" element={<FeeTypesPage />} />
            <Route path=":feeTypeId/edit" element={<FeeTypesPage />} />
          </Route>

          {/* 3. Configurations de frais */}
          <Route path={ROUTES.FIN.PAYMENT_CONFIG}>
            <Route index element={<SchoolPaymentConfigPage />} />
            <Route path="new" element={<SchoolPaymentConfigPage />} />
            <Route path=":feeConfigId" element={<SchoolPaymentConfigPage />} />
            <Route
              path=":feeConfigId/edit"
              element={<SchoolPaymentConfigPage />}
            />
          </Route>

          {/* 4. Gestion financière par classe */}
          <Route path={ROUTES.FIN.CLASSROOMS}>
            <Route index element={<ClassroomsFinPage />} />
            <Route path=":classroomId">
              <Route index element={<ClassroomsFinPage />} />
              <Route path="assignments">
                <Route index element={<ClassroomsFinPage />} />
                <Route path="new" element={<ClassroomsFinPage />} />
                <Route
                  path=":assignmentId/edit"
                  element={<ClassroomsFinPage />}
                />
              </Route>
              <Route path="payments">
                <Route index element={<ClassroomsFinPage />} />
                <Route path=":paymentId" element={<ClassroomsFinPage />} />
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
            <Route path=":paymentId" element={<PaymentsJournalPage />} />
          </Route>

          {/* 6. Taux de change quotidiens */}
          <Route path={ROUTES.FIN.EXCHANGE_RATES}>
            <Route index element={<WorkInProgressPage />} />
            <Route path="new" element={<WorkInProgressPage />} />
            <Route path=":rateId/edit" element={<WorkInProgressPage />} />
          </Route>

          {/* Seating */}
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

          {/* Schools & Options */}
          <Route path={ROUTES.OPTIONS} element={<OptionPage />} />
          <Route path={ROUTES.SCHOOLS} element={<SchoolsPage />} />
          <Route path={ROUTES.STUDY_YEARS} element={<StudyYearsPage />} />
          <Route path={ROUTES.LOCALS} element={<LocalRoomPage />} />

          {/* Classrooms */}
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

          {/* Settings */}
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

        {/* Configuration */}
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
