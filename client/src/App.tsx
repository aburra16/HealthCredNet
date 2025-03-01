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

function App() {
  return (
    <AuthProvider>
      {/* Global Navigation Bar */}
      <TopNavBar />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
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
      
      {/* Toast Notifications */}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
