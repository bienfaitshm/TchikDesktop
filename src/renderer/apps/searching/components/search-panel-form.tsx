import { SearchInput } from "../components/search";
import { useSearchEngine } from "@/renderer/libs/queries/application";
import { ROUTES } from "@/renderer/constants";
import { useNavigate } from "react-router";

import { StudentPreview } from "../components/search-preview";

export const SearchForm: React.FC<{ yearId?: string; schoolId?: string }> = ({
  schoolId = "",
  yearId = "",
}) => {
  const search = useSearchEngine({ yearId, schoolId, limit: 50 });
  const navigate = useNavigate();

  console.log(search.options);
  return (
    <form
      method="GET"
      action={ROUTES.SEARCH_RESULT}
      onSubmit={(e) => {
        e.preventDefault();
        navigate({
          pathname: ROUTES.SEARCH_RESULT,
          search: new URLSearchParams({
            q: String(search.searchQuery),
          }).toString(),
        });
      }}
      className="w-full"
    >
      <SearchInput
        name="q"
        data={search.options}
        query={search.searchQuery}
        onQueryChange={search.setSearchQuery}
        onSelect={(data) => {
          navigate({
            pathname: ROUTES.SEARCH_RESULT,
            search: new URLSearchParams({
              q: String(search.searchQuery),
              user: data.id,
            }).toString(),
          });
        }}
        getItemLabel={(data) => ({
          label: data.title,
          description: data.subtitle,
        })}
        renderDetail={(item) => <StudentPreview data={item.preview} />}
      />
    </form>
  );
};
