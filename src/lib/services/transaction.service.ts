import { collections, db } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { AccountService } from './account.service';

const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

// Demo transactions interface
interface DemoTransaction {
  id: string;
  reference: string;
  transactionType: string;
  debitAccountId: string | null;
  creditAccountId: string | null;
  amount: number;
  currencyId: string;
  narration: string;
  postedBy: string;
  postedAt: string;
  status: string;
  createdAt: string;
}

export interface JournalEntry {
  id?: string;
  entryNumber: string;
  entryDate: Date;
  transactionType: string;
  referenceType: string;
  referenceId: string;
  referenceNumber: string;
  totalDebit: number;
  totalCredit: number;
  currencyId: string;
  narration: string;
  notes?: string;
  status: 'PENDING' | 'POSTED' | 'REVERSED';
  reversalOfId?: string;
  reversedAt?: Date;
  reversalReason?: string;
  idempotencyKey?: string;
  postedBy: string;
  postedAt: Date;
  branchId: string;
  valueDate: Date;
}

const isBuildTime = () => {
  // In demo mode, never treat as build time - data should be available at runtime
  if (process.env.DEMO_MODE === 'true') return false;
  
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);
};

export class TransactionService {
  static async postTransaction(data: {
    transactionType: string;
    accountId: string;
    amount: number;
    currencyId: string;
    narration: string;
    referenceNumber?: string;
    postedBy: string;
    branchId: string;
    glMapping: { debitGlId: string; creditGlId: string };
  }): Promise<{ journalEntryId: string; entryNumber: string; runningBalance: number }> {
    
    // Demo mode - simplified transaction without Firestore transactions
    if (isDemoMode) {
      // Get account
      const accountDoc = await collections.accounts.doc(data.accountId).get();
      if (!accountDoc.exists) {
        throw new Error('Account not found');
      }
      
      const accountData = accountDoc.data()!;
      const isCredit = data.transactionType === 'CASH_DEPOSIT';
      const balanceChange = isCredit ? data.amount : -data.amount;
      const runningBalance = (accountData.currentBalance || 0) + balanceChange;
      
      // Update account balance
      await collections.accounts.doc(data.accountId).update({
        currentBalance: runningBalance,
        availableBalance: runningBalance,
        updatedAt: new Date().toISOString(),
      });
      
      return { 
        journalEntryId: uuidv4(), 
        entryNumber: `JV${String(Math.floor(Math.random() * 900000) + 100000)}`, 
        runningBalance 
      };
    }
    
    // Real Firestore transaction
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    return await db.runTransaction(async (t) => {
      // Get account for balance update
      const accountRef = (collections.accounts as any).doc(data.accountId);
      const accountDoc = await t.get(accountRef) as any;
      
      if (!accountDoc.exists) {
        throw new Error('Account not found');
      }
      
      const accountData = accountDoc.data()!;
      const isCredit = data.transactionType === 'CASH_DEPOSIT';
      const balanceChange = isCredit ? data.amount : -data.amount;
      const runningBalance = (accountData.currentBalance || 0) + balanceChange;
      
      // Generate entry number
      const entryCount = await collections.journalEntries.count().get();
      const entryNumber = `JV${String(entryCount.data().count + 1001).padStart(6, '0')}`;
      const journalEntryId = uuidv4();
      const now = Timestamp.now();
      
      // Create journal entry
      const journalEntryRef = (collections.journalEntries as any).doc(journalEntryId);
      t.set(journalEntryRef, {
        entryNumber,
        entryDate: now,
        transactionType: data.transactionType,
        referenceType: 'ACCOUNT',
        referenceId: data.accountId,
        referenceNumber: data.referenceNumber || entryNumber,
        totalDebit: data.amount,
        totalCredit: data.amount,
        currencyId: data.currencyId,
        narration: data.narration,
        status: 'POSTED',
        idempotencyKey: uuidv4(),
        postedBy: data.postedBy,
        postedAt: now,
        branchId: data.branchId,
        valueDate: now,
      });
      
      // Create GL entries
      t.set((collections.journalEntryGl as any).doc(uuidv4()), {
        journalEntryId,
        glAccountId: data.glMapping.debitGlId,
        entryType: 'DEBIT',
        amount: data.amount,
      });
      
      t.set((collections.journalEntryGl as any).doc(uuidv4()), {
        journalEntryId,
        glAccountId: data.glMapping.creditGlId,
        entryType: 'CREDIT',
        amount: data.amount,
      });
      
      // Update account balance
      t.update(accountRef, {
        currentBalance: FieldValue.increment(balanceChange),
        availableBalance: FieldValue.increment(balanceChange),
        updatedAt: now,
      });
      
      // Create ledger entry
      t.set((collections.ledgerEntries as any).doc(uuidv4()), {
        journalEntryId,
        accountId: data.accountId,
        entryType: isCredit ? 'CREDIT' : 'DEBIT',
        amount: data.amount,
        runningBalance,
        entryDate: now,
        valueDate: now,
        narration: data.narration,
      });
      
      return { journalEntryId, entryNumber, runningBalance };
    });
  }

  static async findRecent(limit = 5): Promise<any[]> {
    if (isBuildTime()) return [];

    try {
      // collections.journalEntries maps to demoTransactions in demo mode
      const snapshot = await collections.journalEntries
        .orderBy('postedAt', 'desc')
        .limit(limit)
        .get();
      
      return Promise.all(
        snapshot.docs.map(async (doc: any) => {
          const data = doc.data();
          
          // Get poster info
          let poster = null;
          try {
            const posterDoc = await collections.users.doc(data.postedBy).get();
            if (posterDoc.exists) {
              poster = {
                firstName: posterDoc.data()?.firstName,
                lastName: posterDoc.data()?.lastName,
              };
            }
          } catch (e) {
            // User might not exist in demo data
          }
          
          // Normalize data structure
          const normalizedData = isDemoMode ? {
            ...data,
            entryNumber: data.reference,
            totalDebit: data.amount,
            totalCredit: data.amount,
          } : this.convertTimestamps(data);
          
          return {
            id: doc.id,
            ...normalizedData,
            poster,
          };
        })
      );
    } catch (error) {
      console.error('Error fetching transactions:', error);
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

export default TransactionService;
