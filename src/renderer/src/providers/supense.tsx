import React from "react"

export const SuspenseProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <React.Suspense
      fallback={
        <div className="h-full w-full items-center justify-center">
          <h1 className="text-muted-foreground">Chargement...</h1>
        </div>
      }
    >
      {children}
    </React.Suspense>
  )
}
