
import { HashRouter as Router, Route, Routes } from "react-router"
// 

import Launcher from "@/renderer/screens/launcher";
// 
import { HomePage } from "@/renderer/screens/home";

// Schools
// import { StudyYearsPage } from "@/renderer/screens/study-years";
// import { SchoolsPage } from "@/renderer/screens/schools";
// // 
// import { OptionPage } from "@/renderer/screens/options";
// import StudentScreen from "@/renderer/screens/students";
// import LocalScreen from "@/renderer/screens/locals";
// import MiseEnPlaceScreen from "@/renderer/screens/mise-en-places";
import Layout from "@/renderer/screens/layout";
import {
  ConfigurationLayoutScreen,
  SchoolConfigurationNewSchoolScreen,
  SchoolConfigurationScreen,
  StudyYearConfigurationScreen,
  NewStudyYearConfigurationPage
} from "@/renderer/screens/config";

// import { QuickEnrollmentPage } from "@/renderer/screens/enrollments";
// // classroom
// import { ClassroomPage } from "@/renderer/screens/classrooms/classrooms"

// // classroom/:classId
// import { StudentsOfClassrrom } from "@/renderer/screens/classrooms/students"
// import { StudentsLayout } from "@/renderer/screens/classrooms/students.layout"


export default function RouterProvider(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />} errorElement={<Launcher />}>
          <Route index element={<HomePage />} />
          {/* <Route path="inscriptions" element={<QuickEnrollmentPage />} />
          <Route path="mise-en-places" element={<MiseEnPlaceScreen />} /> */}
          {/* schools */}
          {/* <Route path="students" element={<StudentScreen />} />
          <Route path="options" element={<OptionPage />} /> */}
          {/* classrooms */}
          {/* <Route path="classrooms" element={<ClassroomPage />} /> */}

          {/* Classroom-details */}
          {/* <Route path="classrooms/:classroomId" element={<StudentsLayout />}>
            <Route path="students" element={<StudentsOfClassrrom />} />
          </Route>
          <Route path="locals" element={<LocalScreen />} /> */}
          {/* other */}
          {/* <Route path="school-years" element={<StudyYearsPage />} />
          <Route path="schools" element={<SchoolsPage />} /> */}
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
