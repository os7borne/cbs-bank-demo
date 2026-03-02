import { collections, auth as adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  roles: string[];
  permissions?: Array<{ resource: string; action: string }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);
};

export class UserService {
  static async findAll(limit = 10): Promise<any[]> {
    if (isBuildTime()) return [];

    try {
      const snapshot = await collections.users
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get roles
          const rolesSnapshot = await collections.roles
            .where('userId', '==', doc.id)
            .get();
          
          return {
            id: doc.id,
            ...this.convertTimestamps(data),
            roles: rolesSnapshot.docs.map(r => ({
              ...r.data(),
              id: r.id,
            })),
          };
        })
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  static async findById(id: string): Promise<any | null> {
    if (isBuildTime()) return null;

    try {
      const doc = await collections.users.doc(id).get();
      if (!doc.exists) return null;
      
      const data = doc.data()!;
      
      // Get roles with permissions
      const rolesSnapshot = await collections.roles
        .where('__name__', 'in', data.roleIds || [])
        .get();
      
      const roles = await Promise.all(
        rolesSnapshot.docs.map(async (roleDoc) => {
          const roleData = roleDoc.data() as any;
          
          // If permissions are embedded, use them directly
          if (roleData.permissions) {
            return {
              id: roleDoc.id,
              name: roleData.name,
              permissions: roleData.permissions,
            };
          }
          
          // Otherwise fetch from permissions collection
          const permSnapshot = await collections.permissions
            .where('__name__', 'in', roleData.permissionIds || [])
            .get();
          
          return {
            id: roleDoc.id,
            name: roleData.name,
            permissions: permSnapshot.docs.map(p => {
              const perm = p.data() as any;
              return {
                resource: perm.resource,
                action: perm.action,
              };
            }),
          };
        })
      );
      
      return {
        id: doc.id,
        ...this.convertTimestamps(data),
        roles,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async findByEmail(email: string): Promise<any | null> {
    if (isBuildTime()) return null;

    try {
      const snapshot = await collections.users
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return this.findById(doc.id);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  static async createUserWithAuth(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    roleIds: string[];
  }): Promise<User> {
    if (!adminAuth) {
      throw new Error('Firebase Auth not available. Set up Firebase credentials or run in DEMO_MODE.');
    }
    
    // Create Firebase Auth user
    const authUser = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`,
    });

    const now = Timestamp.now();
    const userData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      employeeId: data.employeeId || null,
      isActive: true,
      roleIds: data.roleIds,
      createdAt: now,
      updatedAt: now,
    };

    await collections.users.doc(authUser.uid).set(userData);

    return {
      id: authUser.uid,
      ...userData,
      employeeId: userData.employeeId || undefined,
      lastLoginAt: undefined,
      roles: [],
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  static async updateLastLogin(id: string): Promise<void> {
    if (isBuildTime()) return;
    
    await collections.users.doc(id).update({
      lastLoginAt: Timestamp.now(),
    });
  }

  static async verifyIdToken(token: string): Promise<any> {
    if (!adminAuth) {
      throw new Error('Firebase Auth not available.');
    }
    return await adminAuth.verifyIdToken(token);
  }

  static async createCustomToken(uid: string): Promise<string> {
    if (!adminAuth) {
      throw new Error('Firebase Auth not available.');
    }
    return await adminAuth.createCustomToken(uid);
  }

  static async getUserByEmail(email: string): Promise<any> {
    if (isBuildTime()) return null;
    
    try {
      if (!adminAuth) {
        throw new Error('Firebase Auth not available.');
      }
      return await adminAuth.getUserByEmail(email);
    } catch {
      return null;
    }
  }

  private static convertTimestamps(data: any): any {
    if (!data) return data;
    
    const result: any = { ...data };
    
    Object.keys(result).forEach(key => {
      if (result[key] instanceof Timestamp) {
        result[key] = result[key].toDate();
      }
    });
    
    return result;
  }
}

export default UserService;
