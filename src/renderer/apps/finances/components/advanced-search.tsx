"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  User,
  GraduationCap,
  X,
} from "lucide-react";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/renderer/utils";

// Typage des structures de données
interface Student {
  id: string;
  name: string;
  classroom: string;
  code: string;
}

// Données de simulation (Mock Data)
const MOCK_DATA: Student[] = [
  {
    id: "1",
    name: "Idris KABANGE MWAMBA",
    classroom: "5e ELEC",
    code: "2026001",
  },
  {
    id: "2",
    name: "Sarah MUTOMBO KANYNDA",
    classroom: "6e M-P",
    code: "2026002",
  },
  {
    id: "3",
    name: "David KASONGO ILUNGA",
    classroom: "5e ELEC",
    code: "2026003",
  },
  {
    id: "4",
    name: "Glody MWAMBA TSHINU",
    classroom: "3e PRIM A",
    code: "2026004",
  },
];

const CLASSES = ["ALL", "5e ELEC", "6e M-P", "3e PRIM A"] as const;

export function GoogleStyleSearchForm() {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrage intelligent croisé (Query x Classe)
  const results = useMemo(() => {
    if (!query.trim() && selectedClass === "ALL") return [];

    return MOCK_DATA.filter((student) => {
      const matchesQuery =
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.classroom.toLowerCase().includes(query.toLowerCase()) ||
        student.code.includes(query);

      const matchesClass =
        selectedClass === "ALL" || student.classroom === selectedClass;

      return matchesQuery && matchesClass;
    });
  }, [query, selectedClass]);

  // Extraction des classes uniques qui matchent la saisie utilisateur
  const matchedClasses = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return Array.from(new Set(MOCK_DATA.map((s) => s.classroom))).filter(
      (cls) => cls.toLowerCase().includes(lowerQuery),
    );
  }, [query]);

  const hasResults = results.length > 0 || matchedClasses.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-4" ref={containerRef}>
      <FieldGroup>
        <Field className="flex flex-col gap-2 relative">
          <FieldLabel htmlFor="main-search" className="sr-only">
            Rechercher un élève ou une classe
          </FieldLabel>

          {/* Barre de recherche unifiée Style Google */}
          <div
            className={cn(
              "flex items-center bg-background border border-border shadow-md",
              "hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/40",
              "transition-all duration-200 rounded-full px-4 py-1.5 w-full",
              isFocused &&
                hasResults &&
                "rounded-b-none border-b-transparent shadow-md",
            )}
          >
            <InputGroup className="flex-1 items-center border-none shadow-none focus-within:ring-0">
              <InputGroupAddon className="bg-transparent pl-1 pr-3 border-none">
                <Search className="text-muted-foreground size-5" />
              </InputGroupAddon>

              <InputGroupInput
                id="main-search"
                type="text"
                placeholder="Rechercher un élève (nom, code permanent) ou une classe..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Laisse le temps du clic
                className="border-none outline-none bg-transparent shadow-none focus-visible:ring-0 text-base h-10 px-0 placeholder:text-muted-foreground/70"
              />

              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full size-8 shrink-0 mr-1"
                  onClick={() => setQuery("")}
                >
                  <X data-icon="inline-start" />
                </Button>
              )}
            </InputGroup>

            <Separator
              orientation="vertical"
              className="h-6 mx-2 bg-border/80 hidden sm:block"
            />

            {/* Sélecteur de filtre de classe embarqué */}
            <div className="flex items-center gap-1.5 pl-2 shrink-0">
              <SlidersHorizontal className="text-muted-foreground/60 size-3.5 hidden md:block" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-9 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 gap-1.5">
                  <SelectValue placeholder="Filtrer par classe" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl">
                  <SelectItem value="ALL" className="text-xs">
                    Toutes les classes
                  </SelectItem>
                  {CLASSES.filter((c) => c !== "ALL").map((cls) => (
                    <SelectItem key={cls} value={cls} className="text-xs">
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Panneau d'autocomplétion prédictive (Dropdown de résultats instantanés) */}
          {isFocused && hasResults && (
            <div className="absolute top-[53px] inset-x-0 bg-background border border-border border-t-0 shadow-lg rounded-b-2xl z-50 overflow-hidden flex flex-col pt-2 animate-in fade-in-50 duration-100">
              <Separator className="bg-border/40" />

              <div className="max-h-[380px] overflow-y-auto p-2 flex flex-col gap-3">
                {/* Groupe : Classes matchées */}
                {matchedClasses.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                      <GraduationCap className="size-3 text-primary" /> Classes
                      correspondantes
                    </span>
                    {matchedClasses.map((cls) => (
                      <button
                        key={cls}
                        onMouseDown={() => {
                          setQuery(cls);
                          setSelectedClass(cls);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm hover:bg-muted/60 transition-colors w-full font-medium"
                      >
                        <span>{cls}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold"
                        >
                          Filière
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* Séparateur interne si deux types de listes cohabitent */}
                {matchedClasses.length > 0 && results.length > 0 && (
                  <Separator className="bg-border/40" />
                )}

                {/* Groupe : Élèves trouvés */}
                {results.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                      <User className="size-3 text-primary" /> Élèves trouvés (
                      {results.length})
                    </span>
                    {results.map((student) => (
                      <button
                        key={student.id}
                        onMouseDown={() => {
                          setQuery(student.name);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm hover:bg-muted/60 transition-colors w-full"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {student.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Code: {student.code}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs px-2.5 font-medium"
                        >
                          {student.classroom}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Field>
      </FieldGroup>
    </div>
  );
}
