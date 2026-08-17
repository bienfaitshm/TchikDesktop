import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import { Plus, Search, Building2, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/renderer/components/ui/input-group";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import { useGetSchools } from "@/renderer/libs/queries/schools";
import {
  SchoolCreationForm,
  useSchoolNavigationAndSelection,
} from "./school.new-school";
import { APP_ROUTES } from "@/renderer/constants";

export const SchoolConfigPage: React.FC = () => {
  const onSetSchool = useSchoolNavigationAndSelection();
  const { data: schools = [] } = useGetSchools();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;
    const query = searchQuery.toLowerCase();
    return schools.filter(
      (school) =>
        school.name.toLowerCase().includes(query) ||
        school.town.toLowerCase().includes(query),
    );
  }, [schools, searchQuery]);

  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center mx-auto min-h-100">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
          <Building2 className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Aucun établissement
        </h2>
        <p className="text-xs text-muted-foreground mt-1 mb-6">
          Vous n'avez pas encore d'établissement enregistré. Créez-en un pour
          commencer à configurer votre espace.
        </p>
        <SchoolCreationForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header avec action principale */}
      <div className="flex flex-col sm:flex-row justify-between items-end-safe gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Établissements</h1>
          <p className="text-xs text-muted-foreground">
            Sélectionnez un établissement pour accéder à son espace de travail.
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center justify-between">
        <div className="max-w-sm">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Rechercher par nom ou ville..."
              className="placeholder:text-xs text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>
        <Button
          title="Ajouter un établissement"
          variant="outline"
          size="icon-lg"
          className="rounded-full text-xs"
          asChild
        >
          <Link to={APP_ROUTES.CONFIGURATION.SCHOOL_NEW}>
            <Plus data-icon="inline-start" />
          </Link>
        </Button>
      </div>

      {/* Grille des établissements */}
      {filteredSchools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.map((school) => (
            <Card
              key={school.schoolId}
              className="group relative cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all duration-200"
              onClick={() => onSetSchool(school)}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                <div className="w-full flex items-center gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 />
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="w-full flex items-center justify-between">
                      <CardTitle className="text-xs capitalize group-hover:text-primary transition-colors truncate text-wrap">
                        {school.name.toLocaleLowerCase()}
                      </CardTitle>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs mt-0.5">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{school.town}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {school.address && (
                <CardContent className="pt-0">
                  <Badge
                    variant="outline"
                    className="font-normal text-[11px] text-muted-foreground truncate max-w-full"
                  >
                    {school.address}
                  </Badge>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        /* Résultat de recherche vide */
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">
            Aucun établissement ne correspond à votre recherche "{searchQuery}".
          </p>
        </div>
      )}
    </div>
  );
};
