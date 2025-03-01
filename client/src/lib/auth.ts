import { AuthUser, UserRole } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { ndk, connectToRelays, hasNip07Extension } from './ndkClient';
import { getNip07PublicKey } from './nostr';

const AUTH_STORAGE_KEY = 'medcred_auth';

/**
 * Saves authentication state to localStorage
 */
export const saveAuth = (user: AuthUser): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

/**
 * Retrieves authentication state from localStorage
 */
export const getAuth = (): AuthUser | null => {
  const auth = localStorage.getItem(AUTH_STORAGE_KEY);
  return auth ? JSON.parse(auth) : null;
};

/**
 * Clears authentication state from localStorage
 */
export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

/**
 * Authenticate user with Nostr public key and role
 * If using a NIP-07 extension, it will automatically connect to relays
 * 
 * Authority role is restricted to NosFabricaTest account only
 */
export const login = async (publicKey: string, role: UserRole): Promise<AuthUser> => {
  try {
    // Double-check authority restriction
    if (role === 'authority') {
      // NosFabricaTest public key (derived from nsec18r04f8s6u6z6uestrtyn2xh6jjlrgpgapa6mg75fth97sh2hn2dqccjlum)
      const nosFabricaTestPubkey = 'npub1uvc02wxk75r06n5wu8jwg8w3slycyw9hqpxlgngprdty393tv87s3wfcxu';
      
      console.log("Authority login attempt:", publicKey);
      console.log("Required NosFabricaTest pubkey:", nosFabricaTestPubkey);
      
      // Verify it's NosFabricaTest
      if (publicKey !== nosFabricaTestPubkey) {
        console.error("Authority login denied - incorrect pubkey");
        throw new Error('Authority role restricted to NosFabricaTest only');
      }
      
      console.log("Authority credentials verified");
    }
  
    // Ensure relay connection
    await connectToRelays();
    
    const response = await apiRequest('POST', '/api/auth/login', { publicKey, role });
    const user = await response.json();
    saveAuth(user);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Authentication failed');
  }
};

/**
 * Log out user
 */
export const logout = (): void => {
  clearAuth();
  window.location.href = '/';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuth();
};

/**
 * Get authenticated user
 */
export const getAuthUser = (): AuthUser | null => {
  return getAuth();
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: UserRole): boolean => {
  const user = getAuth();
  return user?.role === role;
};

/**
 * Login with NIP-07 browser extension
 * Authority login is blocked with extension for security
 */
export const loginWithNip07 = async (role: UserRole): Promise<AuthUser> => {
  try {
    // Authority role is not allowed with extension login
    if (role === 'authority') {
      console.error("Authority login attempted with extension");
      throw new Error('Authority role requires manual login with NosFabricaTest credentials');
    }
    
    // Check if extension is available
    if (!hasNip07Extension) {
      throw new Error('No NIP-07 browser extension detected');
    }
    
    // Get public key from extension
    const npub = await getNip07PublicKey();
    if (!npub) {
      throw new Error('Could not get public key from extension');
    }
    
    console.log("Extension login with pubkey:", npub);
    
    // Login with the public key
    return await login(npub, role);
  } catch (error) {
    console.error('Error logging in with NIP-07 extension:', error);
    throw error;
  }
};
