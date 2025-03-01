import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuth, logout } from "@/lib/auth";
import { UserRole } from "@/types";
import AppHeader from "@/components/layout/AppHeader";
import { useToast } from "@/hooks/use-toast";

interface AuthWrapperProps {
  children: React.ReactNode;
  userRole: UserRole;
}

export default function AuthWrapper({ children, userRole }: AuthWrapperProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const auth = getAuth();
    
    // If not logged in, redirect to login page
    if (!auth) {
      navigate('/');
      return;
    }
    
    // Check if user has the required role
    if (auth.role !== userRole) {
      toast({
        title: "Unauthorized",
        description: `You don't have access to the ${userRole} area.`,
        variant: "destructive"
      });
      
      // Redirect to appropriate dashboard based on user role
      switch (auth.role) {
        case 'authority':
          navigate('/authority/dashboard');
          break;
        case 'provider':
          navigate('/provider/profile');
          break;
        case 'user':
          navigate('/user/search');
          break;
        default:
          logout();
          navigate('/');
      }
      
      return;
    }
    
    setIsAuthorized(true);
  }, [userRole, navigate, toast]);
  
  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <AppHeader userRole={userRole} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
