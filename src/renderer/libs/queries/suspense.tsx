import React from "react"
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

type SuspenseProps = {
    fallback?: React.ReactNode
}

export const Suspense: React.FC<React.PropsWithChildren<SuspenseProps>> = ({ children, fallback }) => {
    return (
        <React.Suspense
            fallback={fallback}
        >
            {children}
        </React.Suspense>
    )
}


type SuspenseErrorBoundaryProps = {
    fallbackRender: (props: FallbackProps) => React.ReactNode
}
/**
 * SuspenseErrorBoundary
 * 
 * A wrapper component that provides error boundary handling for components using React Query.
 * Displays a user-friendly error message and a retry button when an error occurs.
 *
 * @param {React.PropsWithChildren} props - The children components to render.
 * @returns {JSX.Element}
 */
export const SuspenseErrorBoundary: React.FC<React.PropsWithChildren<SuspenseErrorBoundaryProps>> = ({ children, fallbackRender }) => (
    <QueryErrorResetBoundary>
        {({ reset }) => (
            <ErrorBoundary
                onReset={reset}
                fallbackRender={fallbackRender}
            >
                {children}
            </ErrorBoundary>
        )}
    </QueryErrorResetBoundary>
);