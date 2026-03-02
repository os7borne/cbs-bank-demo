// Firebase Admin SDK Configuration (Server-side only)
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import {
  demoBranches,
  demoCurrencies,
  demoGlAccounts,
  demoProducts,
  demoCustomers,
  demoAccounts,
  demoLoans,
  demoTransactions,
  demoBatchJobs,
  demoWorkflowRequests,
  demoUsers,
  demoRoles,
} from './demo-data-store';

let app: App | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Check if we're in build mode or demo mode
const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);

// Demo mode - use JSON data instead of Firebase
const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.FIREBASE_PRIVATE_KEY;

// Helper to properly parse private key from env variable
function parsePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  let parsed = key;
  
  // If the key is wrapped in quotes, remove them
  if (parsed.startsWith('"') && parsed.endsWith('"')) {
    parsed = parsed.slice(1, -1);
  }
  if (parsed.startsWith("'") && parsed.endsWith("'")) {
    parsed = parsed.slice(1, -1);
  }
  
  // Replace escaped newlines with actual newlines
  parsed = parsed.replace(/\\n/g, '\n');
  
  return parsed;
}

if (!isDemoMode && getApps().length === 0) {
  // For production with credentials, use environment variables
  const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  const hasValidCredentials = 
    privateKey && 
    privateKey !== 'your_private_key' && 
    privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
    projectId &&
    clientEmail;
  
  if (hasValidCredentials) {
    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized with credentials');
    } catch (error) {
      console.warn('Failed to initialize Firebase Admin with credentials:', error);
      if (!isBuild) {
        throw error;
      }
    }
  }
  
  // If still no app (build time), use a minimal app
  if (!app) {
    console.log('Using mock Firebase Admin for build time');
    app = initializeApp({
      projectId: projectId || 'demo-project',
    }, 'build-app');
  }
} else if (!isDemoMode) {
  app = getApps()[0];
}

// Initialize db and auth if using real Firebase
if (!isDemoMode && app) {
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };

// Collection references - uses demo data in DEMO_MODE, real Firestore otherwise
export const collections = {
  get users() { 
    return isDemoMode ? demoUsers : db!.collection('users'); 
  },
  get roles() { 
    return isDemoMode ? demoRoles : db!.collection('roles'); 
  },
  get permissions() { 
    return isDemoMode ? demoRoles : db!.collection('permissions'); 
  },
  get branches() { 
    return isDemoMode ? demoBranches : db!.collection('branches'); 
  },
  get currencies() { 
    return isDemoMode ? demoCurrencies : db!.collection('currencies'); 
  },
  get customers() { 
    return isDemoMode ? demoCustomers : db!.collection('customers'); 
  },
  get customerAddresses() { 
    return isDemoMode ? demoCustomers : db!.collection('customerAddresses'); 
  },
  get customerContacts() { 
    return isDemoMode ? demoCustomers : db!.collection('customerContacts'); 
  },
  get kycRecords() { 
    return isDemoMode ? demoCustomers : db!.collection('kycRecords'); 
  },
  get documents() { 
    return isDemoMode ? demoCustomers : db!.collection('documents'); 
  },
  get products() { 
    return isDemoMode ? demoProducts : db!.collection('products'); 
  },
  get interestRateTiers() { 
    return isDemoMode ? demoProducts : db!.collection('interestRateTiers'); 
  },
  get fees() { 
    return isDemoMode ? demoProducts : db!.collection('fees'); 
  },
  get glAccounts() { 
    return isDemoMode ? demoGlAccounts : db!.collection('glAccounts'); 
  },
  get glMappings() { 
    return isDemoMode ? demoGlAccounts : db!.collection('glMappings'); 
  },
  get accounts() { 
    return isDemoMode ? demoAccounts : db!.collection('accounts'); 
  },
  get accountHolds() { 
    return isDemoMode ? demoAccounts : db!.collection('accountHolds'); 
  },
  get beneficiaries() { 
    return isDemoMode ? demoAccounts : db!.collection('beneficiaries'); 
  },
  get journalEntries() { 
    return isDemoMode ? demoTransactions : db!.collection('journalEntries'); 
  },
  get ledgerEntries() { 
    return isDemoMode ? demoTransactions : db!.collection('ledgerEntries'); 
  },
  get journalEntryGl() { 
    return isDemoMode ? demoTransactions : db!.collection('journalEntryGl'); 
  },
  get balanceSnapshots() { 
    return isDemoMode ? demoAccounts : db!.collection('balanceSnapshots'); 
  },
  get loans() { 
    return isDemoMode ? demoLoans : db!.collection('loans'); 
  },
  get loanSchedules() { 
    return isDemoMode ? demoLoans : db!.collection('loanSchedules'); 
  },
  get loanPayments() { 
    return isDemoMode ? demoLoans : db!.collection('loanPayments'); 
  },
  get workflowRequests() { 
    return isDemoMode ? demoWorkflowRequests : db!.collection('workflowRequests'); 
  },
  get auditEvents() { 
    return isDemoMode ? demoTransactions : db!.collection('auditEvents'); 
  },
  get batchJobs() { 
    return isDemoMode ? demoBatchJobs : db!.collection('batchJobs'); 
  },
} as const;

export default db;
