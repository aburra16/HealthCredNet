import { useEffect, useState } from "react";
import { useLocation, Route, Switch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import SearchProviders from "@/components/user/search-providers";
import ProviderProfile from "@/components/provider/provider-profile";
import ProviderCredentials from "@/components/provider/provider-credentials";
import AuthorityDashboard from "@/components/authority/authority-dashboard";
import IssueCredential from "@/components/authority/issue-credential";
import AuditLogs from "@/components/authority/audit-logs";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirect if not authenticated or if user is authority (they have dedicated routes)
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (user?.role === 'authority') {
      setLocation("/authority/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);
  
  // Determine which component to render based on user role
  const renderRoleBasedContent = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'user':
        return <SearchProviders />;
      case 'provider':
        // Default route should show provider profile
        if (location === '/dashboard') {
          return <ProviderProfile />;
        }
        return (
          <Switch>
            <Route path="/dashboard/credentials" component={ProviderCredentials} />
            <Route component={ProviderProfile} />
          </Switch>
        );
      case 'authority':
        // Default route should show authority dashboard
        if (location === '/dashboard') {
          return <AuthorityDashboard />;
        }
        return (
          <Switch>
            <Route path="/dashboard/issue" component={IssueCredential} />
            <Route path="/dashboard/audit" component={AuditLogs} />
            <Route component={AuthorityDashboard} />
          </Switch>
        );
      default:
        return <div>Unknown role</div>;
    }
  };
  
  if (!isAuthenticated || !user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderRoleBasedContent()}
      </main>
    </div>
  );
}
