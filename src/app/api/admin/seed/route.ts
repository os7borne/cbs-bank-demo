import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { demoData } from '@/lib/demo-data-store';

// Check if in demo mode
const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

// This is a simplified seed for the UI demo
// It creates essential data without external file dependencies

const now = () => Timestamp.now();
const daysAgo = (days: number) => Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

// Essential data only
const branches = [
  { code: 'HO001', name: 'Head Office - Mumbai', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'BR002', name: 'Delhi Branch', city: 'Delhi', state: 'Delhi' },
  { code: 'BR003', name: 'Bangalore Branch', city: 'Bangalore', state: 'Karnataka' },
];

const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isActive: true, isSystemCurrency: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true, isSystemCurrency: false },
];

const glAccounts = [
  { accountCode: '1001', accountName: 'Cash on Hand', accountType: 'ASSET', category: 'ASSETS_CASH', openingBalance: 50000000 },
  { accountCode: '1101', accountName: 'Customer Deposits - Savings', accountType: 'LIABILITY', category: 'LIABILITIES_DEPOSITS', openingBalance: 0 },
  { accountCode: '1102', accountName: 'Customer Deposits - Current', accountType: 'LIABILITY', category: 'LIABILITIES_DEPOSITS', openingBalance: 0 },
  { accountCode: '1201', accountName: 'Loans Receivable', accountType: 'ASSET', category: 'ASSETS_LOANS', openingBalance: 0 },
  { accountCode: '4001', accountName: 'Interest Income', accountType: 'INCOME', category: 'INCOME_INTEREST', openingBalance: 0 },
  { accountCode: '4101', accountName: 'Fee Income', accountType: 'INCOME', category: 'INCOME_FEES', openingBalance: 0 },
];

const products = [
  { productCode: 'SAV001', productName: 'Regular Savings Account', productType: 'DEPOSIT', category: 'SAVINGS', config: { minOpeningBalance: 1000, interestRate: 3.5 } },
  { productCode: 'CUR001', productName: 'Business Current Account', productType: 'DEPOSIT', category: 'CURRENT', config: { minOpeningBalance: 10000 } },
  { productCode: 'PL001', productName: 'Personal Loan', productType: 'LOAN', category: 'PERSONAL_LOAN', config: { minAmount: 50000, maxAmount: 2000000, interestRate: 12 } },
];

const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anita', 'Suresh', 'Deepa', 'Ravi', 'Meera'];
const lastNames = ['Kumar', 'Sharma', 'Patel', 'Gupta', 'Singh', 'Reddy', 'Nair', 'Desai', 'Shah', 'Mehta'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
const states: Record<string, string> = { Mumbai: 'Maharashtra', Delhi: 'Delhi', Bangalore: 'Karnataka', Chennai: 'Tamil Nadu', Hyderabad: 'Telangana' };

async function clearExistingData() {
  if (isDemoMode) {
    // In demo mode, data is from JSON file - cannot clear
    return;
  }
  
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  const collectionNames = ['branches', 'currencies', 'glAccounts', 'glMappings', 'products', 'customers', 'accounts', 'loans', 'batchJobs', 'workflowRequests'];
  
  for (const colName of collectionNames) {
    try {
      const snapshot = await db.collection(colName).get();
      if (snapshot.size > 0) {
        const batchSize = 500;
        for (let i = 0; i < snapshot.size; i += batchSize) {
          const batch = db.batch();
          snapshot.docs.slice(i, i + batchSize).forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      }
    } catch (error) {
      console.log(`Could not clear ${colName}`);
    }
  }
}

async function seedEssentialData(): Promise<string[] | { fromDemoFile: boolean; details: string[] }> {
  const results: string[] = [];
  
  if (isDemoMode) {
    // In demo mode, data comes from JSON file
    return {
      fromDemoFile: true,
      details: [
        `✅ ${demoData.branches.length} branches (from demo-data.json)`,
        `✅ ${demoData.currencies.length} currencies (from demo-data.json)`,
        `✅ ${demoData.glAccounts.length} GL accounts (from demo-data.json)`,
        `✅ ${demoData.products.length} products (from demo-data.json)`,
        `✅ ${demoData.customers.length} customers (from demo-data.json)`,
        `✅ ${demoData.accounts.length} accounts (from demo-data.json)`,
        `✅ ${demoData.loans.length} loans (from demo-data.json)`,
        `✅ ${demoData.transactions.length} transactions (from demo-data.json)`,
        `✅ ${demoData.batchJobs.length} batch jobs (from demo-data.json)`,
        `✅ ${demoData.workflowRequests.length} workflow requests (from demo-data.json)`,
      ],
    };
  }
  
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  // Seed branches
  const branchRefs: string[] = [];
  for (const branch of branches) {
    const ref = db.collection('branches').doc();
    await ref.set({
      ...branch,
      address: `${Math.floor(Math.random() * 100) + 1} Main Road`,
      country: 'IN',
      postalCode: String(400000 + Math.floor(Math.random() * 100000)),
      phone: `+91-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90000000) + 10000000}`,
      email: `${branch.code.toLowerCase()}@indiabank.demo`,
      isActive: true,
      openingDate: daysAgo(365 * 3),
      createdAt: now(),
      updatedAt: now(),
    });
    branchRefs.push(ref.id);
  }
  results.push(`✅ Created ${branchRefs.length} branches`);
  
  // Seed currencies
  const currencyRefs: Record<string, string> = {};
  for (const curr of currencies) {
    const ref = db.collection('currencies').doc();
    await ref.set({ ...curr, createdAt: now() });
    currencyRefs[curr.code] = ref.id;
  }
  results.push(`✅ Created ${Object.keys(currencyRefs).length} currencies`);
  
  // Seed GL accounts
  const glRefs: Record<string, string> = {};
  for (const gl of glAccounts) {
    const ref = db.collection('glAccounts').doc();
    await ref.set({
      ...gl,
      currentBalance: gl.openingBalance,
      isActive: true,
      isLeaf: true,
      createdAt: now(),
      updatedAt: now(),
    });
    glRefs[gl.accountCode] = ref.id;
  }
  results.push(`✅ Created ${Object.keys(glRefs).length} GL accounts`);
  
  // Seed GL mappings
  const mappings = [
    { transactionType: 'CASH_DEPOSIT', debitGlId: glRefs['1001'], creditGlId: glRefs['1101'], description: 'Cash deposit' },
    { transactionType: 'CASH_WITHDRAWAL', debitGlId: glRefs['1101'], creditGlId: glRefs['1001'], description: 'Cash withdrawal' },
  ];
  for (const mapping of mappings) {
    await db.collection('glMappings').add({ ...mapping, effectiveFrom: daysAgo(365), isActive: true });
  }
  results.push(`✅ Created ${mappings.length} GL mappings`);
  
  // Seed products
  const productRefs: string[] = [];
  for (const prod of products) {
    const ref = db.collection('products').doc();
    await ref.set({
      productCode: prod.productCode,
      productName: prod.productName,
      productType: prod.productType,
      category: prod.category,
      currencyId: currencyRefs['INR'],
      status: 'ACTIVE',
      effectiveFrom: daysAgo(365),
      version: 1,
      isLatestVersion: true,
      configuration: JSON.stringify(prod.config),
      createdBy: 'system',
      approvedBy: 'system',
      approvedAt: daysAgo(365),
      createdAt: now(),
      updatedAt: now(),
    });
    productRefs.push(ref.id);
  }
  results.push(`✅ Created ${productRefs.length} products`);
  
  // Seed 20 customers
  const customerData: Array<{ id: string; branchId: string }> = [];
  for (let i = 0; i < 20; i++) {
    const isBusiness = i >= 15;
    const firstName = isBusiness ? undefined : firstNames[i % firstNames.length];
    const lastName = isBusiness ? undefined : lastNames[i % lastNames.length];
    const companyName = isBusiness ? `${lastNames[i % lastNames.length]} Enterprises` : undefined;
    const city = cities[i % cities.length];
    const branchId = branchRefs[i % branchRefs.length];
    
    const customerRef = db.collection('customers').doc();
    await customerRef.set({
      customerNumber: `CUST${String(i + 1).padStart(5, '0')}`,
      customerType: isBusiness ? 'BUSINESS' : 'INDIVIDUAL',
      status: 'ACTIVE',
      salutation: isBusiness ? null : ['Mr', 'Ms', 'Mrs'][i % 3],
      firstName: firstName || null,
      lastName: lastName || null,
      companyName: companyName || null,
      primaryEmail: isBusiness ? `info@${companyName?.toLowerCase().replace(/\s+/g, '')}.com` : `${firstName?.toLowerCase()}.${lastName?.toLowerCase()}@example.com`,
      primaryPhone: `+91-9${String(i + 1).padStart(9, '0')}`,
      riskRating: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
      isPEP: false,
      isSanctioned: false,
      kycStatus: 'COMPLETED',
      branchId,
      createdAt: daysAgo(200 - i * 5),
      updatedAt: daysAgo(30),
    });
    
    // Add address
    await db.collection('customerAddresses').add({
      customerId: customerRef.id,
      addressType: 'RESIDENTIAL',
      addressLine1: `${Math.floor(Math.random() * 200) + 1} Main Street`,
      city,
      state: states[city],
      country: 'IN',
      postalCode: String(400000 + i),
      isPrimary: true,
      isVerified: true,
      verifiedAt: daysAgo(300),
    });
    
    customerData.push({ id: customerRef.id, branchId });
  }
  results.push(`✅ Created ${customerData.length} customers`);
  
  // Seed accounts (1-2 per customer)
  let accountCount = 0;
  for (const customer of customerData) {
    const numAccounts = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < numAccounts; j++) {
      const productId = productRefs[j % productRefs.length];
      const openingBalance = [5000, 25000, 100000][Math.floor(Math.random() * 3)];
      
      await db.collection('accounts').add({
        accountNumber: `${1000000000 + accountCount}`,
        customerId: customer.id,
        productId,
        branchId: customer.branchId,
        currencyId: currencyRefs['INR'],
        accountType: j === 0 ? 'SAVINGS' : 'CURRENT',
        status: 'ACTIVE',
        openingDate: daysAgo(180),
        currentBalance: openingBalance,
        availableBalance: openingBalance,
        blockedAmount: 0,
        overdraftLimit: 0,
        interestAccrued: 0,
        interestPaid: 0,
        openedBy: 'system',
        createdAt: daysAgo(180),
        updatedAt: now(),
      });
      accountCount++;
    }
  }
  results.push(`✅ Created ${accountCount} accounts`);
  
  // Seed 10 loans
  for (let i = 0; i < 10; i++) {
    const customer = customerData[i];
    const principalAmount = 100000 + Math.floor(Math.random() * 900000);
    const status = ['ACTIVE', 'DISBURSED', 'CLOSED'][i % 3];
    const isDisbursed = status !== 'APPLICATION';
    
    await db.collection('loans').add({
      loanNumber: `LN${2024001 + i}`,
      customerId: customer.id,
      productId: productRefs[2], // Personal loan
      disbursementAccountId: 'demo-account',
      branchId: customer.branchId,
      applicationDate: daysAgo(200),
      disbursementDate: isDisbursed ? daysAgo(180) : null,
      principalAmount,
      interestRate: 12,
      tenureMonths: 36,
      emiAmount: Math.floor(principalAmount * 1.12 / 36),
      principalOutstanding: isDisbursed ? principalAmount * 0.7 : 0,
      interestAccrued: isDisbursed ? Math.floor(principalAmount * 0.12 / 12) : 0,
      interestPaid: status === 'CLOSED' ? Math.floor(principalAmount * 0.36) : Math.floor(principalAmount * 0.12),
      principalPaid: status === 'CLOSED' ? principalAmount : Math.floor(principalAmount * 0.3),
      status,
      daysPastDue: i % 4 === 0 ? Math.floor(Math.random() * 30) : 0,
      createdAt: daysAgo(200),
      updatedAt: now(),
    });
  }
  results.push(`✅ Created 10 loans`);
  
  // Seed batch jobs
  const jobs = [
    { jobName: 'Interest Accrual - Savings', jobType: 'INTEREST_ACCRUAL', status: 'COMPLETED', totalRecords: 150, processed: 150 },
    { jobName: 'EOD - Mumbai Branch', jobType: 'EOD', status: 'COMPLETED', totalRecords: 5000, processed: 5000 },
    { jobName: 'EOD - Delhi Branch', jobType: 'EOD', status: 'COMPLETED', totalRecords: 3500, processed: 3500 },
    { jobName: 'Interest Accrual - Loans', jobType: 'INTEREST_ACCRUAL', status: 'RUNNING', totalRecords: 20, processed: 15 },
  ];
  
  for (const job of jobs) {
    await db.collection('batchJobs').add({
      ...job,
      failedRecords: 0,
      startedAt: daysAgo(1),
      completedAt: job.status === 'COMPLETED' ? daysAgo(1) : null,
      runBy: 'system',
      businessDate: daysAgo(1),
      log: job.status === 'COMPLETED' ? 'Batch completed successfully' : null,
    });
  }
  results.push(`✅ Created ${jobs.length} batch jobs`);
  
  // Seed workflow requests
  await db.collection('workflowRequests').add({
    requestType: 'ACCOUNT_FREEZE',
    entityType: 'Account',
    entityId: 'demo-account-1',
    requestData: JSON.stringify({ reason: 'Suspected fraudulent activity' }),
    reason: 'Suspected fraudulent activity',
    status: 'PENDING',
    priority: 'HIGH',
    createdBy: 'demo-cs-001',
    createdAt: daysAgo(2),
  });
  results.push(`✅ Created 1 workflow request`);
  
  return results;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const session = await requireAuth();
    const isAdmin = session.user.roles.some(r => r.name === 'ADMIN');
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { clearExisting = false } = await request.json().catch(() => ({ clearExisting: false }));
    
    // Clear existing data if requested
    if (clearExisting) {
      await clearExistingData();
    }
    
    // Seed new data
    const seedResult = await seedEssentialData();
    
    // Handle demo mode vs real Firebase response
    if ('fromDemoFile' in seedResult) {
      return NextResponse.json({
        success: true,
        message: 'Demo data loaded from JSON file (DEMO MODE)',
        details: seedResult.details,
        summary: {
          branches: demoData.branches.length,
          currencies: demoData.currencies.length,
          glAccounts: demoData.glAccounts.length,
          products: demoData.products.length,
          customers: demoData.customers.length,
          accounts: demoData.accounts.length,
          loans: demoData.loans.length,
          batchJobs: demoData.batchJobs.length,
          workflows: demoData.workflowRequests.length,
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      details: seedResult,
      summary: {
        branches: 3,
        currencies: 2,
        glAccounts: 6,
        products: 3,
        customers: 20,
        accounts: '30+',
        loans: 10,
        batchJobs: 4,
        workflows: 1,
      }
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
