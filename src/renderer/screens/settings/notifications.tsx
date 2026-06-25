import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Button } from "@/renderer/components/ui/button";
import { Badge } from "@/renderer/components/ui/badge";
import {
  Bell,
  Terminal,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  Server,
  Trash2,
  Download,
  Search,
} from "lucide-react";
import { Input } from "@/renderer/components/ui/input";

interface LogMessage {
  id: string;
  timestamp: string;
  type: "error" | "warning" | "success" | "info" | "server";
  source: "Local DB" | "Moteur Examens" | "Serveur Distant" | "Système";
  message: string;
}

export const NotificationPage = () => {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: "1",
      timestamp: "19:22:04",
      type: "server",
      source: "Serveur Distant",
      message:
        "Synchronisation réussie avec le cluster d'établissement distant.",
    },
    {
      id: "2",
      timestamp: "19:15:32",
      type: "error",
      source: "Moteur Examens",
      message:
        "Conflit détecté : Capacité maximale atteinte pour la Salle B12 (Examen Chimie).",
    },
    {
      id: "3",
      timestamp: "19:02:11",
      type: "success",
      source: "Local DB",
      message:
        "Importation du fichier Excel 'Liste_Eleves_2026.xlsx' finalisée (420 élèves ajoutés).",
    },
    {
      id: "4",
      timestamp: "18:45:00",
      type: "warning",
      source: "Système",
      message:
        "Mode Hors-ligne activé. Les modifications seront mises en cache localement.",
    },
    {
      id: "5",
      timestamp: "18:30:15",
      type: "info",
      source: "Local DB",
      message:
        "Génération automatique du plan de table pour la session d'examens d'État.",
    },
  ]);

  // Filtrage logique des notifications
  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.type === filter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLogStyles = (type: string) => {
    switch (type) {
      case "error":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-500",
          icon: <XCircle className="size-4 shrink-0" />,
        };
      case "warning":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
          icon: <AlertTriangle className="size-4 shrink-0" />,
        };
      case "success":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
          icon: <CheckCircle2 className="size-4 shrink-0" />,
        };
      case "server":
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-500",
          icon: <Server className="size-4 shrink-0" />,
        };
      default:
        return {
          bg: "bg-muted border-border/60 text-muted-foreground",
          icon: <Info className="size-4 shrink-0" />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 selection:bg-primary/10">
      <main className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Bell className="size-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Flux d'Activité & Logs
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Supervisez les journaux système, suivez les réponses réseau du
              serveur et débuggez les requêtes locales.
            </p>
          </div>

          {/* Actions d'export */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <Download className="size-3.5" /> Export .log
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              onClick={() => setLogs([])}
            >
              <Trash2 className="size-3.5" /> Effacer
            </Button>
          </div>
        </div>

        {/* Barre d'outils (Recherche + Filtres) */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrer par texte ou module..."
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Groupes de badges filtres */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: "all", label: "Tout voir" },
              { id: "server", label: "Serveur" },
              { id: "error", label: "Erreurs" },
              { id: "warning", label: "Alertes" },
              { id: "success", label: "Succès" },
            ].map((btn) => (
              <Button
                key={btn.id}
                size="sm"
                variant={filter === btn.id ? "default" : "outline"}
                className="h-8 text-xs font-medium rounded-lg"
                onClick={() => setFilter(btn.id)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Console Box / Flux de Logs */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xs overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/40 border-b border-border/40 py-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-muted-foreground" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Terminal d'événements
              </span>
            </div>
            <Badge
              variant="secondary"
              className="font-mono text-[10px] px-2 py-0"
            >
              {filteredLogs.length} événements affichés
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground italic font-mono">
                — Aucun message ou log ne correspond aux critères actifs —
              </div>
            ) : (
              <div className="divide-y divide-border/30 font-mono text-xs max-h-112.5 overflow-y-auto">
                {filteredLogs.map((log) => {
                  const styles = getLogStyles(log.type);
                  return (
                    <div
                      key={log.id}
                      className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:bg-muted/30 transition-colors"
                    >
                      {/* Badge Temps */}
                      <span className="text-[11px] text-muted-foreground/80 shrink-0">
                        [{log.timestamp}]
                      </span>

                      {/* Label Composant émetteur */}
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono font-medium tracking-tight border-border/60 shrink-0 bg-background/50"
                      >
                        {log.source}
                      </Badge>

                      {/* Corps du message stylisé selon sa criticité */}
                      <div
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border ${styles.bg}`}
                      >
                        {styles.icon}
                        <span className="leading-relaxed tracking-wide">
                          {log.message}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
