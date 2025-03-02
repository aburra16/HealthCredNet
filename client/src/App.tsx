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
import { MantineExample } from "@/components/mantine-example";

function App() {
  return (
    <AuthProvider>
      <div className="visualens-accent-top min-h-screen bg-background flex flex-col">
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
              <Route path="/dashboard/profile-mantine" component={() => import("@/pages/user-profile-mantine").then(module => module.default())} />
              <Route path="/dashboard/credentials" component={Dashboard} />
              <Route path="/provider/:id" component={ProviderProfile} />
              
              {/* Authority Routes */}
              <Route path="/authority/dashboard" component={AuthorityDashboard} />
              <Route path="/authority/issue" component={IssueCredential} />
              <Route path="/authority/providers" component={NotFound} /> {/* Will implement later */}
              <Route path="/authority/audit-logs" component={AuditLogs} />
              
              {/* Mantine Example Route */}
              <Route path="/mantine-example" component={() => <MantineExample />} />
              
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
      
      {/* Toast Notifications */}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
