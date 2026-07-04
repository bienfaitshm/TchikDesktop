import React from "react";
import { ArrowLeft, Home, FileQuestion, HelpCircle } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";

// Définition de ton objet de routes pour la redirection
const FIN = {
  DASHBOARD: "/dashboard",
};

export function NotFoundPage() {
  return (
    <div className="min-h-screen font-sans bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      {/* Conteneur d'illustration / Icône */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
          <FileQuestion className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-muted-foreground shadow-xs">
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Code d'erreur discret et chic */}
      <span className="text-xs font-mono font-bold tracking-widest uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-md mb-4">
        Erreur 404
      </span>

      {/* Messages */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page introuvable
      </h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
        Désolé, la page de gestion financière que vous recherchez n'existe pas
        ou a été déplacée. Veuillez vérifier l'URL ou retourner au tableau de
        bord principal.
      </p>

      {/* Actions de navigation */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-medium h-10 px-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Page précédente
        </Button>

        <a href={FIN.DASHBOARD}>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-xs h-10 px-4 w-full sm:w-auto"
          >
            <Home className="w-4 h-4" />
            Tableau de Bord
          </Button>
        </a>
      </div>

      {/* Footer discret */}
      <span className="absolute bottom-6 text-[11px] text-muted-foreground font-mono">
        Système de Gestion Financière Intégré • FinApp
      </span>
    </div>
  );
}
