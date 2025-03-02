import React from 'react';
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
import { AppShell, Container, Text, Loader, Center, MantineProvider } from '@mantine/core';
import { medCredTheme } from './lib/theme';

// All components are now directly imported

function App() {
  return (
    <MantineProvider theme={medCredTheme}>
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
              <React.Suspense fallback={
                <Center style={{ height: '50vh' }}>
                  <Loader color="medical-blue" size="lg" />
                </Center>
              }>
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
              </React.Suspense>
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
    </MantineProvider>
  );
}

export default App;
