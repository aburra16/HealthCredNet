import { AuthUser, UserRole } from "@/types";
import { apiRequest } from "@/lib/queryClient";

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
 */
export const login = async (publicKey: string, role: UserRole): Promise<AuthUser> => {
  try {
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
