import React, { createContext, useContext, PropsWithChildren } from 'react';

/**
 * Interface pour la valeur du contexte de rafraîchissement des données.
 * @property refresh - Fonction pour déclencher le rafraîchissement des données.
 */
interface DataRefresherContextType {
    refresh: () => void;
}

// Création du contexte pour le rafraîchissement des données.
const DataRefreshContext = createContext<DataRefresherContextType | null>(null);

export const useDataRefresh = () => {
    const context = useContext(DataRefreshContext);

    if (!context) {
        throw new Error('useDataRefresh doit être utilisé à l\'intérieur de DataRefresher.');
    }

    return context;
};

/**
 * Propriétés pour le composant DataRefresher.
 * @property onDataChange - Fonction de rappel à exécuter pour rafraîchir les données.
 */
interface DataRefresherProps {
    onDataChange: () => void;
}

/**
 * Composant fournisseur de contexte pour le rafraîchissement des données.
 * Il fournit une fonction de rafraîchissement aux composants enfants.
 * @param {PropsWithChildren<DataRefresherProps>} props
 * @param {() => void} props.onDataChange - Fonction à appeler lors du rafraîchissement.
 * @param {React.ReactNode} props.children - Les composants enfants à encapsuler.
 * @returns Le fournisseur de contexte.
 */
export const DataRefresher = ({ onDataChange, children }: PropsWithChildren<DataRefresherProps>) => {
    const refresh = React.useCallback(() => {
        onDataChange();
    }, [onDataChange]);

    const value = { refresh };

    return (
        <DataRefreshContext.Provider value={value}>
            {children}
        </DataRefreshContext.Provider>
    );
};