import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { collections } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    
    const { id } = await params;
    
    const snapshot = await collections.accounts
      .where('customerId', '==', id)
      .where('status', '==', 'ACTIVE')
      .get();
    
    const accounts = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
    
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching customer accounts:', error);
    
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
