import { TypographyH2 } from "@/renderer/components/ui/typography";
import { ChartPie } from "../components/charts/pie";
import { GenderBar } from "../components/charts/gender-bar";


export const HomePage = () => {
  return (
    <div className="mx-auto max-w-screen-lg mt-10">
      <TypographyH2>Dashboard</TypographyH2>

      <div className="grid grid-cols-3 gap-5">
        <ChartPie />
        <GenderBar />
      </div>
    </div>
  );
};