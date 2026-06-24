import type { JSX } from "react";

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

import { EnrollmentPage } from "@/renderer/screens/enrollments";
import { ClassroomPage } from "@/renderer/screens/classrooms/classrooms";

import { StudentPage } from "@/renderer/screens/classrooms/students";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import {
  SeatingPage,
  SeatingSessionDetailPage,
  SeatingSessionAssignmentPage,
} from "@/renderer/screens/seating";

import { ROUTES } from "@/renderer/constants";

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
              <Layout.AppLayout />
            </Layout.ConfigGuard>
          }
          errorElement={<Launcher />}
        >
          <Route index element={<HomePage />} />
          <Route path={ROUTES.ENROLLMENTS} element={<EnrollmentPage />} />

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

        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  );
}
