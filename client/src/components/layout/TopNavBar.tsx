import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home as HomeIcon, 
  User, 
  FileCheck, 
  Award, 
  ClipboardList,
  BarChart4, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  
  // If no user is logged in, don't show the navigation bar
  if (!user) return null;
  
  const isActive = (path: string) => {
    return location === path ? 
      "bg-primary-100 text-primary-700" : 
      "hover:bg-gray-100 text-gray-700 hover:text-primary-600";
  };
  
  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-1.5 rounded">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-primary-600">MedCred</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {/* Home */}
            <Link href="/">
              <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/')}`}>
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            
            {/* User-specific navigation */}
            {user.role === 'user' && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/dashboard')}`}>
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Find Providers</span>
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/dashboard/profile')}`}>
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* Provider-specific navigation */}
            {user.role === 'provider' && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/dashboard')}`}>
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <Link href="/dashboard/credentials">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/dashboard/credentials')}`}>
                    <Award className="w-4 h-4" />
                    <span className="hidden sm:inline">Credentials</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* Authority-specific navigation */}
            {user.role === 'authority' && (
              <>
                <Link href="/authority/dashboard">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/authority/dashboard')}`}>
                    <BarChart4 className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/authority/issue">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/authority/issue')}`}>
                    <FileCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Issue Credentials</span>
                  </Button>
                </Link>
                <Link href="/authority/audit-logs">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${isActive('/authority/audit-logs')}`}>
                    <ClipboardList className="w-4 h-4" />
                    <span className="hidden sm:inline">Audit Logs</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* User Info and Logout */}
            <div className="flex items-center pl-2 ml-2 border-l border-gray-200">
              <div className="mr-2 text-xs font-medium">
                <div className="text-gray-700">{user.displayName || user.username}</div>
                <div className="text-gray-500 capitalize">{user.role}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-gray-600 hover:text-red-600"
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