import { cn } from "@/renderer/utils";
import { forwardRef } from "react";
// Importation correcte des types React pour un typage robuste
import type { ComponentProps, ComponentPropsWithoutRef } from "react";

/**
 * @typedef {Object} TypographyProps
 * @property {string} [className] - Classes CSS additionnelles à appliquer au composant, fusionnées avec les classes par défaut.
 */

/**
 * Fonction utilitaire générique pour créer des composants de typographie stylisés.
 * Cette fonction réduit la duplication de code en encapsulant la logique commune
 * de `forwardRef` et l'application des classes via `cn`.
 *
 * @template T - Le type d'élément HTML (par exemple, 'h1', 'p', 'div').
 * @param {T} Component - Le nom de la balise HTML à rendre (par exemple, 'h1', 'p').
 * @param {string} defaultClassNames - Les classes Tailwind CSS par défaut pour le composant.
 * @param {string} displayName - Le nom d'affichage pour le composant React (utile pour le débogage).
 * @returns {React.ForwardRefExoticComponent<React.PropsWithoutRef<React.ComponentProps<T>> & React.RefAttributes<HTMLElementTagNameMap[T]>>} Un composant React "forwardRef".
 */
function createTypographyComponent<T extends keyof HTMLElementTagNameMap>(
    Component: T,
    defaultClassNames: string,
    displayName: string,
) {

    type ComponentPropsToOmitRef = ComponentPropsWithoutRef<T>;

    const TypographyComponent = forwardRef<HTMLElementTagNameMap[T], ComponentPropsToOmitRef>(
        ({ className, ...props }, ref) => {
            return (
                <Component
                    className={cn(defaultClassNames, className)}
                    ref={ref}
                    {...(props as ComponentProps<T>)}
                />
            );
        },
    );

    TypographyComponent.displayName = displayName;
    return TypographyComponent as React.ForwardRefExoticComponent<
        React.PropsWithoutRef<ComponentProps<T>> & React.RefAttributes<HTMLElementTagNameMap[T]>
    >;
}

/**
 * Rend un élément HTML `<h1>` stylisé pour les titres principaux.
 * Il arbore une grande taille de texte, une graisse de police extra-grasse, un espacement serré
 * et une légère bordure inférieure pour une séparation visuelle, avec une marge en bas.
 * Idéal pour les titres de page ou les titres de sections majeures.
 *
 * @component
 * @example
 * <TypographyH1 className="text-blue-600">Bienvenue sur notre application</TypographyH1>
 */
const TypographyH1 = createTypographyComponent(
    "h1",
    "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pb-4 mb-6 leading-tight",
    "TypographyH1",
);

/**
 * Rend un élément HTML `<h2>` avec un style proéminent et semi-gras.
 * Convient pour les titres de sections importantes, avec une bordure inférieure subtile
 * et une marge pour le séparer du contenu suivant.
 *
 * @component
 * @example
 * <TypographyH2>À propos de nous</TypographyH2>
 */
const TypographyH2 = createTypographyComponent(
    "h2",
    "scroll-m-20 text-3xl font-semibold tracking-tight pb-3 mb-5 first:mt-0 leading-snug",
    "TypographyH2",
);

/**
 * Rend un élément HTML `<h3>` avec un style fort et semi-gras.
 * Utile pour les sous-sections ou les blocs de contenu importants, avec un bon espacement.
 *
 * @component
 * @example
 * <TypographyH3>Nos services</TypographyH3>
 */
const TypographyH3 = createTypographyComponent(
    "h3",
    "scroll-m-20 text-2xl font-semibold tracking-tight mb-4 leading-normal",
    "TypographyH3",
);

/**
 * Rend un élément HTML `<h4>` avec une graisse de police normale.
 * Idéal pour les titres mineurs, les titres de cartes ou à l'intérieur de blocs de contenu.
 *
 * @component
 * @example
 * <TypographyH4>Détails du produit</TypographyH4>
 */
const TypographyH4 = createTypographyComponent(
    "h4",
    "scroll-m-20 text-xl font-medium tracking-tight mb-3 leading-snug",
    "TypographyH4",
);

/**
 * Rend un élément HTML `<p>` avec un style de texte de corps standard, une hauteur de ligne confortable
 * et une marge inférieure pour un bon espacement entre les paragraphes.
 * À utiliser pour le texte de paragraphe général.
 *
 * @component
 * @example
 * <TypographyP>Ceci est un paragraphe standard de texte pour votre contenu.</TypographyP>
 */
const TypographyP = createTypographyComponent(
    "p",
    "leading-relaxed mb-4 text-gray-700 dark:text-gray-300",
    "TypographyP",
);

/**
 * Rend un élément HTML `<p>` avec une taille de police plus grande et une couleur de premier plan estompée.
 * Idéal pour le texte introductif ou un paragraphe "lead" qui capte l'attention,
 * avec un espacement généreux et une largeur de ligne contrôlée pour la lisibilité.
 *
 * @component
 * @example
 * <TypographyLead>Découvrez comment nous pouvons transformer votre expérience.</TypographyLead>
 */
const TypographyLead = createTypographyComponent(
    "p",
    "text-xl text-muted-foreground mb-8 max-w-prose leading-relaxed font-normal",
    "TypographyLead",
);

/**
 * Rend un élément HTML `<div>` avec une taille de police plus grande et un poids semi-gras.
 * Utile pour accentuer de courtes phrases ou des chiffres importants.
 *
 * @component
 * @example
 * <TypographyLarge>50% de réduction aujourd'hui !</TypographyLarge>
 */
const TypographyLarge = createTypographyComponent(
    "div",
    "text-lg font-semibold mb-2",
    "TypographyLarge",
);

/**
 * Rend un élément HTML `<small>` avec une taille de police plus petite, une graisse de police moyenne
 * et une hauteur de ligne compacte. Généralement utilisé pour les clauses de non-responsabilité,
 * les notes de bas de page ou les informations secondaires.
 *
 * @component
 * @example
 * <TypographySmall>Conditions générales applicables.</TypographySmall>
 */
const TypographySmall = createTypographyComponent(
    "small",
    "text-sm font-medium leading-none text-gray-500 dark:text-gray-400",
    "TypographySmall",
);

/**
 * Rend un élément HTML `<p>` avec une taille de police plus petite et une couleur de premier plan estompée.
 * Excellent pour le texte auxiliaire, les indications ou les informations moins importantes.
 *
 * @component
 * @example
 * <TypographyMuted>Ceci est une note discrète pour le contexte.</TypographyMuted>
 */
const TypographyMuted = createTypographyComponent(
    "p",
    "text-sm text-muted-foreground italic",
    "TypographyMuted",
);

export {
    TypographyH1,
    TypographyH2,
    TypographyH3,
    TypographyH4,
    TypographyP,
    TypographyLead,
    TypographyLarge,
    TypographyMuted,
    TypographySmall,
};