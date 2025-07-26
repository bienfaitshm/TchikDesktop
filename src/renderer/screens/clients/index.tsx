import type { RouteObject } from "react-router-dom";
// import Page from "./page"
import MainPage from "./main";
import DetailClientPage from "./[clientId]";
// h-full w-full flex justify-center items-center bg-muted/80
const NoSelectedElement: React.FC = () => {
  return (
    <div className="h-full w-full flex justify-center items-center bg-muted/80">
      <h1 className="text-2xl font-semibold">No Element Selected</h1>
    </div>
  );
};
const route: RouteObject = {
  path: "/clients",
  element: <MainPage />,
  children: [
    { index: true, element: <NoSelectedElement /> },
    { path: `/clients/:clientId`, element: <DetailClientPage /> },
  ],
};
export default route;
