import { Switch, Route } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import ProviderProfile from "@/pages/provider-profile";
import UserProfile from "@/pages/user-profile";

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/profile" component={UserProfile} />
        <Route path="/provider/:id" component={ProviderProfile} />
        <Route component={NotFound} />
      </Switch>
    </AuthProvider>
  );
}

export default App;
