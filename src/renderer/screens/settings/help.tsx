import React from "react";
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
  BookOpen,
  HelpCircle,
  FileText,
  Users,
  GraduationCap,
  ExternalLink,
  LifeBuoy,
  ChevronRight,
  Sheet,
  File,
  FileJson,
} from "lucide-react";

// Sous-composant : Formats de fichiers supportés
export const FileFormatsSection = () => {
  const formats = [
    {
      type: "Excel (.xlsx)",
      icon: <Sheet className="size-5 text-emerald-500" />,
      usage: "Importation & Rapports",
      description:
        "Idéal pour importer massivement les listes d'élèves existantes ou exporter des rapports financiers et statistiques complexes.",
      badge: "Entrée / Sortie",
    },
    {
      type: "CSV (.csv)",
      icon: <Sheet className="size-5 text-teal-500" />,
      usage: "Interopérabilité rapide",
      description:
        "Format universel ultra-léger pour échanger rapidement des données structurées avec d'autres logiciels scolaires tiers.",
      badge: "Entrée / Sortie",
    },
    {
      type: "PDF (.pdf)",
      icon: <FileText className="size-5 text-rose-500" />,
      usage: "Impression & Distribution",
      description:
        "Le format final non modifiable utilisé pour générer les cartes d'examens, les listes d'émargement officielles et les bulletins.",
      badge: "Sortie uniquement",
    },
    {
      type: "Word (.docx)",
      icon: <File className="size-5 text-blue-500" />,
      usage: "Modèles de documents",
      description:
        "Génération de lettres officielles ou de convocations à partir de templates modifiables par l'administration.",
      badge: "Sortie uniquement",
    },
    {
      type: "JSON (.json)",
      icon: <FileJson className="size-5 text-amber-500" />,
      usage: "Sauvegarde & Configuration",
      description:
        "Format technique utilisé pour les sauvegardes intégrales du système, les configurations d'examens et la portabilité locale.",
      badge: "Système & Backup",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">
          Formats de fichiers supportés
        </h2>
        <p className="text-xs text-muted-foreground">
          Tchik interagit avec les standards du marché pour vous garantir une
          indépendance totale de vos données.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formats.map((format, index) => (
          <Card
            key={index}
            className="border-border/60 bg-card/30 backdrop-blur-xs hover:bg-card/50 transition-all"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-muted rounded-lg border border-border/40">
                    {format.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">
                      {format.type}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium text-primary/80">
                      {format.usage}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono font-normal"
                >
                  {format.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {format.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Initialisation de la promesse (stable, hors du composant pour React 19)
const versionPromise =
  window.electron?.getAppVersion() ?? Promise.resolve("1.0.0-alpha");

// Composant Principal : Page d'aide
export const HelpPage = () => {
  const version = React.use(versionPromise);

  const openInBrowser = (url: string) => {
    if (window.electron && window.electron.shell) {
      window.electron.shell.openExternal(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 selection:bg-primary/10">
      <main className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        {/* En-tête du Centre d'Assistance */}
        <div className="space-y-2 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <LifeBuoy className="size-6 animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Centre d'Assistance Tchik
            </h1>
          </div>
          <p className="text-muted-foreground text-md max-w-2xl">
            Trouvez des réponses à vos questions et apprenez à maîtriser la
            gestion administrative et le moteur d'examens de votre
            établissement.
          </p>
        </div>

        {/* Section 1 : Prise en main rapide (Les Piliers) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            Guides d'utilisation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/60 bg-card/40 backdrop-blur-xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <Users className="size-5 text-primary mb-1" />
                <CardTitle className="text-base">
                  Gestion Émarge/Élèves
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Apprenez à importer vos fichiers Excel, à centraliser les
                  fiches d'élèves et à mettre à jour la base de données en un
                  clic.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/40 backdrop-blur-xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <GraduationCap className="size-5 text-primary mb-1" />
                <CardTitle className="text-base">Moteur d'Examens</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Planifiez vos sessions d'examens et laissez Tchik gérer
                  automatiquement le placement des élèves sans aucun conflit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/40 backdrop-blur-xs hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <FileText className="size-5 text-primary mb-1" />
                <CardTitle className="text-base">Génération de Docs</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Générez instantanément des listes de présence, des
                  convocations et des plans de salle professionnels prêts à
                  l'impression.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 2 : FAQ (Foire Aux Questions) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            Questions Fréquentes (FAQ)
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border/60 bg-card/20 space-y-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ChevronRight className="size-4 text-primary shrink-0" />
                Mes données scolaires sont-elles envoyées sur internet ?
              </h3>
              <p className="text-xs text-muted-foreground pl-6 leading-relaxed">
                Non. Tchik fonctionne entièrement{" "}
                <strong>hors ligne (Local-First)</strong>. Toutes les
                informations concernant vos élèves, vos notes et vos examens
                restent stockées de manière sécurisée sur votre propre
                ordinateur.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border/60 bg-card/20 space-y-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ChevronRight className="size-4 text-primary shrink-0" />
                Quels formats de fichiers puis-je importer ou exporter ?
              </h3>
              <p className="text-xs text-muted-foreground pl-6 leading-relaxed">
                Tchik offre une interopérabilité fluide. Vous pouvez importer
                vos listes existantes au format <strong>.csv</strong> ou Excel,
                et exporter vos documents générés en formats prêts à l'emploi.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border/60 bg-card/20 space-y-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ChevronRight className="size-4 text-primary shrink-0" />
                L'application est-elle payante ou limitée dans le temps ?
              </h3>
              <p className="text-xs text-muted-foreground pl-6 leading-relaxed">
                Absolument pas. Tchik est un projet{" "}
                <strong>open source sous licence GPLv3</strong>. Il n'y a aucun
                frais caché, aucun abonnement, ni aucune restriction sur le
                nombre d'élèves ou d'établissements gérés.
              </p>
            </div>
          </div>
        </div>

        {/* Section Intermédiaire : Formats de fichiers intégrés */}
        <FileFormatsSection />

        {/* Section 3 : Support Communautaire / Technique */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold">
                Un problème technique ou une idée de fonctionnalité ?
              </h3>
              <p className="text-xs text-muted-foreground">
                En tant que projet open source, vous pouvez soumettre un ticket
                d'anomalie ou proposer des améliorations directement sur notre
                plateforme.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2 shrink-0 shadow-xs"
              onClick={() =>
                openInBrowser(
                  "https://github.com/bienfaitshm/TchikDesktop/issues",
                )
              }
            >
              Ouvrir un ticket sur GitHub
              <ExternalLink className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer minimal avec Version dynamique via React.use */}
      <footer className="max-w-4xl mx-auto mt-16 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60 font-mono">
        <div>&copy; {new Date().getFullYear()} — Tchik Help Desk</div>
        <div className="flex items-center gap-2">
          <span>Version actuelle :</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 font-mono bg-muted/50"
          >
            v{version}
          </Badge>
        </div>
      </footer>
    </div>
  );
};
