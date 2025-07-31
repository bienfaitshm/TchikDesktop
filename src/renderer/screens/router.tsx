import { BrowserRouter, Route, Routes } from "react-router"
import Home from "@/renderer/screens/home";
import OptionScreen from "@/renderer/screens/options";
import ClassroomScreen from "@/renderer/screens/classrooms";
import StudentScreen from "@/renderer/screens/students";
import LocalScreen from "@/renderer/screens/locals";
import InscriptionScreen from "@/renderer/screens/inscriptions";
import MiseEnPlaceScreen from "@/renderer/screens/mise-en-places";
import Layout from "@/renderer/screens/layout";


export default function RouterProvider(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="inscriptions" element={<InscriptionScreen />} />
          <Route path="mise-en-places" element={<MiseEnPlaceScreen />} />
          <Route path="students" element={<StudentScreen />} />
          <Route path="options" element={<OptionScreen />} />
          <Route path="classrooms" element={<ClassroomScreen />} />
          <Route path="locals" element={<LocalScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
