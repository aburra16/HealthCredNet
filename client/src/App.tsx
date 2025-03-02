import { Switch, Route } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import TopNavBar from "@/components/layout/TopNavBar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import ProviderProfile from "@/pages/provider-profile";
import UserProfile from "@/pages/user-profile";
import AuthorityDashboard from "@/pages/authority/Dashboard";
import IssueCredential from "@/pages/authority/IssueCredential";
import AuditLogs from "@/pages/authority/AuditLogs";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "./components/theme/theme-provider";
import { useEffect } from "react";
import { Button } from "./components/ui/button";

// Theme Debugger Component
function ThemeDebugger() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-lg p-4 text-left w-80">
      <h3 className="text-lg font-semibold mb-2 text-foreground">Theme Debugger</h3>
      <div className="space-y-1 text-sm">
        <p className="text-foreground">
          Theme setting: <span className="font-mono">{theme}</span>
        </p>
        <p className="text-foreground">
          Resolved theme: <span className="font-mono">{resolvedTheme}</span>
        </p>
        <p className="text-foreground">
          HTML class: <span className="font-mono">{document.documentElement.classList.contains('dark') ? 'dark' : 'light'}</span>
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Button 
          size="sm"
          onClick={() => setTheme('light')}
          variant={theme === 'light' ? 'default' : 'outline'}
        >
          Light
        </Button>
        <Button 
          size="sm"
          onClick={() => setTheme('dark')}
          variant={theme === 'dark' ? 'default' : 'outline'}
        >
          Dark
        </Button>
        <Button 
          size="sm"
          onClick={() => setTheme('system')}
          variant={theme === 'system' ? 'default' : 'outline'}
        >
          System
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-background border border-border p-2 text-xs rounded">
          bg-background
        </div>
        <div className="bg-card border border-border p-2 text-xs rounded">
          bg-card
        </div>
      </div>
    </div>
  );
}

function App() {
  const { resolvedTheme } = useTheme();
  
  // Force a rerender when the theme changes by using a key
  return (
    <AuthProvider>
      <div key={`theme-${resolvedTheme}`} className="visualens-accent-top min-h-screen bg-background flex flex-col">
        {/* Global Navigation Bar */}
        <TopNavBar />
        
        {/* Main Content */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 relative">
            {/* Visual accent elements */}
            <div className="visualens-accent visualens-accent-1 text-primary"></div>
            <div className="visualens-accent visualens-accent-2 text-primary/70"></div>
            
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/dashboard/profile" component={UserProfile} />
              <Route path="/dashboard/credentials" component={Dashboard} />
              <Route path="/provider/:id" component={ProviderProfile} />
              
              {/* Authority Routes */}
              <Route path="/authority/dashboard" component={AuthorityDashboard} />
              <Route path="/authority/issue" component={IssueCredential} />
              <Route path="/authority/providers" component={NotFound} /> {/* Will implement later */}
              <Route path="/authority/audit-logs" component={AuditLogs} />
              
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
          <div className="container">
            <p>MedCred • Secure Medical Credentials Platform • {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
      
      {/* Theme Debugger */}
      <ThemeDebugger />
      
      {/* Toast Notifications */}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
