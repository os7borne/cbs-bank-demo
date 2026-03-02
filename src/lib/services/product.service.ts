import { collections } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface Product {
  id?: string;
  productCode: string;
  productName: string;
  productType: 'DEPOSIT' | 'LOAN' | 'CARD';
  category: string;
  currencyId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  effectiveFrom: Date;
  effectiveTo?: Date;
  version: number;
  isLatestVersion: boolean;
  configuration: string;
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

export class ProductService {
  static async findAll(): Promise<any[]> {
    if (isBuildTime()) return [];

    try {
      const snapshot = await collections.products
        .orderBy('productCode', 'asc')
        .get();
      
      return Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          const [currencyDoc, tiersSnapshot, accountsCount] = await Promise.all([
            collections.currencies.doc(data.currencyId).get(),
            collections.interestRateTiers
              .where('productId', '==', doc.id)
              .where('isActive', '==', true)
              .get(),
            collections.accounts.where('productId', '==', doc.id).count().get(),
          ]);

          return {
            ...this.convertTimestamps(data),
            id: doc.id,
            currency: currencyDoc.exists ? { ...currencyDoc.data(), id: currencyDoc.id } : null,
            interestRateTiers: tiersSnapshot.docs.map(t => ({ ...t.data(), id: t.id })),
            _count: { accounts: accountsCount.data().count },
          };
        })
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
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

export default ProductService;
