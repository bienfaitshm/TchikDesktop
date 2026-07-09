import { useState } from "react";
import { Button } from "@/renderer/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";

type ErrorPageProps = {
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
};

export const ErrorPage = ({ error, onRetry, onGoHome }: ErrorPageProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyDetails = () => {
    if (!error) return;
    navigator.clipboard.writeText(
      `${error.name}: ${error.message}\n${error.stack || ""}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Illustration / Icône Graphique Moderne */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5 animate-pulse">
          <AlertTriangle className="h-8 w-8" />
        </div>

        {/* Textes Principaux */}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Une erreur est survenue
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-sm">
          L'application a rencontré un problème inattendu. Veuillez réessayer
          l'action ou retourner à l'accueil.
        </p>

        {/* Actions Principales */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="gap-2 w-full sm:w-auto shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="outline"
              className="gap-2 w-full sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          )}
        </div>

        {/* Section Détails Techniques (Divulgation progressive pour Pro/Dev) */}
        {error && (
          <div className="mt-10 w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden text-left transition-all shadow-sm">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between p-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <span>Détails techniques pour le support</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showDetails && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-950/40 font-mono text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 relative group">
                <button
                  onClick={handleCopyDetails}
                  className="absolute top-3 right-3 p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-50"
                  title="Copier les détails"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <div className="font-semibold text-destructive mb-1">
                  {error.name}
                </div>
                <div className="break-all">{error.message}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
