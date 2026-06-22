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
import { Switch } from "@/renderer/components/ui/switch";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import {
  Terminal,
  Server,
  Puzzle,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export const DeveloperPage = () => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [serverUrl, setServerUrl] = useState("https://api.tchik-server.local");
  const [isConnecting, setIsConnecting] = useState(false);

  const openInBrowser = (url: string) => {
    if (window.electron && window.electron.shell) {
      window.electron.shell.openExternal(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleConnectServer = () => {
    setIsConnecting(true);
    // Simuler un test de connexion réseau
    setTimeout(() => setIsConnecting(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 selection:bg-primary/10">
      <main className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* En-tête de la zone Développeur */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <Terminal className="size-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Zone Développeur & IT
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-xl">
              Configurez des passerelles réseau vers des bases de données
              distantes, orchestrez vos extensions ou inspectez l'environnement
              local de Tchik.
            </p>
          </div>

          {/* Switch principal d'activation globale */}
          <Card className="flex items-center gap-3 px-4 py-2.5 bg-card/40 border-border/60 backdrop-blur-xs shrink-0 shadow-xs">
            <div className="space-y-0.5">
              <Label
                htmlFor="dev-mode"
                className="text-xs font-bold cursor-pointer"
              >
                Mode Avancé
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Activer les privilèges IT
              </p>
            </div>
            <Switch
              id="dev-mode"
              checked={isDevMode}
              onCheckedChange={setIsDevMode}
            />
          </Card>
        </div>

        {/* État Désactivé : Overlay incitatif */}
        {!isDevMode ? (
          <Card className="border-dashed border-border/80 bg-card/10 backdrop-blur-xs p-12 text-center space-y-4">
            <div className="mx-auto size-12 bg-muted rounded-full flex items-center justify-center border border-border">
              <Code2 className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold">
                Options d'infrastructure verrouillées
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le mode développeur permet de modifier l'architecture de
                stockage et d'exposer des points d'accès API. Activez le bouton
                ci-dessus pour continuer.
              </p>
            </div>
          </Card>
        ) : (
          /* État Activé : Affichage du tableau de bord complet */
          <div className="space-y-6 animate-fade-in">
            {/* Grid : Serveur Distant & Extensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carte 1 : Connexion Serveur Distant */}
              <Card className="border-border/60 bg-card/40 backdrop-blur-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="size-4.5 text-primary" />
                    <CardTitle className="text-sm font-bold">
                      Synchronisation & Serveur Distant
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Passez du stockage Local-First natif à un cluster ou serveur
                    d'établissement centralisé.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="server-url" className="text-xs font-medium">
                      Adresse API du serveur distant
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="server-url"
                        className="text-xs font-mono h-9"
                        placeholder="https://api.votre-ecole.com"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 gap-1 text-xs shrink-0"
                        disabled={isConnecting}
                        onClick={handleConnectServer}
                      >
                        <RefreshCw
                          className={`size-3 ${isConnecting ? "animate-spin" : ""}`}
                        />
                        Tester
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/40 border border-border/40 rounded-lg flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                      <Database className="size-3.5 text-emerald-500" />
                      Statut : Connecté en local (Fallback)
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 font-mono text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                    >
                      Prêt
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Carte 2 : Module d'Extensions / Plugins */}
              <Card className="border-border/60 bg-card/40 backdrop-blur-xs flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Puzzle className="size-4.5 text-primary" />
                    <CardTitle className="text-sm font-bold">
                      Gestionnaire d'Extensions
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Injectez des scripts JavaScript ou des modules spécifiques
                    d'interopérabilité ministérielle.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-dashed border-border/80 rounded-xl p-4 text-center space-y-2 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Aucune extension tierce n'est chargée. Déposez un dossier
                      de plugin ou écrivez un hook personnalisé.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium"
                    >
                      Charger une extension (.zip, .js)
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                    <span>Dossier cible : /resources/plugins</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[10px] text-primary gap-0.5"
                      onClick={() =>
                        openInBrowser(
                          "https://github.com/bienfaitshm/TchikDesktop#un-mot-pour-les-équipes-it",
                        )
                      }
                    >
                      Documentation API <ExternalLink className="size-2.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section Inférieure : Console d'environnement système */}
            <Card className="border-border/60 bg-card/20 backdrop-blur-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="size-4 text-amber-500" />
                  <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                    Variables d'environnement d'exécution
                  </h4>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/80 p-4 rounded-lg font-mono text-[11px] leading-relaxed text-muted-foreground border border-border/40 overflow-x-auto space-y-1">
                  <div>
                    <span className="text-amber-500">process.env.NODE_ENV</span>{" "}
                    = "production"
                  </div>
                  <div>
                    <span className="text-amber-500">process.platform</span> = "
                    {window.navigator.platform}"
                  </div>
                  <div>
                    <span className="text-amber-500">
                      TCHIK_LOCAL_STORAGE_PATH
                    </span>{" "}
                    = "%APPDATA%/Tchik/Local Database/"
                  </div>
                  <div>
                    <span className="text-amber-500">
                      ELECTRON_SECURE_CONTEXT
                    </span>{" "}
                    = "true"
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
