import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  if (!user) return null;
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100" style={{ backgroundColor: 'white', backdropFilter: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-primary-600 text-white p-2 rounded-md">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-primary-600">MedCred</span>
            </div>
            <nav className="ml-8 flex space-x-8" role="navigation">
              {/* User navigation */}
              {user.role === 'user' && (
                <div className="flex space-x-6">
                  <Link href="/dashboard" 
                    className={`inline-flex items-center px-3 h-16 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      location === '/dashboard' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                    }`}>
                    Find Providers
                  </Link>
                  <Link href="/dashboard/profile" 
                    className={`inline-flex items-center px-3 h-16 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      location === '/dashboard/profile' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                    }`}>
                    My Profile
                  </Link>
                </div>
              )}
              
              {/* Provider navigation */}
              {user.role === 'provider' && (
                <div className="flex space-x-6">
                  <Link href="/dashboard"
                    className={`inline-flex items-center px-3 h-16 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      location === '/dashboard' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                    }`}>
                      My Profile
                  </Link>
                  <Link href="/dashboard/credentials"
                    className={`inline-flex items-center px-3 h-16 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      location === '/dashboard/credentials' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                    }`}>
                      Credentials
                  </Link>
                </div>
              )}
              
              {/* Authority navigation */}
              {user.role === 'authority' && (
                <div className="flex space-x-6">
                  <Link href="/authority/dashboard"
                    className={`inline-flex items-center px-3 h-16 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      location === '/authority/dashboard' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                    }`}>
                      Dashboard
                  </Link>
                  <Link href="/authority/issue"
                    className={`inline-flex items-center px-3 h-16 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      location === '/authority/issue' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                    }`}>
                      Issue Credentials
                  </Link>
                  <Link href="/authority/audit-logs"
                    className={`inline-flex items-center px-3 h-16 border-b-2 text-sm font-medium transition-colors duration-150 ${
                      location === '/authority/audit-logs' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                    }`}>
                      Audit Logs
                  </Link>
                </div>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Badge variant="outline" className="capitalize bg-gray-50 border-gray-200 text-primary-700 font-medium">
                {user.role}
              </Badge>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <UserCircle className="h-6 w-6 text-gray-700" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href={user.role === 'authority' ? '/authority/profile' : '/dashboard/profile'}>
                      <DropdownMenuItem>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
