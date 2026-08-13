import { Search } from "lucide-react";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useMemo,
  useTransition,
} from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/renderer/utils";

/**
 * Defines a single setting item with its visual and content representations.
 */
export type SettingItem = {
  icon: ReactNode;
  color: string;
  title: string;
  description?: string;
  content?: ReactNode;
  action?: ReactNode;
};

/**
 * Group of settings categorized under a specific label for UI organization.
 */
export type SettingSection = {
  label: string;
  keywords: string;
  items: SettingItem[];
};

/**
 * Context state structure for the settings search module.
 */
type SettingsSearchContextState = {
  searchQuery: string;
  isPending: boolean;
  filteredSections: SettingSection[];
  onSearch: (value: string) => void;
};

const SettingsSearchContext = createContext<SettingsSearchContextState | null>(
  null,
);

/**
 * Safely accesses the SettingsSearchContext.
 * @returns The current settings search context state.
 */
const useSettingsSearch = (): SettingsSearchContextState => {
  const context = useContext(SettingsSearchContext);
  if (!context) {
    throw new Error(
      "useSettingsSearch must be used within a SettingsSearchProvider",
    );
  }
  return context;
};

export type SettingsSearchProviderProps = {
  sections: SettingSection[];
};

/**
 * Provides state and filtering logic for settings components.
 * @param props - Contains the initial sections array and child components.
 * @returns A Context Provider wrapping the children.
 */
export const SettingsSearchProvider: React.FC<
  React.PropsWithChildren<SettingsSearchProviderProps>
> = ({ sections, children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    return sections.filter((sec) => matchKeywords(sec.keywords, searchQuery));
  }, [sections, searchQuery]);

  const handleSearch = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  return (
    <SettingsSearchContext.Provider
      value={{
        searchQuery,
        isPending,
        filteredSections,
        onSearch: handleSearch,
      }}
    >
      {children}
    </SettingsSearchContext.Provider>
  );
};

/**
 * Search input field updating the context query state.
 * @returns A fully styled input bound to the search context.
 */
export const SettingsSearchInput: React.FC<{ placeholder?: string }> = ({
  placeholder = "Rechercher un paramètre...",
}) => {
  const { onSearch } = useSettingsSearch();

  return (
    <div className="relative w-full shrink-0 mt-4 sm:mt-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-9 h-9 w-full bg-background rounded-full"
      />
    </div>
  );
};

/**
 * Renders the filtered settings sections and their corresponding items.
 * @returns A fragmented list of section UI components.
 */
export const SettingsSearchList: React.FC = () => {
  const { filteredSections, isPending } = useSettingsSearch();

  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        isPending && "opacity-50",
      )}
    >
      {filteredSections.map((section, index) => (
        <div className="space-y-4" key={section.label}>
          {index !== 0 && <Separator className="my-5" />}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {section.label}
            </h2>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.title} className="flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                        item.color || "bg-amber-500",
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="w-full flex items-start justify-between">
                      <div className="space-y-1 max-w-md">
                        <h3 className="text-sm font-medium leading-none">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.action && <div>{item.action}</div>}
                    </div>
                  </div>
                  <div className="pl-13">{item.content}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ))}

      {filteredSections.length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-8">
          Aucun paramètre trouvé.
        </p>
      )}
    </div>
  );
};

/**
 * Normalizes a string by converting to lowercase and stripping accents.
 * @param text - The string to normalize.
 * @returns Clean normalized string for search indexing.
 */
const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Matches a search query against target text using normalized comparison.
 * @param keywords - Target text containing searchable terms.
 * @param query - Raw user search input.
 * @returns True if the target text contains the search query.
 */
const matchKeywords = (keywords: string, query: string): boolean => {
  if (!query.trim()) return true;
  return normalizeText(keywords).includes(normalizeText(query));
};
