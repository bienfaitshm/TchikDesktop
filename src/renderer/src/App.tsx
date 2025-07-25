import { ThemeProvider } from "@/renderer/providers/theme";
import Router from "@/renderer/screens/router";
import QuerieProvider from "@/renderer/libs/queries/providers";
import { Toaster } from "@/renderer/components/ui/toaster";

function App(): JSX.Element {
  return (
    <QuerieProvider>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QuerieProvider>
  );
}

export default App;
