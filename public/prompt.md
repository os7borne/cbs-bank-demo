You are a senior staff engineer + product designer building an enterprise demo/prototype of a Core Banking System (CBS) for a bank. This is a NON-PRODUCTION demo: use mock data and simulated ledger movements only. Do NOT integrate with real payment networks. Do NOT include anything that enables fraud or evasion. Focus on accurate domain modeling, realistic workflows, auditability, and a polished enterprise UI.

GOAL
Build a web app called “India Bank Demo” that demonstrates how a bank’s core system works across customers, accounts, deposits, loans, cards (simulated), fees, interest, postings, GL mapping, operations, and audit. It should feel like Temenos/Finacle-style screens, but modern UX.

TECH STACK (choose sensible defaults and implement end-to-end)
- Frontend: Next.js (App Router) + TypeScript + Tailwind
- Component library: shadcn/ui (or equivalent)
- Backend: Node (Next.js API routes) OR NestJS (pick one, but keep it clean)
- DB: Postgres with Prisma (preferred) OR SQLite if you must (but model as if Postgres)
- Auth: local demo auth (email/password) + roles
- Seed: rich seed data for a small bank
- Testing: basic unit tests for ledger posting + interest accrual

NON-NEGOTIABLE DOMAIN PRINCIPLES
1) Double-entry ledger: every posting creates balanced debit/credit entries.
2) Immutable event/audit log: all key changes are recorded with who/when/what.
3) Maker-checker: certain actions require approval workflow.
4) Effective dating: products/rates/fees can change with effective dates.
5) Clear separation: Customer → Relationship → Account(s) → Sub-ledger → GL mapping.
6) Idempotency keys for posting APIs (simulate enterprise safety).
7) Multi-branch and multi-currency (at least model-level; FX can be mocked).

PERSONAS / ROLES
- Teller (cash deposit/withdrawal simulation, account inquiry)
- Customer Service (KYC updates, service requests, holds)
- Operations (approvals, back-office posting, reversals)
- Credit Officer (loan origination + approvals)
- Finance/GL (trial balance, GL mapping, EOD reports)
- Admin (product setup, user mgmt, permissions)

FEATURES (build these screens + workflows)
A) Dashboard
- KPIs: total deposits, loan book, delinquency, net interest income (mock), new accounts, pending approvals
- Work queues: “Pending approvals”, “Exceptions”, “Overdraft breaches”, “KYC expiring”

B) Customer & KYC
- Customer profiles (individual + business)
- KYC checklist, risk rating, PEP/sanctions flags (mock), document store (mock)
- Relationship linking: customer ↔ accounts ↔ nominees/beneficial owners
- Address/phone/email change with audit trail

C) Product Factory (enterprise feel)
- Deposit products: Savings, Current, Term Deposit (FD)
  - Interest method: daily accrual, monthly payout; tiered rates
  - Fees: min balance fee, SMS fee, account maintenance fee
  - Limits: txn limits, overdraft for Current
- Loan products: Personal Loan, SME Term Loan
  - Amortization schedule, interest calculation, fees (processing), penalty interest, prepayment rules
- Fee catalogue + posting rules
- GL mapping per product + transaction type
- Effective-dated configuration & versioning (view history)

D) Account Lifecycle
- Open account (select product, assign branch, currency, customer)
- Account states: Active, Frozen, Dormant, Closed
- Holds/blocks: amount holds, debit freeze, lien marking
- Nominee/beneficiary (demo)

E) Transactions & Posting (simulate teller + ops)
- Cash deposit/withdrawal (simulated cash ledger)
- Internal transfer between accounts
- Fee posting (manual + scheduled)
- Reversal workflow with reason codes
- Exceptions: insufficient funds, overdraft breach, blocked account
- Posting screen shows: journal entries + resulting balances + GL impact preview

F) Interest & EOD/EOM Processing
- Daily accrual batch job (simulate)
- Month-end interest application
- Term deposit creation with maturity handling (rollover, payout)
- EOD checklist with run logs, rerun safeguards, and maker-checker where needed

G) Loans
- Origination: application → underwriting → approval → disbursement
- Generate repayment schedule
- EMI collection posting
- Delinquency buckets (DPD), penalty accrual
- Restructure / moratorium (simplified) with audit trail

H) Reports (make it look “banky”)
- Account statement (filterable)
- Trial balance (GL)
- Product profitability snapshot (mock NIM, fees)
- Regulatory-style extracts (mock fields)
- Audit report: “who changed what”

ENTERPRISE UI/UX REQUIREMENTS
- Layout: left nav + top bar + breadcrumbs
- Powerful search: global search (customer/account/txn)
- Table features: filters, column chooser, saved views
- Detail pages with tabs: Overview / Transactions / Documents / Notes / Audit
- Consistent forms with inline validation, tooltips, and reason codes
- Everything should look modern, dense, and professional (not toy UI)

DATA MODEL (minimum entities)
- User, Role, Permission
- Branch, Currency
- Customer, KYCRecord, Document, RiskRating
- Product (versioned), InterestRateTier, Fee, GLAccount, GLMapping
- Account, AccountHold, Beneficiary
- LedgerJournal, LedgerEntry (double-entry), BalanceSnapshot
- Loan, LoanSchedule, LoanPayment, DelinquencyState
- WorkflowRequest (maker-checker approvals)
- AuditEvent

API + BEHAVIOR
- CRUD with validation
- Posting APIs create balanced journal + ledger entries
- Balance computed from ledger entries (and cached snapshots)
- Every write emits AuditEvent
- Maker-checker for: product changes, reversals, account freeze, loan approval, GL mapping changes

SEED DATA
- 3 branches, 2 currencies (INR + USD)
- 50 customers (mix of retail + SME)
- 200 accounts across products
- 20 loans with varied statuses
- Realistic transaction history (at least a few thousand ledger entries)

DELIVERABLES
1) Running app with instructions (README)
2) Database schema + migrations
3) Seed script
4) A “Demo Walkthrough” page that shows a step-by-step storyline:
   - Create customer → open savings → deposit → transfer → fee → run EOD → open loan → disburse → collect EMI → view reports

QUALITY BAR
- Clean architecture, typed APIs, reusable UI components
- No placeholder lorem; use realistic banking labels and reason codes
- Include security basics: role-based access + audit logs
- Make it feel enterprise-grade.

Start by outlining the system architecture + folder structure + DB schema, then implement incrementally:
Step 1 Auth + layout + navigation
Step 2 Customer/KYC
Step 3 Product factory
Step 4 Accounts + transactions + ledger
Step 5 Interest + batch
Step 6 Loans
Step 7 Reports + audit
Step 8 Seed data + demo walkthrough

Now build it.