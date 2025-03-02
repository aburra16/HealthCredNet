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
import { AppShell, Container, Text } from '@mantine/core';

function App() {
  return (
    <AuthProvider>
      <AppShell
        header={{ height: 60 }}
        footer={{ height: 40 }}
        padding="md"
      >
        {/* Global Navigation Bar */}
        <TopNavBar />
        
        {/* Main Content */}
        <AppShell.Main>
          <Container size="lg">
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
          </Container>
        </AppShell.Main>
        
        {/* Footer */}
        <AppShell.Footer p="xs">
          <Container size="lg">
            <Text ta="center" size="xs" c="dimmed">
              MedCred • Secure Medical Credentials Platform • {new Date().getFullYear()}
            </Text>
          </Container>
        </AppShell.Footer>
      </AppShell>
      
      {/* Toast Notifications */}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
