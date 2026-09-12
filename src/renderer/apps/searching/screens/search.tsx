import {
  Clock,
  Compass,
  MessageSquare,
  Info,
  FileText,
  Table,
  MoreHorizontal,
} from "lucide-react";
import { SearchInput } from "../components/search";
import { useSearchEngine } from "../../../libs/queries/application";
import { useCurrentConfig } from "../../../libs/stores/app-store";
import { ROUTES } from "@/renderer/constants";
import { useNavigate } from "react-router";

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
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between p-6 md:p-10 font-sans select-none">
      {/* Arrière-plan inspiré de l'image (Dégradé + Image nature ou effet visuel) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center filter brightness-95"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop')`, // Remplacez par votre image de fond si besoin
        }}
      >
        {/* Superposition pour adoucir le fond et le rendre flou comme sur l'image */}
        <div className="absolute inset-0 bg-sky-900/20 backdrop-blur-[2px]" />
      </div>

      {/* --- SECTION HAUTE : Salutation --- */}
      {/* <div className="relative z-10 text-center mt-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-normal text-white tracking-tight drop-shadow-sm">
          Good morning, Charles
        </h1>
        <p className="text-2xl md:text-3xl font-medium text-white/90 tracking-tight drop-shadow-sm">
          What&apos;s on your mind?
        </p>
      </div> */}

      {/* --- SECTION CENTRALE : Barre de recherche / Message Copilot --- */}
      <div className="relative z-10 max-w-2xl w-full mx-auto my-6 space-y-4">
        <SearchForm schoolId={schoolId} yearId={yearId} />
      </div>

      {/* --- SECTION BASSE : Les 3 Cartes Widgets --- */}
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Carte 1 : Jump back in to your files */}
        <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 mb-4">
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Jump back in to your files</span>
            </div>
            <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>

          <div className="space-y-3">
            {/* Élément 1 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 transition cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-800 dark:text-white">
                    Places to eat in Paris
                  </h4>
                  <p className="text-[10px] text-slate-500">7m ago</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>

            {/* Élément 2 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 transition cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-800 dark:text-white">
                    Paris Apartments
                  </h4>
                  <p className="text-[10px] text-slate-500">28m ago</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>

            {/* Élément 3 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 transition cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-200 overflow-hidden flex items-center justify-center font-bold text-xs text-amber-800">
                  IMG
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-800 dark:text-white">
                    IMG_2012.png
                  </h4>
                  <p className="text-[10px] text-slate-500">3h ago</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Effet de lueur jaune en bas à droite comme sur l'image */}
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Carte 2 : Get guided help with your apps */}
        <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 mb-4">
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <Compass className="w-4 h-4 text-slate-600" />
              <span>Get guided help with your apps</span>
            </div>
            <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>

          <div className="grid grid-cols-3 gap-3 py-2">
            {/* Grille d'icônes Microsoft */}
            {[
              { name: "Outlook", bg: "bg-blue-600" },
              { name: "Word", bg: "bg-blue-700" },
              { name: "Excel", bg: "bg-emerald-600" },
              { name: "PowerPoint", bg: "bg-orange-600" },
              { name: "Clipchamp", bg: "bg-purple-600" },
              { name: "Edge", bg: "bg-cyan-600" },
            ].map((app, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white/40 transition cursor-pointer space-y-1"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${app.bg} flex items-center justify-center text-white font-bold text-xs shadow-sm`}
                >
                  {app.name[0]}
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">
                  {app.name}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Carte 3 : Keep talking to Copilot */}
        <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 mb-4">
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <span>Keep talking to Copilot</span>
            </div>
            <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>

          <div className="space-y-3">
            {/* Élément 1 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 transition cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-800 dark:text-white">
                    Dithering explained
                  </h4>
                  <p className="text-[10px] text-slate-500">56m ago</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>

            {/* Élément 2 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 transition cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-800 dark:text-white">
                    Paris day itinerary
                  </h4>
                  <p className="text-[10px] text-slate-500">2h ago</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>

            {/* Élément 3 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/40 transition cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-800 dark:text-white">
                    Holiday Planning
                  </h4>
                  <p className="text-[10px] text-slate-500">2h ago</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
