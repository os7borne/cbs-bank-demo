import { collections } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

export interface Loan {
  id?: string;
  loanNumber: string;
  customerId: string;
  productId: string;
  disbursementAccountId: string;
  repaymentAccountId?: string;
  branchId: string;
  applicationDate: Date;
  sanctionDate?: Date;
  disbursementDate?: Date;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount?: number;
  totalInterest?: number;
  principalOutstanding: number;
  interestAccrued: number;
  interestPaid: number;
  principalPaid: number;
  penaltyCharged: number;
  penaltyPaid: number;
  status: 'APPLICATION' | 'UNDERWRITING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'ACTIVE' | 'CLOSED' | 'WRITTEN_OFF';
  subStatus?: string;
  daysPastDue: number;
  delinquencyBucket?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  createdBy: string;
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

export class LoanService {
  static async findAll(limit = 50): Promise<any[]> {
    if (isBuildTime()) return [];

    try {
      const snapshot = await collections.loans
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          const [productDoc, accountDoc] = await Promise.all([
            collections.products.doc(data.productId).get(),
            collections.accounts.doc(data.disbursementAccountId).get(),
          ]);

          let customer = null;
          if (accountDoc.exists) {
            const customerDoc = await collections.customers.doc(accountDoc.data()?.customerId).get();
            if (customerDoc.exists) {
              const cData = customerDoc.data()!;
              customer = {
                id: customerDoc.id,
                customerType: cData.customerType,
                firstName: cData.firstName,
                lastName: cData.lastName,
                companyName: cData.companyName,
              };
            }
          }

          return {
            id: doc.id,
            ...this.convertTimestamps(data),
            product: productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null,
            disbursementAccount: accountDoc.exists ? { 
              id: accountDoc.id, 
              ...accountDoc.data(),
              customer,
            } : null,
          };
        })
      );
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  }

  static async aggregateOutstanding(): Promise<number> {
    if (isBuildTime()) return 0;

    try {
      const snapshot = await collections.loans.get();
      
      let total = 0;
      snapshot.docs.forEach(doc => {
        total += doc.data().principalOutstanding || 0;
      });
      
      return total;
    } catch (error) {
      console.error('Error aggregating loans:', error);
      return 0;
    }
  }

  static async countByStatus(): Promise<{ active: number; overdue: number }> {
    if (isBuildTime()) return { active: 0, overdue: 0 };

    try {
      const [activeSnapshot, overdueSnapshot] = await Promise.all([
        collections.loans.where('status', '==', 'ACTIVE').count().get(),
        collections.loans.where('daysPastDue', '>', 0).count().get(),
      ]);

      return {
        active: activeSnapshot.data().count,
        overdue: overdueSnapshot.data().count,
      };
    } catch (error) {
      console.error('Error counting loans:', error);
      return { active: 0, overdue: 0 };
    }
  }

  static async findById(id: string): Promise<any | null> {
    if (isBuildTime()) return null;

    try {
      const doc = await collections.loans.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      
      // Fetch related data
      const [productDoc, accountDoc] = await Promise.all([
        collections.products.doc(data.productId).get(),
        collections.accounts.doc(data.disbursementAccountId).get(),
      ]);

      let customer = null;
      if (accountDoc.exists) {
        const customerDoc = await collections.customers.doc(accountDoc.data()?.customerId).get();
        if (customerDoc.exists) {
          const cData = customerDoc.data()!;
          customer = {
            id: customerDoc.id,
            customerType: cData.customerType,
            firstName: cData.firstName,
            lastName: cData.lastName,
            companyName: cData.companyName,
          };
        }
      }

      return {
        id: doc.id,
        ...this.convertTimestamps(data),
        product: productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null,
        disbursementAccount: accountDoc.exists ? { 
          id: accountDoc.id, 
          ...accountDoc.data(),
          customer,
        } : null,
      };
    } catch (error) {
      console.error('Error fetching loan:', error);
      return null;
    }
  }

  static async create(data: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loan> {
    if (isDemoMode) {
      const now = new Date().toISOString();
      const loanData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await collections.loans.add(loanData as any);
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      } as Loan;
    }

    const now = Timestamp.now();
    const loanData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await collections.loans.add(loanData as any);
    return {
      id: docRef.id,
      ...data,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    } as Loan;
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

export default LoanService;
