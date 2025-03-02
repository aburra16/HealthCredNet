import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home as HomeIcon, 
  User, 
  FileCheck, 
  Award, 
  ClipboardList,
  BarChart4, 
  LogOut,
  BrainCircuit,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/theme/mode-toggle";

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  
  // If no user is logged in, don't show the navigation bar
  if (!user) return null;
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <div className="sticky top-0 z-50 w-full bg-background shadow-md">
      <div className="px-4 py-2.5 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="bg-primary text-white p-2 rounded-md flex items-center justify-center">
              <Shield className="h-5 w-5 stroke-[2.5px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary tracking-tight">MedCred</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-1">Trusted Verifications</span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {/* Home */}
            <Link href="/">
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                size="sm" 
                className={cn(
                  "flex items-center gap-1.5 rounded-md h-9",
                  isActive('/') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                )}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">Home</span>
              </Button>
            </Link>
            
            {/* User-specific navigation */}
            {user.role === 'user' && (
              <>
                <Link href="/dashboard">
                  <Button 
                    variant={isActive('/dashboard') ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1.5 rounded-md h-9",
                      isActive('/dashboard') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                  >
                    <BrainCircuit className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Find Providers</span>
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button 
                    variant={isActive('/dashboard/profile') ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1.5 rounded-md h-9",
                      isActive('/dashboard/profile') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Profile</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* Provider-specific navigation */}
            {user.role === 'provider' && (
              <>
                <Link href="/dashboard">
                  <Button 
                    variant={isActive('/dashboard') ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1.5 rounded-md h-9",
                      isActive('/dashboard') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Profile</span>
                  </Button>
                </Link>
                <Link href="/dashboard/credentials">
                  <Button 
                    variant={isActive('/dashboard/credentials') ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1.5 rounded-md h-9",
                      isActive('/dashboard/credentials') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                  >
                    <Award className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Credentials</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* Authority-specific navigation */}
            {user.role === 'authority' && (
              <>
                <Link href="/authority/dashboard">
                  <Button 
                    variant={isActive('/authority/dashboard') ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1.5 rounded-md h-9",
                      isActive('/authority/dashboard') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                  >
                    <BarChart4 className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/authority/issue">
                  <Button 
                    variant={isActive('/authority/issue') ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1.5 rounded-md h-9",
                      isActive('/authority/issue') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                  >
                    <FileCheck className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Issue Credentials</span>
                  </Button>
                </Link>
                <Link href="/authority/audit-logs">
                  <Button 
                    variant={isActive('/authority/audit-logs') ? "default" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "flex items-center gap-1.5 rounded-md h-9",
                      isActive('/authority/audit-logs') ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">Audit Logs</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* User Info, Theme Toggle and Logout */}
            <div className="flex items-center pl-3 ml-3 border-l border-border">
              <div className="flex flex-col mr-2 text-xs">
                <div className="font-medium text-foreground">{user.displayName || user.username}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{user.role}</div>
              </div>
              {/* Theme Toggle */}
              <ModeToggle className="mr-1" />
              {/* Logout Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8 p-0 flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}