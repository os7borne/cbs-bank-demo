// Firebase Auth utilities for server-side session management
import { cookies } from 'next/headers';
import { UserService } from './services/user.service';
import { auth as adminAuth } from './firebase-admin';

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

const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);
};

const isDemoMode = () => process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

export async function getSession(): Promise<AuthSession | null> {
  // Return null during build time or demo mode (Firebase Auth not available)
  if (isBuildTime() || isDemoMode() || !adminAuth) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    
    if (!token) return null;
    
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get user data from Firestore
    const user = await UserService.findById(userId);
    
    if (!user || !user.isActive) return null;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        roles: user.roles || [],
      },
      token,
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requirePermission(
  session: AuthSession,
  resource: string,
  action: string
): Promise<void> {
  const hasPermission = session.user.roles.some(role =>
    role.permissions.some(
      p => (p.resource === resource && p.action === action) ||
           (p.resource === '*' && p.action === '*')
    )
  );
  
  if (!hasPermission) {
    throw new Error('Forbidden');
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('firebase-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('firebase-token');
}

export default {
  getSession,
  requireAuth,
  requirePermission,
  setAuthCookie,
  clearAuthCookie,
};
