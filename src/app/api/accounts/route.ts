import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { AccountService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerId || !body.productId || !body.branchId || !body.accountType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate account number
    const accountNumber = `${1000000000 + Math.floor(Math.random() * 900000000)}`;

    const account = await AccountService.create({
      accountNumber,
      customerId: body.customerId,
      productId: body.productId,
      branchId: body.branchId,
      currencyId: 'curr-001', // Default to INR
      accountType: body.accountType,
      status: 'ACTIVE',
      openingDate: new Date(),
      currentBalance: body.openingBalance || 0,
      availableBalance: body.openingBalance || 0,
      blockedAmount: 0,
      overdraftLimit: 0,
      interestAccrued: 0,
      interestPaid: 0,
      openedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      id: account.id,
      accountNumber: account.accountNumber,
    });
  } catch (error) {
    console.error('Error creating account:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const accounts = await AccountService.findAll(limit);
    
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
