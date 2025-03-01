import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { validateNostrKey, getNip07PublicKey } from '@/lib/nostr';
import { connectToRelays, hasNip07Extension } from '@/lib/ndkClient';
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
  loginWithNip07: (role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  loginWithNip07: async () => {},
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
      // Check if we're using NIP-07 extension (nostrPrivkey will be empty)
      const isExtensionLogin = nostrPrivkey === '';
      
      if (!isExtensionLogin) {
        // For direct nsec login, validate the private key
        if (!validateNostrKey(nostrPrivkey)) {
          toast({
            title: "Invalid Nostr Key",
            description: "Please provide a valid Nostr private key (nsec1...)",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }
      
      // Validate the public key (for both extension and direct login)
      if (!nostrPubkey || !nostrPubkey.startsWith('npub1')) {
        toast({
          title: "Invalid Public Key",
          description: "The public key format is invalid",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Send the authentication request with the public key
      const response = await apiRequest('POST', '/api/auth/login', {
        nostrPubkey,
        role,
        loginMethod: isExtensionLogin ? 'extension' : 'privatekey'
      });
      
      const userData = await response.json();
      
      // Store the user data
      localStorage.setItem('medcred_user', JSON.stringify(userData));
      
      // Only store the private key if using direct nsec login
      if (!isExtensionLogin) {
        localStorage.setItem('medcred_privkey', nostrPrivkey);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Redirect based on role
      if (userData.role === 'authority') {
        setLocation('/authority/dashboard');
      } else if (userData.role === 'provider') {
        setLocation('/dashboard');
      } else {
        setLocation('/dashboard');
      }
      
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

  // Login using NIP-07 browser extension
  const loginWithNip07 = async (role: string) => {
    setLoading(true);
    
    try {
      // Check for extension first
      if (!hasNip07Extension()) {
        toast({
          title: "No Extension Found",
          description: "Please install a Nostr browser extension like nos2x or Alby",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Ensure relay connection
      await connectToRelays?.();
      
      // Get public key from the extension
      const publicKey = await getNip07PublicKey();
      if (!publicKey) {
        toast({
          title: "Could not get public key",
          description: "Failed to get your public key from the extension",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Call the regular login function with empty private key (extension mode)
      await login(publicKey, "", role);
      
    } catch (error) {
      console.error('NIP-07 login failed:', error);
      toast({
        title: "Login Failed",
        description: "There was an error logging in with your Nostr extension",
        variant: "destructive"
      });
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
    <AuthContext.Provider value={{ user, loading, login, loginWithNip07, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
