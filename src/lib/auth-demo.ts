// Demo/Hardcoded Authentication
// Use this for quick demos without setting up Firebase Auth
// Set DEMO_MODE=true in .env to enable

import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const DEMO_MODE = process.env.DEMO_MODE === 'true';
const DEMO_SECRET = process.env.DEMO_SECRET || 'demo-secret-key-change-in-production';

// Hardcoded demo users
export const DEMO_USERS = [
  {
    id: 'demo-admin-001',
    email: 'admin@indiabank.demo',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    employeeId: 'EMP001',
    roles: [{ id: 'role-admin', name: 'ADMIN', permissions: [{ resource: '*', action: '*' }] }],
  },
  {
    id: 'demo-teller-001',
    email: 'teller@indiabank.demo',
    password: 'teller123',
    firstName: 'John',
    lastName: 'Smith',
    employeeId: 'EMP002',
    roles: [{ 
      id: 'role-teller', 
      name: 'TELLER', 
      permissions: [
        { resource: 'customer', action: 'read' },
        { resource: 'account', action: 'read' },
        { resource: 'transaction', action: 'create' },
        { resource: 'transaction', action: 'read' },
      ] 
    }],
  },
  {
    id: 'demo-cs-001',
    email: 'cs@indiabank.demo',
    password: 'cs123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    employeeId: 'EMP003',
    roles: [{ 
      id: 'role-cs', 
      name: 'CUSTOMER_SERVICE', 
      permissions: [
        { resource: 'customer', action: 'create' },
        { resource: 'customer', action: 'read' },
        { resource: 'customer', action: 'update' },
        { resource: 'account', action: 'create' },
        { resource: 'account', action: 'read' },
      ] 
    }],
  },
  {
    id: 'demo-ops-001',
    email: 'ops@indiabank.demo',
    password: 'ops123',
    firstName: 'Michael',
    lastName: 'Chen',
    employeeId: 'EMP004',
    roles: [{ 
      id: 'role-ops', 
      name: 'OPERATIONS', 
      permissions: [
        { resource: 'transaction', action: 'read' },
        { resource: 'workflow', action: 'approve' },
        { resource: 'batch', action: 'execute' },
      ] 
    }],
  },
  {
    id: 'demo-credit-001',
    email: 'credit@indiabank.demo',
    password: 'credit123',
    firstName: 'Priya',
    lastName: 'Sharma',
    employeeId: 'EMP005',
    roles: [{ 
      id: 'role-credit', 
      name: 'CREDIT_OFFICER', 
      permissions: [
        { resource: 'customer', action: 'read' },
        { resource: 'loan', action: 'create' },
        { resource: 'loan', action: 'read' },
        { resource: 'loan', action: 'approve' },
      ] 
    }],
  },
  {
    id: 'demo-finance-001',
    email: 'finance@indiabank.demo',
    password: 'finance123',
    firstName: 'Robert',
    lastName: 'Williams',
    employeeId: 'EMP006',
    roles: [{ 
      id: 'role-finance', 
      name: 'FINANCE', 
      permissions: [
        { resource: 'transaction', action: 'read' },
        { resource: 'report', action: 'read' },
      ] 
    }],
  },
];

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

export async function verifyDemoCredentials(email: string, password: string): Promise<AuthSession | null> {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return null;
  }

  // Create a JWT token for the demo user
  const token = await new SignJWT({ 
    userId: user.id, 
    email: user.email,
    demo: true 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(DEMO_SECRET));

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      employeeId: user.employeeId,
      roles: user.roles,
    },
    token,
  };
}

export async function verifyDemoToken(token: string): Promise<AuthSession | null> {
  try {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, new TextEncoder().encode(DEMO_SECRET));
    
    if (!payload.demo || !payload.userId) {
      return null;
    }

    const user = DEMO_USERS.find(u => u.id === payload.userId);
    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        roles: user.roles,
      },
      token,
    };
  } catch {
    return null;
  }
}

export async function getDemoSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('demo-token')?.value;
    
    if (!token) return null;
    
    return await verifyDemoToken(token);
  } catch {
    return null;
  }
}

export async function setDemoAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('demo-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearDemoAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('demo-token');
}

export async function requireDemoAuth(): Promise<AuthSession> {
  const session = await getDemoSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export function isDemoMode(): boolean {
  return DEMO_MODE;
}

// Re-export for convenience
export default {
  verifyDemoCredentials,
  verifyDemoToken,
  getDemoSession,
  setDemoAuthCookie,
  clearDemoAuthCookie,
  requireDemoAuth,
  isDemoMode,
  DEMO_USERS,
};
