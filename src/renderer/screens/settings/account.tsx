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
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import {
  School,
  Activity,
  User2,
  ShieldCheck,
  Database,
  Clock,
  Save,
  Building2,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";

export const AccountPage = () => {
  // États simulés pour l'école
  const [schoolName, setSchoolName] = useState("Complexe Scolaire Belle Vue");
  const [province, setProvince] = useState("Kongo Central");
  const [schoolCode, setSchoolCode] = useState("994821-B");

  // Données de session immuables (système)
  const sessionInfo = {
    currentUser: "Directeur Administratif",
    role: "Super-Administrateur",
    loginTime: "22/06/2026 — 08:30",
    dbStatus: "Optimisée (SQLite Locale)",
  };

  const handleSaveSettings = () => {
    console.log("Données de l'établissement sauvegardées.");
  };

  // Fonctions de gestion de la base de données (Interactions Electron futures)
  const handleBackupDatabase = () => {
    console.log("Lancement de la sauvegarde de la base de données locale...");
    // Ici vous appellerez votre IPC Electron pour copier le fichier de base de données
  };

  const handleRestoreDatabase = () => {
    console.log(
      "Ouverture de la boîte de dialogue pour restaurer une sauvegarde...",
    );
    // Ici vous appellerez votre IPC Electron pour charger un fichier externe
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 selection:bg-primary/10">
      <main className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* En-tête principal */}
        <div className="border-b border-border pb-6 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <School className="size-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Établissement & Session
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Gérez l'identité officielle de votre école pour les rapports et
            suivez les paramètres de votre session active.
          </p>
        </div>

        {/* Grid de contenu principal : Profil & Session */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1 : Infos Établissement (Prend 2 colonnes) */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-xs md:col-span-2 flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="size-4.5 text-primary" />
                <div>
                  <CardTitle className="text-sm font-bold">
                    Profil de l'École
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ces informations apparaîtront sur les listes d'examens et
                    fiches d'émargement générées.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="school-name" className="text-xs font-medium">
                  Nom de l'établissement
                </Label>
                <Input
                  id="school-name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="province" className="text-xs font-medium">
                    Province Éducationnelle
                  </Label>
                  <Input
                    id="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="school-code" className="text-xs font-medium">
                    Code Éditeur / ID National
                  </Label>
                  <Input
                    id="school-code"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    className="text-xs font-mono h-9"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  className="gap-1.5 text-xs h-9 font-medium"
                  onClick={handleSaveSettings}
                >
                  <Save className="size-3.5" />
                  Sauvegarder les modifications
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 : Métriques de la session active (Prend 1 colonne) */}
          <Card className="border-border/60 bg-card/40 backdrop-blur-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4.5 text-primary" />
                <div>
                  <CardTitle className="text-sm font-bold">
                    Session en cours
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Statut actuel de l'application.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 font-mono text-xs text-muted-foreground">
              <div className="p-3 bg-muted/40 rounded-lg border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                  <User2 className="size-3 text-primary" /> Opérateur Actif
                </span>
                <p className="text-foreground font-bold tracking-tight">
                  {sessionInfo.currentUser}
                </p>
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 font-sans font-medium mt-1"
                >
                  {sessionInfo.role}
                </Badge>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <Clock className="size-3.5" /> Début
                  </span>
                  <span className="text-foreground text-right text-[11px]">
                    {sessionInfo.loginTime}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <Database className="size-3.5" /> Structure
                  </span>
                  <span className="text-emerald-500 font-bold text-[11px]">
                    {sessionInfo.dbStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> Sécurité
                  </span>
                  <Badge
                    className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px] px-1 py-0 font-sans font-medium"
                    variant="outline"
                  >
                    Local-First
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3 : NOUVELLE SECTION - Sauvegarde & Import Base de Données */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="size-4.5 text-primary" />
              <div>
                <CardTitle className="text-sm font-bold">
                  Maintenance & Sauvegarde des données
                </CardTitle>
                <CardDescription className="text-xs">
                  Exportez une copie de sécurité complète ou restaurez vos
                  élèves et examens à partir d'un fichier externe.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carte Export */}
              <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">
                    Créer une copie de sauvegarde
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Génère un snapshot sécurisé contenant l'intégralité des
                    configurations et des listes d'élèves de l'établissement.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs font-medium w-full sm:w-auto self-start"
                  onClick={handleBackupDatabase}
                >
                  <Download className="size-3.5" />
                  Exporter la base (.tchik / .sqlite)
                </Button>
              </div>

              {/* Carte Import */}
              <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">
                    Restaurer des données existantes
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Remplace ou fusionne la base locale actuelle avec un fichier
                    de sauvegarde précédemment créé.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 gap-1.5 text-xs font-medium w-full sm:w-auto self-start"
                  onClick={handleRestoreDatabase}
                >
                  <Upload className="size-3.5" />
                  Importer une sauvegarde
                </Button>
              </div>
            </div>

            {/* Warning d'avertissement de sécurité */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5 text-amber-500">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <strong>Attention :</strong> L'importation d'une ancienne base
                de données écrase les données actuelles de la session. Veillez à
                exporter votre travail en cours avant d'exécuter une
                restauration.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
