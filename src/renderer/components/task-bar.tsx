import { Terminal, Wifi, CheckCircle2, ChevronUp, Bell } from "lucide-react";

export function TaskBar() {
  return (
    <footer className="h-6 w-full bg-[#22863a] text-white flex items-center justify-between px-3 text-[11px] select-none z-100 shrink-0">
      {/* Gauche */}
      <div className="flex items-center gap-4 h-full">
        <button className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full transition-colors cursor-default">
          <Terminal size={12} />
          <span className="font-medium">Terminal</span>
        </button>
        
        <div className="flex items-center gap-1.5 px-2 opacity-90">
          <CheckCircle2 size={12} />
          <span>Prêt</span>
        </div>
      </div>

      {/* Droite */}
      <div className="flex items-center h-full">
        <div className="px-3 hover:bg-white/10 h-full flex items-center cursor-default gap-2">
          <span>UTF-8</span>
        </div>
        
        <div className="px-3 hover:bg-white/10 h-full flex items-center cursor-default gap-1.5">
          <Wifi size={12} />
          <span>Stable</span>
        </div>

        <button className="px-2 hover:bg-white/10 h-full flex items-center">
          <Bell size={12} />
        </button>
        
        <button className="px-2 hover:bg-white/10 h-full">
          <ChevronUp size={14} />
        </button>
      </div>
    </footer>
  );
}