import { db, collections } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

export interface Customer {
  id?: string;
  customerNumber: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS' | 'TRUST' | 'GOVERNMENT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CLOSED';
  salutation?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  companyName?: string;
  dateOfBirth?: Date;
  incorporationDate?: Date;
  gender?: string;
  maritalStatus?: string;
  nationality: string;
  panNumber?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  primaryEmail: string;
  primaryPhone: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  isPEP: boolean;
  isSanctioned: boolean;
  kycStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'REJECTED';
  kycExpiryDate?: Date;
  branchId: string;
  relationshipManagerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Check if we're in build/static generation mode
const isBuildTime = () => {
  // In demo mode, never treat as build time - data should be available at runtime
  if (process.env.DEMO_MODE === 'true') return false;
  
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);
};

export class CustomerService {
  static async findAll(limit = 50): Promise<Customer[]> {
    if (isBuildTime()) {
      return []; // Return empty array during build
    }

    try {
      const snapshot = await collections.customers
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data()),
      } as Customer));
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  static async findById(id: string): Promise<Customer | null> {
    if (isBuildTime()) return null;

    try {
      const doc = await collections.customers.doc(id).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...this.convertTimestamps(doc.data()),
      } as Customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  static async findWithDetails(id: string): Promise<any | null> {
    if (isBuildTime()) return null;

    try {
      const customer = await this.findById(id);
      if (!customer) return null;

      // Fetch related data in parallel
      const [addressesSnapshot, contactsSnapshot, kycSnapshot, accountsSnapshot, documentsSnapshot] = await Promise.all([
        collections.customerAddresses.where('customerId', '==', id).get(),
        collections.customerContacts.where('customerId', '==', id).get(),
        collections.kycRecords.where('customerId', '==', id).get(),
        collections.accounts.where('customerId', '==', id).get(),
        collections.documents.where('customerId', '==', id).get(),
      ]);

      const branch = await collections.branches.doc(customer.branchId).get();

      return {
        ...customer,
        branch: branch.exists ? { ...branch.data(), id: branch.id } : null,
        addresses: addressesSnapshot.docs.map(d => ({ ...d.data(), id: d.id })),
        contacts: contactsSnapshot.docs.map(d => ({ ...d.data(), id: d.id })),
        kycRecords: kycSnapshot.docs.map(d => ({ ...this.convertTimestamps(d.data()), id: d.id })),
        accounts: accountsSnapshot.docs.map(d => ({ ...this.convertTimestamps(d.data()), id: d.id })),
        documents: documentsSnapshot.docs.map(d => ({ ...this.convertTimestamps(d.data()), id: d.id })),
      };
    } catch (error) {
      console.error('Error fetching customer details:', error);
      return null;
    }
  }

  static async create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    if (isDemoMode) {
      const now = new Date().toISOString();
      const customerData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await collections.customers.add(customerData as any);
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    }

    const now = Timestamp.now();
    const customerData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await collections.customers.add(customerData as any);
    return {
      id: docRef.id,
      ...data,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  static async update(id: string, data: Partial<Customer>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    delete (updateData as any).id;
    
    await collections.customers.doc(id).update(updateData);
  }

  static async count(): Promise<number> {
    if (isBuildTime()) return 0;

    try {
      const snapshot = await collections.customers.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('Error counting customers:', error);
      return 0;
    }
  }

  static async addAddress(customerId: string, address: any): Promise<void> {
    if (isBuildTime()) return;

    try {
      await collections.customerAddresses.add({
        ...address,
        customerId,
        createdAt: Timestamp.now(),
      } as any);
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  private static convertTimestamps(data: any): any {
    if (!data) return data;
    
    const result: any = { ...data };
    
    // Convert Timestamp to Date
    Object.keys(result).forEach(key => {
      if (result[key] instanceof Timestamp) {
        result[key] = result[key].toDate();
      }
    });
    
    return result;
  }
}

export default CustomerService;
