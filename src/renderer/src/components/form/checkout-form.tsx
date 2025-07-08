import { Separator } from "@renderer/components/ui/separator";
import { checkoutSchemas } from "@renderer/libs/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@renderer/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@renderer/components/ui/dialog";
import { Input } from "@renderer/components/ui/input";
import z from "zod";
import { LabelFormContainer } from "@renderer/components/label-form-container";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInvoiceState,
  formatComputedProduct,
} from "@renderer/libs/invoice-state";
import { ButtonForm } from "../button-form";
import { cn } from "@renderer/utils";
// eslint-disable-next-line prettier/prettier
import { Button } from "@renderer/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import InvoiceProductForm, {
  InvoiceProductFormRef,
} from "@renderer/components/form/invoice-product";
import { useRef } from "react";
import { formatCurrency } from "@camons/utils/format";
import { usePassCommadInvoice } from "@renderer/apis/mutations";
import { useToast } from "../ui/use-toast";

type TProductInvoice = {
  id: string | number;
  price: number;
  tva: number;
  nom: string;
};
const Sommaire: React.FC = () => {
  const products = useInvoiceState((state) => state.products);
  return (
    <div className="bg-secondary m-2 p-2 rounded-md">
      {products.map((product) => (
        <div key={product.id} className="flex justify-between">
          <p className="leading-7 capitalize">{product.productName}</p>
          <p className="leading-7">{product.totalPrice} Fc</p>
        </div>
      ))}
      {products.length < 1 && (
        <h4 className="font-semibold text-xs text-center">
          Aucun element selectionne
        </h4>
      )}
    </div>
  );
};

const CommandedProductList: React.FC = () => {
  const { products, removeProduct } = useInvoiceState();
  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="border-b flex item-center justify-between"
        >
          <div className="grid grid-cols-5 gap-4">
            <div>
              <small className="text-sm font-medium leading-none">Nom</small>
              <div className="text-lg font-semibold">{product.productName}</div>
            </div>
            <div>
              <small className="text-sm font-medium leading-none">
                Quatite
              </small>
              <div className="text-lg font-semibold">{product.quantity}</div>
            </div>
            <div>
              <small className="text-sm font-medium leading-none">
                Prix unitaire
              </small>
              <div className="text-lg font-semibold">{product.unitePrice}</div>
            </div>
            <div>
              <small className="text-sm font-medium leading-none">Tva</small>
              <div className="text-lg font-semibold">{product.tva}</div>
            </div>
            <div>
              <small className="text-sm font-medium leading-none">Total</small>
              <div className="text-lg font-semibold">{product.totalPrice}</div>
            </div>
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removeProduct(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
const PriceSommaireItem: React.FC<{
  label: string;
  price: number;
  labelClassName?: string;
  priceClassName?: string;
}> = ({ label, price, labelClassName, priceClassName }) => {
  return (
    <div className="flex justify-between">
      <p
        className={cn(
          "leading-7 text-md font-semibold capitalize",
          labelClassName,
        )}
      >
        {label}
      </p>
      <p className={cn("leading-7 text-md font-semibold", priceClassName)}>
        {formatCurrency(price)}
      </p>
    </div>
  );
};
const PriceSommaire: React.FC = () => {
  const invoice = useInvoiceState();
  return (
    <div>
      <PriceSommaireItem label="TVA" price={invoice.tva} />
      <PriceSommaireItem label="PHT" price={invoice.pht} />
      <PriceSommaireItem
        label="Total"
        price={invoice.total}
        labelClassName="scroll-m-20 text-xl tracking-tight"
        priceClassName="scroll-m-20 text-xl tracking-tight text-primary"
      />
    </div>
  );
};

const InputProductDialog: React.FC<{ products: TProductInvoice[] }> = ({
  products,
}) => {
  const toast = useToast();
  const btnCloseRef = useRef<HTMLButtonElement>(null);
  const btnRef = useRef<InvoiceProductFormRef>(null);
  const handlerAddInvoiceProduct = useInvoiceState((state) => state.addProduct);
  const handlerSubmit = (values) => {
    const product = products.find((product) => product.id == values.product);
    if (product) {
      handlerAddInvoiceProduct(
        formatComputedProduct({
          nom: product.nom,
          id: product.id,
          price: product.price,
          quantity: values.quantity,
          tva: product.tva,
        }),
      );
      btnCloseRef.current?.click();
      toast.toast({
        title: "Commande",
        description: "Produit ajouter au comande",
      });
      console.log("Add product", values, product);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="w-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
          <DialogDescription>Ajouter des produits commandees</DialogDescription>
        </DialogHeader>
        {/*  */}
        <InvoiceProductForm
          products={products}
          ref={btnRef}
          onSubmit={handlerSubmit}
        />
        <DialogFooter>
          <DialogClose>
            <button ref={btnCloseRef} className="hidden" />
          </DialogClose>
          <ButtonForm
            isPendingText="Enregistrement..."
            onClick={() => btnRef.current?.handlerSubmit()}
          >
            Enregistrer
          </ButtonForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

//
type TCheckOutSchemas = z.infer<typeof checkoutSchemas>;
const defaultValues: TCheckOutSchemas = {
  adress: "",
  contact: "",
  nom: "",
  postnom: "",
  prenom: "",
};
export default function CheckoutForm({
  products,
}: {
  products: TProductInvoice[];
}) {
  const toast = useToast();
  const mutation = usePassCommadInvoice();
  const getValues = useInvoiceState((state) => state.getValues);
  const resetProductCommanded = useInvoiceState((state) => state.resetCommand);
  const form = useForm<TCheckOutSchemas>({
    resolver: zodResolver(checkoutSchemas),
    defaultValues,
  });

  const onSubmit = (client: TCheckOutSchemas): void => {
    mutation.mutate(
      {
        client,
        command: getValues(),
        options: {
          exportToPdf: true,
        },
      },
      {
        onSuccess(data) {
          form.reset(defaultValues);
          resetProductCommanded();
          toast.toast({
            title: "Commande",
            description: "La commande a ete fait avec succes",
          });
          console.log("Success PassCommand", data);
        },
        onError(error) {
          console.log("Error Passcomand", error);
        },
      },
    );
  };

  return (
    <div>
      <Form {...form}>
        <form
          className="space-y-4 mb-4 w-full"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-3 gap-10">
            <div className="col-span-2 space-y-4">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Factures
              </h4>
              <p className="text-muted-foreground text-xs">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Numquam error ex culpa? Quos, voluptatum qui officiis iusto,
                animi deleniti modi dolorem quam quis tenetur ratione fugiat
                reiciendis. Tempora, esse pariatur!
              </p>
              <div className="my-2">
                <h4 className="scroll-m-20 text-md font-semibold tracking-tight uppercase">
                  information du client
                </h4>
              </div>
              <LabelFormContainer label="Information personnelle">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postnom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postnom</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prenom</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </LabelFormContainer>
              <LabelFormContainer label="Contacts">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adress</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </LabelFormContainer>
            </div>
            {/* Sommaire side */}
            <div className="col-span-1 space-y-4">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Sommaire
              </h4>
              <Separator />
              <Sommaire />
              <Separator />
              {/* Price sommaire */}
              <PriceSommaire />
              <div className="flex justify-end">
                <ButtonForm
                  isPending={mutation.isLoading}
                  isPendingText="Commande encours..."
                >
                  Commander
                </ButtonForm>
              </div>
            </div>
          </div>
        </form>
      </Form>
      {/*  */}
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-2 space-y-4">
          <Separator />
          <div className="flex justify-between items-center">
            <h4 className="scroll-m-20 text-md font-semibold tracking-tight uppercase">
              Produits commandes
            </h4>
            {/* Input dialog */}
            <InputProductDialog products={products} />
          </div>
          {/* List of products */}
          <CommandedProductList />
        </div>
      </div>
    </div>
  );
}
