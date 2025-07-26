import {
  createBrowserRouter,
  RouterProvider as RRouterProvider,
} from "react-router-dom";
// import clients from "@renderer/screens/clients";
// import products from "@renderer/screens/products";
// import categories from "@renderer/screens/categories";
// import payement from "@renderer/screens/payement";
// import settings from "@renderer/screens/settings";
import Home from "@/renderer/screens/home";
import Layout from "./layout";
import Launcher from "./launcher";

const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    errorElement: <Launcher />,
    // errorElement: (
    //   <div className="h-screen w-full flex justify-center items-center">
    //     <h1 className="text-2xl font-bold">Il y eu erreur</h1>
    //   </div>
    // ),
    children: [
      { index: true, element: <Home />, errorElement: <Home /> },
      // payement,
      // clients,
      // products,
      // categories,
      // settings,
    ],
  },
]);

export default function RouterProvider(): JSX.Element {
  return <RRouterProvider router={router} />;
}
