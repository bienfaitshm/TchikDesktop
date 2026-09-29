import { useEffect, useState, useRef } from "react";
import { Button } from "@/renderer/components/ui/button";
import { RefreshCw, Home, Copy, Check, BotOff } from "lucide-react";
import tchikLogo from "@/renderer/assets/icon.svg";
import { WindowControls } from "../components/win-title-bar";
/**
 * Props for the ErrorPage component.
 */
interface ErrorPageProps {
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
}

/**
 * Renders a secure error page displaying an illustration and action buttons.
 * Hides technical details and copy functionality in production environments.
 * @param props - Component properties containing the error object and navigation callbacks.
 * @returns The React component to render the error page.
 */
export const ErrorPage = ({ error, onRetry, onGoHome }: ErrorPageProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const lastLoggedError = useRef<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (error && error !== lastLoggedError.current) {
      window.application?.sendErrorLog?.(error);
      lastLoggedError.current = error;
    }
  }, [error]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /**
   * Copies the technical error details to the clipboard and triggers a temporary success state.
   */
  const handleCopyDetails = () => {
    if (!error) return;
    navigator.clipboard.writeText(
      `${error.name}: ${error.message}\n${error.stack || ""}`,
    );
    setIsCopied(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950 p-8">
      <div className="absolute top-4 right-8">
        <WindowControls />
      </div>
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        {/* Left Column: Error Details */}
        <div className="flex flex-col max-w-lg text-left">
          <div className="mb-6 flex items-center gap-4">
            <img src={tchikLogo} alt="LOGO TCHIK" className="size-10" />
            <span className="text-2xl font-bold text-primary dark:text-primary tracking-tight">
              Tchik
            </span>
          </div>

          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Erreur.{" "}
            <span className="font-normal text-zinc-500">
              Un problème est survenu.
            </span>
          </h1>

          {!isProduction && error ? (
            <div className="mb-8 text-sm text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md relative group border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopyDetails}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-100"
                title="Copier les détails"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <p className="break-all pr-8">
                L'action demandée a échoué : {error.message}
              </p>
              <p className="mt-4 text-zinc-400">
                C'est tout ce que nous savons.
              </p>
            </div>
          ) : (
            <div className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                L'action demandée a échoué en raison d'une erreur système
                inattendue. Notre équipe a été notifiée du problème.
              </p>
              <p className="mt-4 text-zinc-400">
                C'est tout ce que nous savons.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="rounded-full px-4 gap-2 w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
            {onGoHome && (
              <Button
                onClick={onGoHome}
                variant="outline"
                className="rounded-full px-4 gap-2 w-full sm:w-auto"
              >
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-800">
          <BotOff className="h-64 w-64 stroke-[0.5]" />
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
