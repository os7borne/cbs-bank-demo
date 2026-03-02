import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transaction.service';
import { AccountService } from '@/lib/services/account.service';
import { requireAuth } from '@/lib/auth';
import { collections } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    
    const { transactionType, accountNumber, amount, narration, referenceNumber } = body;

    if (!transactionType || !accountNumber || !amount || !narration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find account
    const account = await AccountService.findByAccountNumber(accountNumber);

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    if (account.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Account is ${account.status}` },
        { status: 400 }
      );
    }

    // Check sufficient balance for withdrawals
    if ((transactionType === 'CASH_WITHDRAWAL' || transactionType === 'DEBIT') && 
        account.availableBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }

    // Get GL mapping
    const glMappingSnapshot = await collections.glMappings
      .where('transactionType', '==', transactionType)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (glMappingSnapshot.empty) {
      return NextResponse.json(
        { error: 'GL mapping not found for this transaction type' },
        { status: 400 }
      );
    }

    const glMapping = glMappingSnapshot.docs[0].data() as { debitGlId: string; creditGlId: string };

    // Execute transaction
    const result = await TransactionService.postTransaction({
      transactionType,
      accountId: account.id,
      amount,
      currencyId: account.currencyId,
      narration,
      referenceNumber,
      postedBy: session.user.id,
      branchId: account.branchId,
      glMapping: {
        debitGlId: glMapping.debitGlId,
        creditGlId: glMapping.creditGlId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        journalEntryId: result.journalEntryId,
        entryNumber: result.entryNumber,
        accountBalance: result.runningBalance,
      },
    });
  } catch (error) {
    console.error('Transaction error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transaction failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const transactions = await TransactionService.findRecent(limit);

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
