import { useGetInvoices } from "@renderer/apis/queries";
import InvoiceList from "./frame";
import { SuspenseProvider } from "@renderer/providers/supense";
import { TInvoice } from "@camontype/index";

// Simulate a database read for tasks.
const SuspenceLoadInvoice: React.FC = () => {
  const { data: invoices } = useGetInvoices<TInvoice[], unknown>();
  return <InvoiceList invoices={invoices} />;
};
export default function ProductList(): React.JSX.Element {
  return (
    <SuspenseProvider>
      <SuspenceLoadInvoice />
    </SuspenseProvider>
  );
}
