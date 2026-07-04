import React from "react";
import {
  Layers,
  ArrowLeft,
  Search,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Progress } from "@/renderer/components/ui/progress"; // Remplacer par un div si composant inexistant
import { Badge } from "@/renderer/components/ui/badge";

const FIN = { DASHBOARD: "/dashboard" };

const classroomsData = [
  {
    name: "3ème Primaire A",
    totalStudents: 32,
    collected: 4800,
    expected: 6000,
    percentage: 80,
  },
  {
    name: "6ème Primaire B",
    totalStudents: 28,
    collected: 2100,
    expected: 4200,
    percentage: 50,
  },
  {
    name: "1ère Secondaire B",
    totalStudents: 35,
    collected: 8900,
    expected: 9500,
    percentage: 93,
  },
  {
    name: "Maternelle C",
    totalStudents: 20,
    collected: 1200,
    expected: 4000,
    percentage: 30,
  },
];

export function ClassroomsFinPage() {
  return (
    <div className="min-h-screen font-sans bg-background text-foreground p-6 lg:p-8 container mx-auto space-y-8">
      <div className="space-y-1">
        <a
          href={FIN.DASHBOARD}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </a>
        <h1 className="text-3xl font-bold tracking-tight">
          Recouvrement par Classe
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivez les objectifs financiers et la performance de perception de
          chaque classe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classroomsData.map((cls, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center border border-border">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground leading-tight">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cls.totalStudents} Élèves enregistrés
                  </p>
                </div>
              </div>
              <Badge
                className={
                  cls.percentage >= 80
                    ? "bg-emerald-500/10 text-emerald-600 border-0"
                    : "bg-amber-500/10 text-amber-600 border-0"
                }
              >
                {cls.percentage >= 80 ? (
                  <CheckCircle className="w-3 h-3 mr-1 inline" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1 inline" />
                )}
                {cls.percentage}% Atteint
              </Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Encaissé:{" "}
                  <span className="font-mono text-foreground font-bold">
                    ${cls.collected}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Objectif:{" "}
                  <span className="font-mono text-foreground">
                    ${cls.expected}
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${cls.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
