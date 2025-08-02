import { ThemeProvider } from "@/renderer/providers/theme";
import Router from "@/renderer/screens/router";
import QuerieProvider from "@/renderer/libs/queries/providers";
import { Toaster } from "@/renderer/components/ui/sonner";

function App(): JSX.Element {
  return (
    <QuerieProvider>
      <ThemeProvider>
        <Router />
        <Toaster position="top-center" />
      </ThemeProvider>
    </QuerieProvider>
  );
}

export default App;
