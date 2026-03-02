import { CustomerService, AccountService, LoanService, BatchService, TransactionService } from '@/lib/services';
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemoNotification } from '@/components/demo-notification';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet, 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';

async function getDashboardData() {
  const [
    totalCustomers,
    totalAccounts,
    totalDeposits,
    totalLoans,
    loanStats,
    batchJobs,
    recentTransactions,
  ] = await Promise.all([
    CustomerService.count(),
    AccountService.count(),
    AccountService.aggregateDeposits(),
    LoanService.aggregateOutstanding(),
    LoanService.countByStatus(),
    BatchService.findRecent(3),
    TransactionService.findRecent(5),
  ]);

  return {
    totalCustomers,
    totalAccounts,
    totalDeposits,
    totalLoans,
    activeLoans: loanStats.active,
    overdueLoans: loanStats.overdue,
    pendingApprovals: 2, // Hardcoded for demo
    recentTransactions,
    batchJobs,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const kpiCards = [
    {
      title: 'Total Deposits',
      value: formatCurrency(data.totalDeposits),
      change: '+5.2%',
      trend: 'up',
      icon: Wallet,
      description: 'Across all deposit accounts',
    },
    {
      title: 'Loan Portfolio',
      value: formatCurrency(data.totalLoans),
      change: '+12.1%',
      trend: 'up',
      icon: Receipt,
      description: 'Total outstanding principal',
    },
    {
      title: 'Total Customers',
      value: formatNumber(data.totalCustomers),
      change: '+3.8%',
      trend: 'up',
      icon: Users,
      description: 'Active customer relationships',
    },
    {
      title: 'Active Accounts',
      value: formatNumber(data.totalAccounts),
      change: '+2.4%',
      trend: 'up',
      icon: Activity,
      description: 'All account types',
    },
  ];

  return (
    <div className="space-y-6">
      <DemoNotification />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to India Bank Demo. Here&apos;s your banking overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {card.trend === 'up' ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={card.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {card.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Work Queues */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">
            Pending Approvals
            {data.pendingApprovals > 0 && (
              <Badge variant="destructive" className="ml-2">
                {data.pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Approvals</CardTitle>
              <CardDescription>
                Items requiring your approval or review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.pendingApprovals === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>No pending approvals</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">Account Freeze Request</p>
                        <p className="text-sm text-muted-foreground">
                          Customer ID: CUST00001 - Suspected fraudulent activity
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/operations/workflows">Review</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exception Queue</CardTitle>
              <CardDescription>
                Accounts and transactions requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.overdueLoans > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700">
                          Overdue Loans
                        </p>
                        <p className="text-sm text-red-600">
                          {data.overdueLoans} loan(s) are past due date
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" asChild>
                      <Link href="/loans?filter=overdue">View</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Batch jobs and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.batchJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {job.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : job.status === 'FAILED' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium">{job.jobName}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.status} • {formatDate(job.completedAt || job.startedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={job.status === 'COMPLETED' ? 'default' : 'destructive'}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest posted transactions across all accounts
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentTransactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{txn.transactionType}</p>
                    <p className="text-sm text-muted-foreground">
                      {txn.entryNumber} • {txn.poster?.firstName} {txn.poster?.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(txn.totalDebit)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(txn.postedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
