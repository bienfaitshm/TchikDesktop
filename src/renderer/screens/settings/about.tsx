import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Button } from "@/renderer/components/ui/button";
import { Badge } from "@/renderer/components/ui/badge";
import { Globe, Heart, User, Layers, ExternalLink, Scale } from "lucide-react";
import icon from "@/renderer/assets/icon.svg";
import React from "react";

const versionPromise =
  window.electron?.getAppVersion() ?? Promise.resolve("1.0.0-alpha");

export function AboutPage() {
  const appVersion = React.use(versionPromise);
  const openInBrowser = (url: string) => {
    if (window.electron && window.electron.shell) {
      window.electron.shell.openExternal(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 selection:bg-primary/10">
      <main className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Entête de l'application */}
        <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-border">
          <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-muted border border-border shadow-xs p-3">
            <img
              src={icon}
              alt="Tchik Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="text-4xl font-extrabold tracking-tight">Tchik</h1>
              <Badge variant="secondary" className="font-mono text-xs">
                {appVersion}
              </Badge>
            </div>
            <p className="text-muted-foreground text-md max-w-xl text-justify">
              Tchik est la solution open source qui réinvente la gestion
              administrative scolaire. Conçue pour les non-experts, elle
              automatise les tâches chronophages comme la préparation des
              examens, la génération des listes d'émargement et la création de
              documents officiels. Sécurisée en local et sans dépendance
              internet, Tchik réduit les erreurs, simplifie votre quotidien et
              vous offre une liberté totale sur vos données. Gagnez en
              efficacité, sans formation technique.
            </p>

            {/* Liens et Actions de support */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  openInBrowser("https://github.com/bienfaitshm/TchikDesktop")
                }
              >
                {/* SVG Officiel de GitHub */}
                <svg
                  className="size-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.48.0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                Code Source GitHub
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  openInBrowser(
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

        {/* Section Spécifications & Auteur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                onClick={() => openInBrowser("https://github.com/bienfaitshm")}
              >
                Visiter le profil GitHub <ExternalLink className="size-3" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/40 backdrop-blur-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 font-mono text-muted-foreground">
              <div>Electron</div>
              <div>React & TypeScript</div>
              <div>Tailwind CSS v4</div>
              <div>Shadcn/ui components</div>
            </CardContent>
          </Card>
        </div>

        {/* Section Remerciements Spéciaux */}
        <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <Heart className="size-32 text-primary" fill="currentColor" />
          </div>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Heart className="size-5 text-destructive" fill="currentColor" />
              Remerciements Spéciaux
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Un immense merci à{" "}
              <span className="font-semibold text-foreground">
                Mwange Kayumba
              </span>
              ,{" "}
              <span className="font-semibold text-foreground">
                Vanglodi Zengu
              </span>
              ,{" "}
              <span className="font-semibold text-foreground">Hope Kyungu</span>{" "}
              et au{" "}
              <span className="font-semibold text-foreground">
                Pasteur Sylvain Kilinda
              </span>{" "}
              pour leur contribution précieuse, leur soutien inestimable et leur
              engagement envers le projet{" "}
              <span className="font-medium text-foreground">Tchik</span>. Les
              grandes idées ne prennent vie que lorsqu'elles sont portées par
              des personnes d'exception.
            </p>
          </CardContent>
        </Card>

        {/* Informations de Licence */}
        <Card className="border-border/60 bg-card/30 backdrop-blur-xs">
          <CardContent className="pt-4 flex items-start gap-3">
            <Scale className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                Licence logicielle
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ce programme est un logiciel libre : vous pouvez le redistribuer
                et/ou le modifier selon les termes de la{" "}
                <span className="font-medium text-foreground">
                  GNU General Public License (GPLv3)
                </span>{" "}
                telle que publiée par la Free Software Foundation.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-primary gap-1 pt-1"
                onClick={() =>
                  openInBrowser("https://www.gnu.org/licenses/gpl-3.0.html")
                }
              >
                Consulter la licence GPL v3 <ExternalLink className="size-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto mt-16 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground/60 font-mono">
        &copy; {new Date().getFullYear()} — Tchik. Protégé par la licence GNU
        GPL v3.
      </footer>
    </div>
  );
}
