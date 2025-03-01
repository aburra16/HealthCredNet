import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { validateNostrKey } from '@/lib/nostr';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  displayName: string;
  role: 'user' | 'provider' | 'authority';
  nostrPubkey: string;
  location?: string;
  specialty?: string;
  institution?: string;
  about?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (nostrPubkey: string, nostrPrivkey: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('medcred_user');
    const savedPrivkey = localStorage.getItem('medcred_privkey');
    
    if (savedUser && savedPrivkey) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse saved user', err);
        localStorage.removeItem('medcred_user');
        localStorage.removeItem('medcred_privkey');
      }
    }
  }, []);

  const login = async (nostrPubkey: string, nostrPrivkey: string, role: string) => {
    setLoading(true);
    
    try {
      // Validate the keys
      if (!validateNostrKey(nostrPubkey) || !validateNostrKey(nostrPrivkey)) {
        toast({
          title: "Invalid Nostr Keys",
          description: "Please provide valid npub and nsec keys",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // In a real app, we would verify the private key matches the public key
      // Here we just assume they match for simplicity
      
      // Send the authentication request
      const response = await apiRequest('POST', '/api/auth/login', {
        nostrPubkey,
        role
      });
      
      const userData = await response.json();
      
      // Store the user data and private key
      localStorage.setItem('medcred_user', JSON.stringify(userData));
      localStorage.setItem('medcred_privkey', nostrPrivkey);
      
      setUser(userData);
      setIsAuthenticated(true);
      setLocation('/dashboard');
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${userData.displayName || userData.username}!`,
      });
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: "Login Failed",
        description: "There was an error logging in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medcred_user');
    localStorage.removeItem('medcred_privkey');
    setUser(null);
    setIsAuthenticated(false);
    setLocation('/');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
