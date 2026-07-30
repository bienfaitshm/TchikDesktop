import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Loader2, FileSpreadsheet } from "lucide-react";

export function ButtonExportAnimated() {
  const [status, setStatus] = useState<"idle" | "exporting" | "success">(
    "idle",
  );

  const handleExport = () => {
    if (status !== "idle") return;

    // Simule la préparation et l'export
    setStatus("exporting");

    setTimeout(() => {
      setStatus("success");
    }, 2200);

    setTimeout(() => {
      setStatus("idle");
    }, 4500);
  };

  return (
    <div className="flex justify-between items-center mb-4 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <FileSpreadsheet className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-slate-200">
          Exportation de données
        </h2>
      </div>

      {/* Bouton micro-interactif d'export */}
      <motion.button
        onClick={handleExport}
        disabled={status !== "idle"}
        className="relative flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 overflow-hidden shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        whileHover={{ scale: status === "idle" ? 1.03 : 1 }}
        whileTap={{ scale: status === "idle" ? 0.97 : 1 }}
      >
        {/* Barre de remplissage pendant l'export */}
        {status === "exporting" && (
          <motion.div
            className="absolute inset-0 bg-indigo-500 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: [0.65, 0, 0.35, 1] }}
          />
        )}

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              className="flex items-center gap-1.5 relative z-10"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <motion.div
                animate={{ y: [0, 2, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
              >
                <Download className="w-3.5 h-3.5" />
              </motion.div>
              <span>Exporter</span>
            </motion.div>
          )}

          {status === "exporting" && (
            <motion.div
              key="exporting"
              className="flex items-center gap-2 relative z-10"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Génération du fichier...</span>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              className="flex items-center gap-1.5 relative z-10 text-emerald-400"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Document prêt !</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
