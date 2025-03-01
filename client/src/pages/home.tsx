import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/auth/login-form";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect if already authenticated based on role
  useEffect(() => {
    if (isAuthenticated) {
      const userData = localStorage.getItem('medcred_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'authority') {
            setLocation("/authority/dashboard");
          } else if (user.role === 'provider') {
            setLocation("/dashboard"); // Provider dashboard
          } else {
            setLocation("/dashboard"); // User dashboard
          }
        } catch (err) {
          console.error('Failed to parse user data:', err);
          setLocation("/dashboard");
        }
      } else {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, setLocation]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
}
