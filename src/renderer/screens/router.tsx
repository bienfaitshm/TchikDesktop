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
  AccountPage,
  DeveloperPage,
  HelpPage,
  SettingsPage,
  NotificationPage,
} from "@/renderer/screens/settings";
import { EnrollmentPage } from "@/renderer/screens/enrollments";
import { ClassroomPage } from "@/renderer/screens/classrooms/classrooms";

import { StudentPage } from "@/renderer/screens/classrooms/students";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import {
  SeatingPage,
  SeatingSessionDetailPage,
  SeatingSessionAssignmentPage,
} from "@/renderer/screens/seating";

export default function RouterProvider(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route
          element={
            <Layout.ConfigGuard
              redirectTo="configuration"
              loader={<LoadingSpinner />}
            >
              <Layout.AppLayout />
            </Layout.ConfigGuard>
          }
          errorElement={<Launcher />}
        >
          <Route index element={<HomePage />} />
          <Route path="inscriptions" element={<EnrollmentPage />} />
          <Route path="seating">
            <Route index element={<SeatingPage />} />
            <Route path=":sessionId" element={<Layout.SeatingSessionLayout />}>
              <Route index element={<SeatingSessionDetailPage />} />
              <Route
                path=":localroomId/"
                element={<SeatingSessionAssignmentPage />}
              />
            </Route>
          </Route>
          {/* schools */}
          <Route path="options" element={<OptionPage />} />
          {/* classrooms */}
          <Route path="classrooms">
            <Route index element={<ClassroomPage />} />
            <Route path=":classroomId" element={<Layout.StudentLayout />}>
              <Route path="students" element={<StudentPage />} />
            </Route>
          </Route>

          <Route path="locals" element={<LocalRoomPage />} />
          {/* other */}
          <Route path="school-years" element={<StudyYearsPage />} />
          <Route path="schools" element={<SchoolsPage />} />
          {/* settings */}
          <Route path="settings" element={<Layout.SettingLayout />}>
            <Route index element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="developer" element={<DeveloperPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="notifications" element={<NotificationPage />} />
          </Route>
        </Route>
        <Route path="configuration" element={<ConfigurationLayoutScreen />}>
          <Route index element={<SchoolConfigPage />} />
          <Route path="school/new" element={<ConfigCreateSchoolPage />} />
          <Route path="school-year" element={<StudyYearConfigPage />} />
          <Route
            path="school-year/new"
            element={<NewStudyYearConfigurationPage />}
          />
        </Route>
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  );
}
