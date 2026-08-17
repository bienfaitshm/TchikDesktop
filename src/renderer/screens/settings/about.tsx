import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Button } from "@/renderer/components/ui/button";
import { Badge } from "@/renderer/components/ui/badge";
import {
  Globe,
  Heart,
  User,
  ExternalLink,
  Scale,
  GraduationCap,
  Users,
  CreditCard,
  FileCheck,
  FileText,
  RefreshCw,
  Code2,
} from "lucide-react";
import icon from "@/renderer/assets/icon.svg";
import {
  PageContainer,
  PageContent,
} from "@/renderer/containers/page-container";

/**
 * Safely opens an external URL via Electron shell or browser window fallback.
 * @param url - The target URL string to be opened.
 */
export function openExternalUrl(url: string): void {
  if (window.electron?.shell) {
    window.electron.shell.openExternal(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * Interface representing a core application feature item.
 */
interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CORE_FEATURES: FeatureItem[] = [
  {
    title: "Gestion des élèves",
    description:
      "Une base de données claire, centralisée et facile à mettre à jour.",
    icon: GraduationCap,
  },
  {
    title: "Gestion des tuteurs",
    description:
      "Association des élèves à leurs responsables légaux pour un suivi complet.",
    icon: Users,
  },
  {
    title: "Paiements & Facturation",
    description:
      "Gestion des encaissements et impression physique des reçus et factures.",
    icon: CreditCard,
  },
  {
    title: "Moteur d'examens",
    description:
      "Placement automatique des élèves. Zéro conflit, planification optimisée.",
    icon: FileCheck,
  },
  {
    title: "Génération de documents",
    description:
      "Listes d'émargement, convocations et plans de salle générés automatiquement.",
    icon: FileText,
  },
  {
    title: "Interopérabilité",
    description:
      "Import/Export fluide pour communiquer avec vos autres logiciels.",
    icon: RefreshCw,
  },
];

/**
 * Component rendering the About page with app details, core features, author, and licensing.
 * @returns The rendered React element for the About view.
 */
export function AboutPage(): React.ReactElement {
  const [appVersion, setAppVersion] = useState<string>("1.0.0-alpha");

  useEffect(() => {
    if (window.electron?.getAppVersion) {
      window.electron.getAppVersion().then(setAppVersion);
    }
  }, []);

  return (
    <PageContainer>
      <PageContent>
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 selection:bg-primary/10">
          <main className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* App Header */}
            <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-border">
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-muted border border-border shadow-xs p-3 shrink-0">
                <img
                  src={icon}
                  alt="Tchik Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h1 className="text-4xl font-extrabold tracking-tight">
                    Tchik
                  </h1>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {appVersion}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-md max-w-xl text-justify">
                  Tchik est la solution open source qui réinvente la gestion
                  administrative scolaire. Conçue pour les non-experts, elle
                  automatise les tâches chronophages comme la préparation des
                  examens, la génération des listes d'émargement et la création
                  de documents officiels. Sécurisée en local et sans dépendance
                  internet, Tchik réduit les erreurs, simplifie votre quotidien
                  et vous offre une liberté totale sur vos données. Gagnez en
                  efficacité, sans formation technique.
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      openExternalUrl(
                        "https://github.com/bienfaitshm/TchikDesktop",
                      )
                    }
                  >
                    <Code2 className="size-4" />
                    Code Source GitHub
                  </Button>

                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      openExternalUrl(
                        "https://github.com/bienfaitshm/TchikDesktop/releases",
                      )
                    }
                  >
                    <Globe className="size-4" />
                    Vérifier les mises à jour
                  </Button>
                </div>
              </div>
            </div>

            {/* Core Features Pillars */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">
                Les piliers de votre productivité
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CORE_FEATURES.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card
                      key={feature.title}
                      className="border-border/60 bg-card/40 backdrop-blur-xs"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <IconComponent className="size-4 text-primary shrink-0" />
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Author Section */}
            <Card className="border-border/60 bg-card/40 backdrop-blur-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Auteur & Projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-bold">Bienfait Shomari</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Développeur principal passionné par la création d'outils
                  durables, libres et centrés sur l'humain pour l'éducation.
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-primary gap-1"
                  onClick={() =>
                    openExternalUrl("https://github.com/bienfaitshm")
                  }
                >
                  Visiter le profil GitHub <ExternalLink className="size-3" />
                </Button>
              </CardContent>
            </Card>

            {/* Special Thanks */}
            <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <Heart className="size-32 text-primary" fill="currentColor" />
              </div>
              <CardContent className="pt-3 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  Remerciements Spéciaux
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Un immense merci à{" "}
                  <span className="font-semibold text-foreground">
                    Mme. Mwange Kayumba
                  </span>
                  ,{" "}
                  <span className="font-semibold text-foreground">
                    Mr. Vanglodi Zengu
                  </span>
                  ,{" "}
                  <span className="font-semibold text-foreground">
                    ADM. Kabwit Malonga Josué
                  </span>
                  ,{" "}
                  <span className="font-semibold text-foreground">
                    Promoteur Malonga Kabwit pascal
                  </span>
                  ,{" "}
                  <span className="font-semibold text-foreground">
                    Mr. Yves Kalonda
                  </span>
                  ,{" "}
                  <span className="font-semibold text-foreground">
                    Hope Kyungu
                  </span>{" "}
                  et au{" "}
                  <span className="font-semibold text-foreground">
                    Pasteur Sylvain Kilinda
                  </span>{" "}
                  pour leur contribution précieuse, leur soutien inestimable et
                  leur engagement envers le projet{" "}
                  <span className="font-medium text-foreground">Tchik</span>.
                  Les grandes idées ne prennent vie que lorsqu'elles sont
                  portées par des personnes d'exception.
                </p>
              </CardContent>
            </Card>

            {/* License Info */}
            <Card className="border-border/60 bg-card/30 backdrop-blur-xs">
              <CardContent className="pt-4 flex items-start gap-3">
                <Scale className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Licence logicielle
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ce programme est un logiciel libre : vous pouvez le
                    redistribuer et/ou le modifier selon les termes de la{" "}
                    <span className="font-medium text-foreground">
                      GNU General Public License (GPLv3)
                    </span>{" "}
                    telle que publiée par la Free Software Foundation.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs text-primary gap-1 pt-1"
                    onClick={() =>
                      openExternalUrl(
                        "https://www.gnu.org/licenses/gpl-3.0.html",
                      )
                    }
                  >
                    Consulter la licence GPL v3{" "}
                    <ExternalLink className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>

          {/* Footer */}
          <footer className="max-w-3xl mx-auto mt-16 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground/60 font-mono">
            &copy; {new Date().getFullYear()} — Tchik. Protégé par la licence
            GNU GPL v3.
          </footer>
        </div>
      </PageContent>
    </PageContainer>
  );
}
