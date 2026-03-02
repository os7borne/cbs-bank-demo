import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { collections } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.accountCode || !body.accountName || !body.accountType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const glData = {
      accountCode: body.accountCode,
      accountName: body.accountName,
      accountType: body.accountType,
      category: body.category || 'GENERAL',
      openingBalance: body.openingBalance || 0,
      currentBalance: body.openingBalance || 0,
      isActive: true,
      isLeaf: true,
      createdAt: isDemoMode ? new Date().toISOString() : Timestamp.now(),
      updatedAt: isDemoMode ? new Date().toISOString() : Timestamp.now(),
    };

    const docRef = await collections.glAccounts.add(glData as any);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      accountCode: body.accountCode,
    });
  } catch (error) {
    console.error('Error creating GL account:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create GL account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const snapshot = await collections.glAccounts
      .orderBy('accountCode')
      .get();
    
    const accounts = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
    
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching GL accounts:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch GL accounts' },
      { status: 500 }
    );
  }
}
