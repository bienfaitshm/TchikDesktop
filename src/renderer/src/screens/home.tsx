import React from "react";
import CheckoutForm from "@renderer/components/form/checkout-form";
import { SuspenseProvider } from "@renderer/providers/supense";
import { useGetProducts } from "@renderer/apis/queries";
import { TProduit } from "@renderer/apis/type";
import { ScrollArea } from "@renderer/components/ui/scroll-area";

const SuspenseLoaderProductInForm: React.FC = () => {
  const { data: products } = useGetProducts<
    (TProduit & { id: number | string })[],
    unknown
  >();
  return <CheckoutForm products={products || []} />;
};
const Home: React.FC = () => {
  return (
    <ScrollArea className="h-full">
      <div className="my-10 h-full container max-w-screen-lg">
        <SuspenseProvider>
          <SuspenseLoaderProductInForm />
        </SuspenseProvider>
      </div>
    </ScrollArea>
  );
};

export default Home;
