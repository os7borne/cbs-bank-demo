# India Bank - Core Banking System Demo

A comprehensive **Enterprise Core Banking System** demo built with modern web technologies. Features multi-role authentication, customer management, accounts, loans, transactions, operations, and reporting modules.

![Dashboard Screenshot](/dashboard.png)

![Demo Screenshot](https://img.shields.io/badge/Demo-Online-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)

---

## 🚀 Features

### Core Banking Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | KPI cards, recent transactions, workflow approvals, system alerts |
| **Customers** | Customer management, KYC tracking, risk ratings |
| **Accounts** | Account opening, balance tracking, transaction history |
| **Loans** | Loan applications, disbursement, repayment tracking, delinquency monitoring |
| **Transactions** | Cash deposits, withdrawals, transfers, interest credits |
| **Operations** | EOD processing, batch jobs, workflow approvals |
| **Reports** | Account statements, trial balance, audit trail |
| **Admin** | User management, branch management, GL accounts |

### Authentication & Roles

**6 Demo User Roles** with color-coded avatars and permission-based sidebar:

| Role | Color | Access |
|------|-------|--------|
| **Admin** | 🔵 Blue | Full system access |
| **Teller** | 🟢 Green | Customers, Accounts, Transactions |
| **Customer Service** | 🟣 Purple | Customers, Accounts (create/read/update) |
| **Operations** | 🟠 Amber | Transactions, Workflows, Batch Jobs |
| **Credit Officer** | 🩷 Pink | Customers, Loans (create/approve) |
| **Finance** | 🔵 Cyan | Transactions, Reports |

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: Server Components + React Server Actions
- **Data**: JSON-based demo data (no database required)

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd cbs

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 🔐 Demo Credentials

Quick login buttons are available on the login page. Click any role to auto-fill credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@indiabank.demo` | `admin123` |
| Teller | `teller@indiabank.demo` | `teller123` |
| Customer Service | `cs@indiabank.demo` | `cs123` |
| Operations | `ops@indiabank.demo` | `ops123` |
| Credit Officer | `credit@indiabank.demo` | `credit123` |
| Finance | `finance@indiabank.demo` | `finance123` |

---

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth group (login)
│   │   ├── (dashboard)/       # Dashboard group (protected routes)
│   │   │   ├── accounts/      # Account management
│   │   │   ├── admin/         # Admin modules
│   │   │   ├── customers/     # Customer management
│   │   │   ├── loans/         # Loan management
│   │   │   ├── operations/    # EOD, Batch, Workflows
│   │   │   ├── reports/       # Statements, Trial Balance, Audit
│   │   │   ├── transactions/  # Transaction listing
│   │   │   └── dashboard/     # Main dashboard
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Root redirect
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components (sidebar)
│   │   └── admin/             # Admin components
│   └── lib/
│       ├── services/          # Business logic services
│       ├── auth*.ts           # Authentication modules
│       ├── demo-data.json     # Demo data
│       ├── demo-data-store.ts # In-memory data store
│       ├── firebase*.ts       # Firebase adapters
│       ├── format.ts          # Formatting utilities
│       └── utils.ts           # Utility functions
├── .env                        # Environment variables
├── next.config.ts             # Next.js config
└── package.json               # Dependencies
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
# Demo Mode (no Firebase required)
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true

# Optional: Firebase (for production)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
```

**Note**: When `DEMO_MODE=true`, the app uses JSON data without requiring Firebase setup.

---

## 🎨 Role-Based Access Control

The sidebar automatically filters menu items based on user permissions:

```typescript
// Example permission check
const canAccessTransactions = hasPermission(userPermissions, 'transaction', 'read');
```

Each nav item has `requiredResource` and `requiredAction`:
- `Dashboard` - No restrictions
- `Customers` - `customer:read`
- `Accounts` - `account:read`
- `Transactions` - `transaction:read`
- `Loans` - `loan:read`
- `Operations` - `workflow:read`
- `Reports` - `report:read`
- `Admin` - `*:*` (admin only)

---

## 📊 Demo Data

The system comes pre-loaded with demo data:

- **3 Branches**: Mumbai (Head Office), Delhi, Bangalore
- **8 Customers**: Mix of individuals and businesses
- **8 Accounts**: Savings, Current, Fixed Deposits
- **5 Loans**: Various statuses (Active, Closed, Overdue)
- **8 Transactions**: Recent transactions with proper dates

All dates are set to 2025/2026 (relative to March 2026).

---

## 🚀 Build & Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Static Export (for hosting)

```bash
# Update next.config.ts for static export
npm run build
# Output in dist/ folder
```

---

## 🎯 Key Features Explained

### Quick Login
The login page features **6 colored buttons** that auto-fill credentials for each role. Click any role button to instantly populate email and password fields.

### Role-Colored UI
- **App Icon**: The bank icon in the sidebar uses the primary role's color
- **User Avatar**: The avatar in the top bar also reflects the role color

### Dashboard KPIs
- Total Deposits
- Loan Portfolio
- Total Customers
- Active Accounts

### Operations Center
- **EOD Processing**: End-of-day checklist with progress tracking
- **Batch Jobs**: Job scheduling and execution monitoring
- **Workflows**: Approval queue for account freezes, limit changes, etc.

### Reporting
- **Account Statements**: Generate statements with date range selection
- **Trial Balance**: GL account balances with validation
- **Audit Trail**: System activity logs with filtering

---

## 📝 Notes

- **Data Persistence**: Changes in demo mode are in-memory only (lost on refresh)
- **Authentication**: JWT-based auth with 24-hour expiration
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Build Strategy**: All Firebase services return empty arrays during static generation

---

## 🤝 Contributing

This is a demo project for showcasing core banking system capabilities. Feel free to fork and extend it.

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for demo purposes**

© 2026 India Bank Demo
