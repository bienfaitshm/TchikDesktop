export type MenuActionHandlers<TItem> = {
  [key: string]: (item: TItem) => void;
};

export interface MenuItem {
  key: string;
  label: string;
}

export function createMenuActionManager<Menu extends MenuItem, TItem>(
  menus: Menu[],
  handlers: MenuActionHandlers<TItem>
) {
  return {
    menus,
    handleMenusAction: (key: string, item: TItem) => {
      const handler = handlers[key];
      if (typeof handler === "function") {
        handler(item);
      } else {
        console.error(
          `Erreur critique: Le gestionnaire pour la clé d'action '${key}' est manquant ou non-fonctionnel.`
        );
      }
    },
  };
}
