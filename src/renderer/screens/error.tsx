import { Button } from "@/renderer/components/ui/button";
import { TypographyH3, TypographyP, TypographySmall } from "@/renderer/components/ui/typography";

/**
 * Props for the ErrorPage component.
 * @param error Optional error object to display details.
 * @param onRetry Optional function to call when the retry button is clicked.
 */
type ErrorPageProps = {
    error?: Error;
    onRetry?: () => void;
};

/**
 * A simple, centered component to display an error message.
 * It provides an optional retry button and displays error details if available.
 */
const ErrorPage = ({ onRetry, error }: ErrorPageProps) => {
    return (
        <div className="min-h-screen mx-auto max-w-screen-md flex flex-col justify-center items-center text-center p-4">
            <div className="space-y-4">
                <TypographyH3>Oups! Erreur</TypographyH3>
                <TypographyP>
                    Une erreur est survenue, veuillez réessayer ou contacter le support.
                </TypographyP>

                {error && (
                    <div className="mt-4">
                        <TypographySmall className="font-semibold block">Détails de l'erreur : {error.name}</TypographySmall>
                        <TypographySmall className="block">{error.message}</TypographySmall>
                    </div>
                )}

                {onRetry && (
                    <Button onClick={onRetry}>
                        Réessayer
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ErrorPage;