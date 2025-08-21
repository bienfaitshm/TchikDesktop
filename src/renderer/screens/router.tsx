
import { HashRouter as Router, Route, Routes } from "react-router"
// 

import Launcher from "@/renderer/screens/launcher";
// 
import Home from "@/renderer/screens/home";
import OptionScreen from "@/renderer/screens/options";
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

// classroom
import { ClassroomPage } from "@/renderer/screens/classrooms/classrooms"
import { ClassroomLayout } from "@/renderer/screens/classrooms/classrooms.layout"
import { ClassroomSection } from "@/renderer/screens/classrooms/classrooms.section"

// classroom/:classId
import { StudentsOfClassrrom } from "@/renderer/screens/classrooms/students"
import { StudentsLayout } from "@/renderer/screens/classrooms/students.layout"


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
          {/* classrooms */}
          <Route path="classrooms" element={<ClassroomLayout />}>
            <Route index element={<ClassroomPage />} />
            <Route path=":section" element={<ClassroomSection />} />
          </Route>
          {/* Classroom-details */}
          <Route path="classrooms/:classroomId" element={<StudentsLayout />}>
            <Route path="students" element={<StudentsOfClassrrom />} />
          </Route>
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
