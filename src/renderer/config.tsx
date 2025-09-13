import { Ticket, BookCopy, Contact, Home, ShoppingBasket } from "lucide-react";
// LayoutList,
type RouteConfig = {
  name: string;
  url: string;
  icon: JSX.Element;
};

const config: RouteConfig[] = [
  {
    name: "Acceuil",
    icon: <Home />,
    url: "/",
  },
  {
    name: "Facture",
    icon: <Ticket />,
    url: "/payement",
  },
  {
    name: "Produit",
    icon: <ShoppingBasket />,
    url: "/products",
  },
  {
    name: "Categories",
    icon: <BookCopy />,
    url: "/categories",
  },
  {
    name: "Clients",
    icon: <Contact />,
    url: "/clients",
  },
  // {
  //   name: "Inscription",
  //   icon: <LayoutList />,
  //   url: "/inscription",
  // },
];

export default config;
/**
 * <AppItem icon={<Shapes />} name="Classes" />
            <AppItem icon={<Calendar />} name="A. scolaire" />
            <AppItem icon={<LayoutList />} name="Inscription" />
            <AppItem icon={<Wallet2 />} name="Payement" />
 */
