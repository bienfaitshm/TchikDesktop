
import { HashRouter as Router, Route, Routes } from "react-router"
// 

import Launcher from "@/renderer/screens/launcher";
// 
import Home from "@/renderer/screens/home";
import OptionScreen from "@/renderer/screens/options";
import ClassroomScreen from "@/renderer/screens/classrooms";
import StudentScreen from "@/renderer/screens/students";
import LocalScreen from "@/renderer/screens/locals";
import InscriptionScreen from "@/renderer/screens/inscriptions";
import MiseEnPlaceScreen from "@/renderer/screens/mise-en-places";
import SchoolYearScreen from "@/renderer/screens/study-years";
import Layout from "@/renderer/screens/layout";
import {
  ConfigurationLayoutScreen,
  SchoolConfigurationNewSchoolScreen,
  SchoolConfigurationScreen,
  StudyYearConfigurationScreen,
  NewStudyYearConfigurationPage
} from "@/renderer/screens/config";

import { ClassroomStudentsPage } from "@/renderer/screens/classrooms/students"


export default function RouterProvider(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />} errorElement={<Launcher />}>
          <Route index element={<Home />} />
          <Route path="inscriptions" element={<InscriptionScreen />} />
          <Route path="mise-en-places" element={<MiseEnPlaceScreen />} />
          {/* schools */}
          <Route path="students" element={<StudentScreen />} />
          <Route path="options" element={<OptionScreen />} />
          <Route path="classrooms" element={<ClassroomScreen />} />
          <Route path="classrooms/:classroomId" element={<ClassroomStudentsPage />} />
          <Route path="locals" element={<LocalScreen />} />
          {/* other */}
          <Route path="school-years" element={<SchoolYearScreen />} />
        </Route>
        <Route path="configuration" element={<ConfigurationLayoutScreen />}>
          <Route index element={<SchoolConfigurationScreen />} />
          <Route path="school/new" element={<SchoolConfigurationNewSchoolScreen />} />
          <Route path="school-year" element={<StudyYearConfigurationScreen />} />
          <Route path="school-year/new" element={<NewStudyYearConfigurationPage />} />
        </Route>
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  )
}
