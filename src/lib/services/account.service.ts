import { collections } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

export interface Account {
  id?: string;
  accountNumber: string;
  customerId: string;
  productId: string;
  branchId: string;
  currencyId: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'TERM_DEPOSIT' | 'RECURRING_DEPOSIT' | 'LOAN' | 'OVERDRAFT';
  status: 'PENDING' | 'ACTIVE' | 'FROZEN' | 'DORMANT' | 'CLOSED';
  openingDate: Date;
  closingDate?: Date;
  currentBalance: number;
  availableBalance: number;
  blockedAmount: number;
  overdraftLimit: number;
  interestAccrued: number;
  interestPaid: number;
  lastInterestDate?: Date;
  principalAmount?: number;
  maturityDate?: Date;
  maturityAction?: string;
  openedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const isBuildTime = () => {
  // In demo mode, never treat as build time - data should be available at runtime
  if (process.env.DEMO_MODE === 'true') return false;
  
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);
};

export class AccountService {
  static async findAll(limit = 50): Promise<any[]> {
    if (isBuildTime()) return [];

    try {
      const snapshot = await collections.accounts
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      const accounts = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Fetch related data
          const [customerDoc, productDoc, branchDoc, currencyDoc] = await Promise.all([
            collections.customers.doc(data.customerId).get(),
            collections.products.doc(data.productId).get(),
            collections.branches.doc(data.branchId).get(),
            collections.currencies.doc(data.currencyId).get(),
          ]);

          return {
            id: doc.id,
            ...this.convertTimestamps(data),
            customer: customerDoc.exists ? { 
              id: customerDoc.id, 
              ...customerDoc.data(),
              customerType: customerDoc.data()?.customerType,
              firstName: customerDoc.data()?.firstName,
              lastName: customerDoc.data()?.lastName,
              companyName: customerDoc.data()?.companyName,
            } : null,
            product: productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null,
            branch: branchDoc.exists ? { id: branchDoc.id, ...branchDoc.data() } : null,
            currency: currencyDoc.exists ? { id: currencyDoc.id, ...currencyDoc.data() } : null,
          };
        })
      );
      
      return accounts;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  }

  static async findById(id: string): Promise<any | null> {
    if (isBuildTime()) return null;

    try {
      const doc = await collections.accounts.doc(id).get();
      if (!doc.exists) return null;
      
      const data = doc.data()!;
      
      const [customerDoc, productDoc, branchDoc, currencyDoc] = await Promise.all([
        collections.customers.doc(data.customerId).get(),
        collections.products.doc(data.productId).get(),
        collections.branches.doc(data.branchId).get(),
        collections.currencies.doc(data.currencyId).get(),
      ]);

      return {
        id: doc.id,
        ...this.convertTimestamps(data),
        customer: customerDoc.exists ? { 
          id: customerDoc.id, 
          ...customerDoc.data(),
          customerType: customerDoc.data()?.customerType,
          firstName: customerDoc.data()?.firstName,
          lastName: customerDoc.data()?.lastName,
          companyName: customerDoc.data()?.companyName,
        } : null,
        product: productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null,
        branch: branchDoc.exists ? { id: branchDoc.id, ...branchDoc.data() } : null,
        currency: currencyDoc.exists ? { id: currencyDoc.id, ...currencyDoc.data() } : null,
      };
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  }

  static async findByAccountNumber(accountNumber: string): Promise<any | null> {
    if (isBuildTime()) return null;

    try {
      const snapshot = await collections.accounts
        .where('accountNumber', '==', accountNumber)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      const [productDoc] = await Promise.all([
        collections.products.doc(data.productId).get(),
      ]);

      return {
        id: doc.id,
        ...this.convertTimestamps(data),
        product: productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null,
      };
    } catch (error) {
      console.error('Error fetching account by number:', error);
      return null;
    }
  }

  static async updateBalance(id: string, amount: number): Promise<void> {
    if (isDemoMode) {
      // In demo mode, get current data and update manually
      const doc = await collections.accounts.doc(id).get();
      if (!doc.exists) throw new Error('Account not found');
      const data = doc.data()!;
      await collections.accounts.doc(id).update({
        currentBalance: (data.currentBalance || 0) + amount,
        availableBalance: (data.availableBalance || 0) + amount,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await collections.accounts.doc(id).update({
        currentBalance: FieldValue.increment(amount) as any,
        availableBalance: FieldValue.increment(amount) as any,
        updatedAt: Timestamp.now() as any,
      });
    }
  }

  static async create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    if (isDemoMode) {
      const now = new Date().toISOString();
      const accountData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await collections.accounts.add(accountData as any);
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    }
    
    const now = Timestamp.now();
    const accountData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await collections.accounts.add(accountData as any);
    return {
      id: docRef.id,
      ...data,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  static async aggregateDeposits(): Promise<number> {
    if (isBuildTime()) return 0;

    try {
      const snapshot = await collections.accounts
        .where('accountType', 'in', ['SAVINGS', 'CURRENT', 'TERM_DEPOSIT'])
        .get();
      
      let total = 0;
      snapshot.docs.forEach(doc => {
        total += doc.data().currentBalance || 0;
      });
      
      return total;
    } catch (error) {
      console.error('Error aggregating deposits:', error);
      return 0;
    }
  }

  static async count(): Promise<number> {
    if (isBuildTime()) return 0;

    try {
      const snapshot = await collections.accounts.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('Error counting accounts:', error);
      return 0;
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

export default AccountService;
