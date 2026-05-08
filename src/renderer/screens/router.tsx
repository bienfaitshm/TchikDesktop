import type { JSX } from "react";

import { HashRouter as Router, Route, Routes } from "react-router"

import Launcher from "@/renderer/screens/launcher";
import { HomePage } from "@/renderer/screens/home";

import { StudyYearsPage } from "@/renderer/screens/study-years";
import { SchoolsPage } from "@/renderer/screens/schools";
import { OptionPage } from "@/renderer/screens/options";
import StudentScreen from "@/renderer/screens/students";
import { LocalRoomPage } from "@/renderer/screens/locals";
import MiseEnPlaceScreen from "@/renderer/screens/mise-en-places";
import MainLayout from "@/renderer/screens/layout";
import {
  ConfigurationLayoutScreen,
  ConfigCreateSchoolPage,
  SchoolConfigPage,
  StudyYearConfigPage,
  NewStudyYearConfigurationPage
} from "@/renderer/screens/config";
import { AboutPage, AccountPage, DeveloperPage, HelpPage, SettingsPage, NotificationPage} from "@/renderer/screens/settings"
import { EnrollmentPage } from "@/renderer/screens/enrollments";
import { ClassroomPage } from "@/renderer/screens/classrooms/classrooms"

import { StudentPage } from "@/renderer/screens/classrooms/students"
import { StudentLayout } from "@/renderer/components/layouts/students.layout"
import { ConfigGuard } from "@/renderer/components/layouts/config-guard";

import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner"
import { SettingLayout } from "@/renderer/components/layouts/settings.layout";




export default function RouterProvider(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route
          element={
            <ConfigGuard redirectTo="configuration" loader={<LoadingSpinner />}>
              <MainLayout />
            </ConfigGuard>
          }
          errorElement={<Launcher />}
        >
          <Route index element={<HomePage />} />
          <Route path="inscriptions" element={<EnrollmentPage />} />
          <Route path="mise-en-places" element={<MiseEnPlaceScreen />} />
          {/* schools */}
          <Route path="students" element={<StudentScreen />} />
          <Route path="options" element={<OptionPage />} />
          {/* classrooms */}
          <Route path="classrooms" element={<ClassroomPage />} />

          {/* Classroom-details */}
          <Route path="classrooms/:classroomId" element={<StudentLayout />}>
            <Route path="students" element={<StudentPage />} />
          </Route>
          <Route path="locals" element={<LocalRoomPage />} />
          {/* other */}
          <Route path="school-years" element={<StudyYearsPage />} />
          <Route path="schools" element={<SchoolsPage />} />
          {/* settings */}
          <Route path="settings" element={<SettingLayout />}>
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
          <Route path="school-year/new" element={<NewStudyYearConfigurationPage />} />
        </Route>
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  )
}
