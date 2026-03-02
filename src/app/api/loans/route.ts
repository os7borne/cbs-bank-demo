import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { LoanService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerId || !body.productId || !body.branchId || !body.principalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate EMI
    const principal = body.principalAmount;
    const rate = body.interestRate / 12 / 100;
    const tenure = body.tenureMonths;
    const emi = principal * rate * Math.pow(1 + rate, tenure) / (Math.pow(1 + rate, tenure) - 1);

    // Generate loan number
    const loanNumber = `LN${Date.now().toString().slice(-6)}`;

    const loan = await LoanService.create({
      loanNumber,
      customerId: body.customerId,
      productId: body.productId,
      disbursementAccountId: body.disbursementAccountId,
      branchId: body.branchId,
      applicationDate: new Date(),
      principalAmount: body.principalAmount,
      interestRate: body.interestRate,
      tenureMonths: body.tenureMonths,
      emiAmount: Math.round(emi),
      principalOutstanding: body.principalAmount,
      interestAccrued: 0,
      interestPaid: 0,
      principalPaid: 0,
      penaltyCharged: 0,
      penaltyPaid: 0,
      status: 'APPLICATION',
      daysPastDue: 0,
      createdBy: session.user.id,
    } as any);

    return NextResponse.json({
      success: true,
      id: loan.id,
      loanNumber: loan.loanNumber,
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create loan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const loans = await LoanService.findAll(limit);
    
    return NextResponse.json({ loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}
