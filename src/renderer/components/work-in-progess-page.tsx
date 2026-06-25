import { Construction } from "lucide-react";

export default function WorkInProgressPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/10">
      {/* Container Principal Épuré */}
      <main className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
        {/* Zone Icône / Badge animé */}
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-muted border border-border text-primary shadow-xs">
            <Construction className="w-10 h-10 animate-pulse" />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </div>
          </div>
        </div>

        {/* Textes Principaux */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Page en cours de développement
          </h1>
        </div>
      </main>

      {/* Footer minimaliste */}
      <footer className="mt-auto pt-8 text-xs text-muted-foreground/60 tracking-wide font-mono">
        &copy; {new Date().getFullYear()} - Tchik.
      </footer>
    </div>
  );
}
