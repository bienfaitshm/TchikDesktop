import { SearchInput } from "../components/search";
import { useSearchEngine } from "@/renderer/libs/queries/application";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { ROUTES, APP_ROUTES } from "@/renderer/constants";
import { Link, useNavigate } from "react-router";
import {
  PageContainer,
  PageContent,
} from "@/renderer/containers/page-container";
import {
  UserPlus,
  Banknote,
  Presentation,
  Users,
  Table2Icon,
} from "lucide-react";
import { StudentPreview } from "../components/search-preview";

const QUICK_ACCESS = [
  { label: "Inscription", url: APP_ROUTES.ENROLLMENTS, icon: UserPlus },
  { label: "Paiements", url: APP_ROUTES.PAYEMENTS, icon: Banknote },
  {
    label: "Grille tarifaire",
    url: APP_ROUTES.FIN.CLASSROOMS.LIST,
    icon: Table2Icon,
  },
  {
    label: "Salles de classe",
    url: APP_ROUTES.CLASSROOMS.ROOT,
    icon: Presentation,
  },
];

const SearchForm: React.FC<{ yearId?: string; schoolId?: string }> = ({
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

export function HomeSearch() {
  const { yearId, schoolId, school } = useCurrentConfig();

  return (
    <PageContainer>
      <PageContent>
        {/* Conteneur principal centré façon "Nouvel Onglet" */}
        <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center px-4">
          {/* Widget d'info style météo (Fixé en haut à droite) */}
          <div className="absolute top-4 right-4 bg-card/60 backdrop-blur-md border border-border p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Users size={20} />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-muted-foreground font-medium">
                Total Élèves
              </span>
              <span className="text-base font-bold text-foreground leading-none mt-1">
                1 234
              </span>
            </div>
          </div>

          {/* Bloc Central */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 -mt-12">
            {/* Logo / Nom de l'établissement */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {school?.name || "Gestion Scolaire"}
              </h1>
            </div>

            {/* Barre de Recherche Pilule (style Firefox) */}
            <div className="w-full shadow-lg rounded-full">
              <SearchForm schoolId={schoolId} yearId={yearId} />
            </div>

            {/* Grille des Accès Rapides (Style Vignettes Firefox) */}
            <div className="flex flex-wrap justify-center items-start gap-4 md:gap-6 pt-4 w-full">
              {QUICK_ACCESS.map((item, index) => (
                <Link
                  key={index}
                  to={item.url}
                  className="group flex flex-col items-center gap-2 w-20 md:w-24 focus:outline-none"
                >
                  {/* Carré de la vignette */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-foreground/80 group-hover:bg-accent group-hover:text-primary group-hover:scale-105 group-hover:border-primary/40 transition-all duration-200 shadow-sm">
                    <item.icon size={26} strokeWidth={1.75} />
                  </div>

                  {/* Libellé sous la vignette */}
                  <span className="text-xs text-muted-foreground font-medium text-center line-clamp-2 group-hover:text-foreground transition-colors">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
