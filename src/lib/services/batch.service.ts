import { collections } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface BatchJob {
  id?: string;
  jobName: string;
  jobType: 'EOD' | 'EOM' | 'INTEREST_ACCRUAL' | 'FEE_PROCESSING';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt?: Date;
  completedAt?: Date;
  totalRecords?: number;
  processedRecords?: number;
  failedRecords?: number;
  runBy: string;
  branchId?: string;
  businessDate: Date;
  log?: string;
}

const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);
};

export class BatchService {
  static async findRecent(limit = 20): Promise<BatchJob[]> {
    if (isBuildTime()) return [];

    try {
      const snapshot = await collections.batchJobs
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data()),
      } as BatchJob));
    } catch (error) {
      console.error('Error fetching batch jobs:', error);
      return [];
    }
  }

  static async countPending(): Promise<number> {
    if (isBuildTime()) return 0;

    try {
      const snapshot = await collections.batchJobs
        .where('status', '==', 'PENDING')
        .count()
        .get();
      
      return snapshot.data().count;
    } catch (error) {
      console.error('Error counting pending batches:', error);
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

export default BatchService;
