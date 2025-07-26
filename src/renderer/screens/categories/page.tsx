import React, { Suspense } from "react";
import Frame from "./frame";
import { useGetCategories } from "@renderer/apis/queries";
import { TCategory } from "@renderer/apis/type";

const CategorieSupense: React.FC = () => {
  const { data: categories } = useGetCategories<TCategory[], unknown>();
  console.log({ categories });
  return <Frame categories={categories || []} />;
};

export const Page: React.FC = () => {
  return (
    <div className="h-full">
      <Suspense fallback={<h1>Chargement...</h1>}>
        <CategorieSupense />
      </Suspense>
    </div>
  );
};
