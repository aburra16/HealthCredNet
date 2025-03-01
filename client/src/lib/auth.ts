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
 */
export const login = async (publicKey: string, role: UserRole): Promise<AuthUser> => {
  try {
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
 */
export const loginWithNip07 = async (role: UserRole): Promise<AuthUser> => {
  try {
    // Check if extension is available (hasNip07Extension is a boolean constant)
    if (!hasNip07Extension) {
      throw new Error('No NIP-07 browser extension detected');
    }
    
    // Get public key from extension
    const npub = await getNip07PublicKey();
    if (!npub) {
      throw new Error('Could not get public key from extension');
    }
    
    // Login with the public key
    return await login(npub, role);
  } catch (error) {
    console.error('Error logging in with NIP-07 extension:', error);
    throw error;
  }
};
