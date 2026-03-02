import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CustomerService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await requireAuth();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.primaryEmail || !body.primaryPhone || !body.branchId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.customerType === 'INDIVIDUAL' && (!body.firstName || !body.lastName)) {
      return NextResponse.json(
        { error: 'First name and last name are required for individuals' },
        { status: 400 }
      );
    }

    if (body.customerType === 'BUSINESS' && !body.companyName) {
      return NextResponse.json(
        { error: 'Company name is required for business customers' },
        { status: 400 }
      );
    }

    // Generate customer number
    const customerNumber = `CUST${String(Date.now()).slice(-8)}`;

    // Create customer
    const customer = await CustomerService.create({
      customerNumber,
      customerType: body.customerType,
      status: 'ACTIVE',
      salutation: body.salutation || null,
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      companyName: body.companyName || null,
      primaryEmail: body.primaryEmail,
      primaryPhone: body.primaryPhone,
      nationality: 'IN',
      riskRating: body.riskRating || 'LOW',
      isPEP: body.isPEP || false,
      isSanctioned: false,
      kycStatus: body.kycStatus || 'PENDING',
      branchId: body.branchId,
    } as any);

    // Create address if provided
    if (body.addressLine1 && customer.id) {
      await CustomerService.addAddress(customer.id, {
        customerId: customer.id,
        addressType: 'RESIDENTIAL',
        addressLine1: body.addressLine1,
        city: body.city,
        state: body.state,
        country: body.country || 'IN',
        postalCode: body.postalCode,
        isPrimary: true,
        isVerified: false,
      });
    }

    return NextResponse.json({
      success: true,
      id: customer.id,
      customerNumber: customer.customerNumber,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const customers = await CustomerService.findAll(limit);
    
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
