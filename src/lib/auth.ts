// Unified Authentication - Supports both Firebase and Demo modes
import { getSession as getFirebaseSession, requireAuth as requireFirebaseAuth, setAuthCookie as setFirebaseAuthCookie, clearAuthCookie as clearFirebaseAuthCookie } from './auth-firebase';
import { getDemoSession, requireDemoAuth, setDemoAuthCookie, clearDemoAuthCookie, verifyDemoCredentials, isDemoMode } from './auth-demo';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    roles: Array<{
      id: string;
      name: string;
      permissions: Array<{ resource: string; action: string }>;
    }>;
  };
  token: string;
}

// Main auth functions that work with both modes
export async function getSession(): Promise<AuthSession | null> {
  if (isDemoMode()) {
    return getDemoSession();
  }
  return getFirebaseSession();
}

export async function requireAuth(): Promise<AuthSession> {
  if (isDemoMode()) {
    return requireDemoAuth();
  }
  return requireFirebaseAuth();
}

export async function setAuthCookie(token: string): Promise<void> {
  if (isDemoMode()) {
    return setDemoAuthCookie(token);
  }
  return setFirebaseAuthCookie(token);
}

export async function clearAuthCookie(): Promise<void> {
  if (isDemoMode()) {
    return clearDemoAuthCookie();
  }
  return clearFirebaseAuthCookie();
}

export async function verifyCredentials(email: string, password: string): Promise<AuthSession | null> {
  if (isDemoMode()) {
    return verifyDemoCredentials(email, password);
  }
  // Firebase auth is handled client-side, this is just for demo mode
  return null;
}

export { isDemoMode };

export default {
  getSession,
  requireAuth,
  setAuthCookie,
  clearAuthCookie,
  verifyCredentials,
  isDemoMode,
};
