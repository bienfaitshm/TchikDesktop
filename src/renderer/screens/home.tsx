import { TypographyH2 } from "@/renderer/components/ui/typography";
import { ChartPie } from "../components/charts/pie";
import { BarChart } from "../components/charts/gender-bar";
import { withSchoolConfig } from "../hooks/with-application-config";
import { useDashboardStatistics } from "../libs/queries/stats";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { SecondaryStudentsByOptionChartConfig, TOTAL_STUDENT } from "../components/charts/constants";
import { convertObjectToArray } from "@/commons/data/convert-data";
import { useMemo } from "react";

/**
 * 1. Pour toute l'ecole (garcon et fille; total d'eleve inscrit)
 * 2. pour toute l'ecole (liste des sections avec le nombre d'eleve inscrit)
 * 3. Pour chaque section (liste de classe avec le nombre de file et garcons inscrit)
 * 4. pour la section secondaire (liste d'option avec le nombre d'eleve inscrit)
 * 5. Pour une classe (le nombre de file et garcons inscrit)
 * 6. Pour une classe (le nombre de file et garcons pour chaque statut d'inscription ex. ENCOURS, ABANDON)
 * 7. Historique d'inscriptions pour une ecole, l'annee scolaire ou une classe
 * @returns 
 */


export const Home: React.FC<WithSchoolAndYearId> = (props) => {
  const data = useDashboardStatistics(props)
  console.log(data)
  return (
    <div className="mx-auto max-w-screen-lg mt-10">
      <TypographyH2>Dashboard</TypographyH2>

      <div className="grid grid-cols-3 gap-5">
        {/* <ChartPie
          data={students}
          dataKey="total"
          chartConfig={TOTAL_STUDENT}
        />
        <BarChart
          data={secondaryStudentsByOption}
          dataKey="optionShortName"
          bars={["maleCount", "femaleCount"]}
          chartConfig={SecondaryStudentsByOptionChartConfig}

        /> */}
      </div>
    </div>
  );
};

export const HomePage = withSchoolConfig(Home)