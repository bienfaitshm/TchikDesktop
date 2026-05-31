"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  FileText,
  Globe,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/renderer/utils"; // Optionnel : remplace par ta fonction utilitaire ou string classique

export function AdvancedSearchEngine() {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // États pour la recherche approfondie
  const [advancedFilters, setAdvancedFilters] = useState({
    allWords: "",
    exactPhrase: "",
    excludeWords: "",
    siteOrDomain: "",
    fileType: "all",
    dateRange: "all",
  });

  // Fonction pour réinitialiser les filtres
  const handleReset = () => {
    setAdvancedFilters({
      allWords: "",
      exactPhrase: "",
      excludeWords: "",
      siteOrDomain: "",
      fileType: "all",
      dateRange: "all",
    });
    setSearchQuery("");
  };

  // Simulation de la construction de la requête "à la Google"
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalQuery = searchQuery;

    // Si l'utilisateur a rempli le panneau avancé, on construit la syntaxe Google
    if (isAdvancedOpen) {
      const { allWords, exactPhrase, excludeWords, siteOrDomain, fileType } =
        advancedFilters;
      let parts = [];

      if (allWords) parts.push(allWords);
      if (exactPhrase) parts.push(`"${exactPhrase}"`);
      if (excludeWords)
        parts.push(
          excludeWords
            .split(" ")
            .map((w) => `-${w}`)
            .join(" "),
        );
      if (siteOrDomain) parts.push(`site:${siteOrDomain}`);
      if (fileType !== "all") parts.push(`filetype:${fileType}`);

      finalQuery = parts.join(" ");
    }

    alert(`Requête envoyée au moteur : ${finalQuery}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Formulaire Principal */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-background border border-border rounded-2xl shadow-lg overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
      >
        {/* Barre de Recherche Principale */}
        <div className="flex items-center px-4 py-3.5 gap-3 bg-muted/10">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Rechercher ou taper des opérateurs (ex: site:tshik.cd)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-sm placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
          />

          {/* Bouton Toggle Options Avancées */}
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              isAdvancedOpen
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filtres</span>
          </button>
        </div>

        {/* Panneau de Recherche Approfondie (Animate-in) */}
        {isAdvancedOpen && (
          <div className="border-t border-border p-5 bg-muted/5 space-y-5 animate-in fade-in-50 slide-in-from-top-2 duration-200">
            {/* Section 1 : Syntaxe des mots */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Recherche par mots
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    Tous ces mots
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: rapport annuel finance"
                    value={advancedFilters.allWords}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        allWords: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">
                    Expression exacte
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 'intelligence artificielle'"
                    value={advancedFilters.exactPhrase}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        exactPhrase: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-destructive/90">
                    Aucun de ces mots
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: -formation -cours"
                    value={advancedFilters.excludeWords}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        excludeWords: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:border-destructive/40 focus:ring-1 focus:ring-destructive/40"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 : Filtres de contexte / Métadonnées */}
            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Limiter les résultats
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Site ou Domaine */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Globe className="size-3.5 text-muted-foreground" /> Site ou
                    domaine
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: .edu ou wikipedia.org"
                    value={advancedFilters.siteOrDomain}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        siteOrDomain: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Type de fichier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <FileText className="size-3.5 text-muted-foreground" /> Type
                    de fichier
                  </label>
                  <select
                    value={advancedFilters.fileType}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        fileType: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">Tous les formats</option>
                    <option value="pdf">Document PDF (.pdf)</option>
                    <option value="docx">Microsoft Word (.docx)</option>
                    <option value="xlsx">Microsoft Excel (.xlsx)</option>
                  </select>
                </div>

                {/* Date de mise à jour */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" /> Date
                    de publication
                  </label>
                  <select
                    value={advancedFilters.dateRange}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        dateRange: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">Moins de n'importe quel d'âge</option>
                    <option value="24h">Moins de 24 heures</option>
                    <option value="week">Moins d'une semaine</option>
                    <option value="month">Moins d'un mois</option>
                    <option value="year">Moins d'un an</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Barre d'actions du panneau inférieur */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <HelpCircle className="size-3.5" /> Astuce : utilisez les
                opérateurs directement en haut pour aller plus vite.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  <RotateCcw className="size-3.5" /> Réinitialiser
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Lancer la recherche approfondie
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
