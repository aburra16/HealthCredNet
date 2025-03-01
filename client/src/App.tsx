import { Switch, Route } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </AuthProvider>
  );
}

export default App;
