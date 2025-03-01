import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getAuth, logout } from "@/lib/auth";
import { UserRole } from "@/types";

interface AppHeaderProps {
  userRole: UserRole;
}

export default function AppHeader({ userRole }: AppHeaderProps) {
  const [location] = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const auth = getAuth();
  
  if (!auth) return null;
  
  const roleName = userRole === 'authority' ? 'Authority' : 
                  userRole === 'provider' ? 'Provider' : 'User';
  
  // Define navigation links based on user role
  const navigationLinks = {
    authority: [
      { name: 'Dashboard', path: '/authority/dashboard', active: location === '/authority/dashboard' },
      { name: 'Issue Credentials', path: '/authority/issue', active: location === '/authority/issue' },
      { name: 'Audit Logs', path: '/authority/audit', active: location === '/authority/audit' }
    ],
    provider: [
      { name: 'My Profile', path: '/provider/profile', active: location === '/provider/profile' },
      { name: 'Credentials', path: '/provider/credentials', active: location === '/provider/credentials' }
    ],
    user: [
      { name: 'Find Providers', path: '/user/search', active: location === '/user/search' },
      { name: 'My Profile', path: '/user/profile', active: location === '/user/profile' }
    ]
  };
  
  const links = navigationLinks[userRole];
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-primary-600">MedCred</span>
            </div>
            <nav className="ml-6 flex space-x-8" role="navigation">
              {links.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      link.active
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {link.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {roleName}
              </span>
            </div>
            <div className="ml-4 flex items-center md:ml-6 relative">
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="sr-only">View user menu</span>
                <i className="fas fa-user-circle text-xl"></i>
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-8 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">{auth.name || 'User'}</div>
                    <div className="text-xs text-gray-500 truncate">{auth.publicKey}</div>
                  </div>
                  <Link href={`/${userRole}/profile`}>
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      Your Profile
                    </a>
                  </Link>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
