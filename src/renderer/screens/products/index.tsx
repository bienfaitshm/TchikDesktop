import type { RouteObject } from "react-router-dom";
import ProductPageDetail from "./[id]";
import MainPage from "./main";
// import {  } from "@renderer/apis/queries"

const BaseUrlClasse: string = "products";

const EmptyElement: React.FC = () => {
  return (
    <div className="p-5">
      <h1 className="text-3xl">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime sint
        doloremque molestias voluptas nemo eius laborum voluptates, impedit
        voluptatum ipsam vitae, porro fuga odit iusto excepturi cumque minima?
        Vitae, deleniti?
      </h1>
    </div>
  );
};

const route: RouteObject = {
  path: BaseUrlClasse,
  element: <MainPage />,
  // children: [
  //   { index: true, element: <EmptyElement /> },
  //   { path: `${BaseUrlClasse}/:classe`, element: <DetailPageClasse /> },
  // ],
};

export const detailClasseRoute: RouteObject = {
  path: `${BaseUrlClasse}/:id`,
  element: <ProductPageDetail />,
};
export default route;
