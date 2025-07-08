import React, { useEffect } from "react";
import { SuspenseProvider } from "@/renderer/providers/supense";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { getConfiguration } from "@/renderer/libs/apis/configuration"

const Home: React.FC = () => {
  useEffect(() => {
    (async () => {
      const data = await getConfiguration()
      console.log("Data...", data)
    })()

  }, [])
  return (
    <ScrollArea className="h-full">
      <div className="my-10 h-full container max-w-screen-lg">
        <SuspenseProvider>
        </SuspenseProvider>
      </div>
    </ScrollArea>
  );
};

export default Home;
