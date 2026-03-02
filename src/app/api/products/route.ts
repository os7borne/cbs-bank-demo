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
    if (!body.productCode || !body.productName || !body.category || !body.currencyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build configuration object based on product type
    const config = body.productType === 'DEPOSIT' 
      ? {
          minOpeningBalance: body.minOpeningBalance || 0,
          interestRate: body.interestRate || 0,
          minBalance: body.minBalance || 0,
        }
      : {
          minAmount: body.minAmount || 0,
          maxAmount: body.maxAmount || 0,
          interestRate: body.interestRate || 0,
          maxTenure: body.maxTenure || 0,
        };

    const productData = {
      productCode: body.productCode,
      productName: body.productName,
      productType: body.productType,
      category: body.category,
      currencyId: body.currencyId,
      status: 'ACTIVE',
      effectiveFrom: isDemoMode ? new Date().toISOString() : Timestamp.now(),
      version: 1,
      isLatestVersion: true,
      configuration: JSON.stringify(config),
      description: body.description || '',
      createdBy: session.user.id,
      approvedBy: session.user.id,
      approvedAt: isDemoMode ? new Date().toISOString() : Timestamp.now(),
      createdAt: isDemoMode ? new Date().toISOString() : Timestamp.now(),
      updatedAt: isDemoMode ? new Date().toISOString() : Timestamp.now(),
    };

    const docRef = await collections.products.add(productData as any);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      productCode: body.productCode,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const snapshot = await collections.products
      .where('status', '==', 'ACTIVE')
      .orderBy('productCode')
      .get();
    
    const products = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
