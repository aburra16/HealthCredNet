import { useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Container, Paper, Loader, Center } from "@mantine/core";
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
    if (!user) {
      return (
        <Center h={300}>
          <Loader color="blue" size="lg" />
        </Center>
      );
    }
    
    switch (user.role) {
      case 'user':
        return <SearchProviders />;
      case 'provider':
        // Provider navigation
        if (location === '/dashboard/credentials') {
          console.log("Rendering provider credentials page");
          return <ProviderCredentials />;
        }
        
        // Default - show provider profile
        console.log("Rendering provider profile page");
        return <ProviderProfile />;
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
    <Paper py="md" component="div">
      <Container size="xl">
        {renderRoleBasedContent()}
      </Container>
    </Paper>
  );
}
