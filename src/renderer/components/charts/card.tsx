import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/renderer/components/ui/card";
import { type PropsWithChildren, type ReactNode } from "react";

// On utilise `ReactNode` pour être plus précis.
// Le nom des types de props se termine souvent par `Props`.
type ChartCardProps = {
    header: ReactNode;
    footer: ReactNode;
};

// On peut utiliser la syntaxe de fonction classique pour une meilleure lisibilité.
// L'inférence de type fonctionne bien avec cette approche.
export function ChartCard({ header, footer, children }: PropsWithChildren<ChartCardProps>) {
    return (
        <Card>
            {header}
            <CardContent>{children}</CardContent>
            {footer}
        </Card>
    );
}

// On peut rendre le composant plus générique en permettant l'affichage de n'importe quel élément React.
type ChartHeaderProps = {
    title: ReactNode;
    description?: ReactNode;
};

// Utilisation de la syntaxe `function`
export function ChartHeader({ title, description }: ChartHeaderProps) {
    return (
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
    );
}

// On renomme le composant pour qu'il soit plus générique.
// On ajoute des props pour rendre les textes dynamiques.
type ChartFooterProps = {
    trendingText: string;
    visitorsText: string;
};

// Utilisation d'une fonction pour le composant, plus simple.
export function ChartFooter({ trendingText, visitorsText }: ChartFooterProps) {
    return (
        <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">{trendingText}</div>
            <div className="text-muted-foreground leading-none">{visitorsText}</div>
        </CardFooter>
    );
}