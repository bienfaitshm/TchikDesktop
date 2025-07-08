import React from "react";
import ProductList from "./frame";
import { useGetProducts } from "@renderer/apis/queries";
import type { TProduit } from "@renderer/apis/type";
import { SuspenseProvider } from "@renderer/providers/supense";

const SGETProduct: React.FC = () => {
  const { data: products } = useGetProducts<TProduit, unknown>();
  console.log({ products });

  return <ProductList itens={(products || []) as TProduit[]} />;
};
export default function SessionPage(): React.JSX.Element {
  return (
    <div className="h-full">
      <SuspenseProvider>
        <SGETProduct />
      </SuspenseProvider>
    </div>
  );
}
