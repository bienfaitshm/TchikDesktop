// vite.config.ts

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { type UserConfig } from "vite";
import { type VitestUserConfig } from "vitest/config";

/**
 * Configuration de base pour un projet TypeScript utilisant Vite.
 *
 * @see https://vitejs.dev/config/
 */
export default defineConfig(
  (): UserConfig => ({
    // --- PLUGINS ---
    /**
     * Liste des plugins utilisés par Vite.
     */
    plugins: [
      /**
       * tsconfigPaths: Permet à Vite et Vitest de résoudre les alias définis dans tsconfig.json (ex: '@/components').
       * C'est essentiel pour maintenir des chemins d'importation propres et absolus.
       * @see https://github.com/aleclarson/vite-tsconfig-paths
       */
      tsconfigPaths(),
    ],

    // --- VITEST CONFIGURATION ---
    /**
     * Configuration dédiée à Vitest pour les tests unitaires et d'intégration.
     * Cette section est fusionnée automatiquement si Vitest est installé.
     * @see https://vitest.dev/config/
     */
    test: {
      /**
       * globals: Active l'API des tests unitaires (describe, it, expect) globalement
       * sans avoir besoin d'importer l'API dans chaque fichier de test.
       */
      globals: true,

      /**
       * environment: Définit l'environnement d'exécution des tests. 'node' est utilisé
       * pour les tests backend/services sans dépendance au DOM (comme Sequelize).
       */
      environment: "node",

      /**
       * setupFiles: Fichiers à exécuter avant chaque suite de tests (pour la configuration
       * de mocks globaux, connexions DB, ou l'initialisation de variables d'environnement).
       * Exemple: ['./vitest.setup.ts']
       */
      setupFiles: [],

      /**
       * include: Modèles de fichiers à considérer comme des tests.
       */
      include: ["**/*.test.ts"],

      // --- COUVERTURE DE CODE (COVERAGE) ---
      /**
       * Configuration pour la couverture de code.
       * Utilise le moteur v8 (rapide et intégré).
       */
      coverage: {
        enabled: true,
        provider: "v8", // Moteur de couverture (v8 ou istanbul)
        reporter: ["text", "json", "html"], // Formats de rapport à générer
        // Seuils minimaux pour la qualité du code
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        // Dossiers/fichiers à exclure de l'analyse de couverture
        exclude: [
          "node_modules/",
          "dist/",
          "coverage/",
          "**/__tests__/",
          "**/vitest.setup.ts",
        ],
        // Dossiers/fichiers à inclure dans l'analyse de couverture
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },

      /**
       * poolOptions: Options avancées pour l'exécution des tests en parallèle.
       * (Non nécessaire pour un petit projet, mais bon pour la complétude).
       */
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
    } as VitestUserConfig["test"], // Cast pour assurer la compatibilité TypeScript
  })
);
