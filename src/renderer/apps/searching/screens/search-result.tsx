import { useSearchEngine } from "@/renderer/libs/queries/application";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useSearchParams } from "react-router";

export const ResultSearch = () => {
  const { yearId, schoolId } = useCurrentConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const { options } = useSearchEngine({
    schoolId,
    yearId,
    search: searchParams.get("q") ?? undefined,
  });
  return (
    <div>
      <h1>Homme results</h1>
      <code>{JSON.stringify(searchParams.get("q"), null, 4)}</code>
      {JSON.stringify(options, null, 4)}
    </div>
  );
};
