import { SearchInput } from "../components/search";
import { useSearchEngine } from "@/renderer/libs/queries/application";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { ROUTES } from "@/renderer/constants";
import { useNavigate } from "react-router";
import {
  PageContainer,
  PageContent,
} from "@/renderer/containers/page-container";

const SearchForm: React.FC<{ yearId?: string; schoolId?: string }> = ({
  schoolId = "",
  yearId = "",
}) => {
  const search = useSearchEngine({ yearId, schoolId, limit: 50 });
  const navigate = useNavigate();
  console.log(search);
  return (
    <form
      method="GET"
      action={ROUTES.SEARCH_RESULT}
      onSubmit={(e) => {
        console.log(e.target);
        e.preventDefault();
        navigate({
          pathname: ROUTES.SEARCH_RESULT,
          search: new URLSearchParams({
            q: String(search.searchQuery),
          }).toString(),
        });
      }}
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

        renderDetail={(item) => (
          <div>
            <p>{JSON.stringify(item, null, 4)}</p>
          </div>
        )}
      />
    </form>
  );
};

export function HomeSearch() {
  const { yearId, schoolId } = useCurrentConfig();

  return (
    <PageContainer>
      <PageContent>
        <div>
          <SearchForm schoolId={schoolId} yearId={yearId} />
        </div>
      </PageContent>
    </PageContainer>
  );
}
