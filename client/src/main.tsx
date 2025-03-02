import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/theme/theme-provider";

const root = createRoot(document.getElementById("root")!);

// Check if there's a saved theme preference or default to 'system'
const savedTheme = localStorage.getItem('medcred-ui-theme') || 'system';

root.render(
  <ThemeProvider defaultTheme={savedTheme as 'light' | 'dark' | 'system'}>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </ThemeProvider>
);
