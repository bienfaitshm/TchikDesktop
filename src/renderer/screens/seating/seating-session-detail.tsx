import { MousePointerClick, LayoutDashboard } from "lucide-react";

export const SeatingSessionDetailPage = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center p-8 text-center mt-28">
      <div className="relative mb-6">
        <div className="absolute inset-0 scale-150 bg-primary/5 blur-2xl rounded-full" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-sm">
          <LayoutDashboard className="h-10 w-10 text-primary/80" />
          <MousePointerClick className="absolute -bottom-2 -right-2 h-6 w-6 text-primary animate-bounce" />
        </div>
      </div>

      <div className="max-w-[420px] space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Sélectionnez un local
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Choisissez une salle dans la liste latérale pour visualiser la
          répartition des élèves
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
        <span className="h-[1px] w-8 bg-border" />
        Prêt pour l'assignation
        <span className="h-[1px] w-8 bg-border" />
      </div>
    </div>
  );
};
