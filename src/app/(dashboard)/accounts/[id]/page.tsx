import { AccountService } from '@/lib/services';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, User, Building2, Landmark, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FROZEN: 'bg-red-100 text-red-800',
  DORMANT: 'bg-gray-100 text-gray-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

async function getAccount(id: string) {
  const account = await AccountService.findById(id);
  return account;
}

export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  const account = await getAccount(id);

  if (!account) {
    notFound();
  }

  const customerName = account.customer?.customerType === 'INDIVIDUAL'
    ? `${account.customer?.firstName} ${account.customer?.lastName}`
    : account.customer?.companyName;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/accounts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Account Details</h1>
            <p className="text-muted-foreground">
              {account.accountNumber}
            </p>
          </div>
        </div>
        <Badge className={statusColors[account.status] || 'bg-gray-100'}>
          {account.status}
        </Badge>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-4xl font-bold">
                {formatCurrency(account.currentBalance)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Available: {formatCurrency(account.availableBalance)}
              </p>
            </div>
            <Wallet className="h-12 w-12 text-primary/50" />
          </div>
        </CardContent>
      </Card>

      {/* Account Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p className="font-medium">{customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Type</p>
              <p className="font-medium">{account.customer?.customerType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{account.customer?.primaryEmail}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/customers/${account.customerId}`}>
                View Customer Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-medium">{account.product?.productName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="font-medium">{account.accountType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="font-medium">{account.branch?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium">{account.currency?.code} ({account.currency?.symbol})</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Additional Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">{account.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Opening Date</p>
              <p className="font-medium">{formatDate(account.openingDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdraft Limit</p>
              <p className="font-medium">{formatCurrency(account.overdraftLimit || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blocked Amount</p>
              <p className="font-medium">{formatCurrency(account.blockedAmount || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Accrued</p>
              <p className="font-medium">{formatCurrency(account.interestAccrued || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Paid</p>
              <p className="font-medium">{formatCurrency(account.interestPaid || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(account.updatedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={statusColors[account.status] || 'bg-gray-100'}>
                {account.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Perform transactions on this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href={`/transactions?account=${account.id}&type=deposit`}>
                <ArrowDownRight className="mr-2 h-4 w-4" />
                Deposit
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/transactions?account=${account.id}&type=withdrawal`}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Withdraw
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/transactions?account=${account.id}&type=transfer`}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Transfer
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/transactions?account=${account.id}`}>
                <Clock className="mr-2 h-4 w-4" />
                View History
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
