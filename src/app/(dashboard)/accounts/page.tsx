import { AccountService } from '@/lib/services';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Wallet, Plus } from 'lucide-react';
import Link from 'next/link';

async function getAccounts() {
  const accounts = await AccountService.findAll(50);
  return accounts;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FROZEN: 'bg-red-100 text-red-800',
  DORMANT: 'bg-gray-100 text-gray-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            View and manage customer accounts
          </p>
        </div>
        <Button asChild>
          <Link href="/accounts/new">
            <Plus className="mr-2 h-4 w-4" />
            Open Account
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Account Directory
          </CardTitle>
          <CardDescription>
            {accounts.length} accounts found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <Link href={`/accounts/${account.id}`} className="hover:underline">
                        {account.accountNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {account.customer?.customerType === 'INDIVIDUAL'
                        ? `${account.customer?.firstName} ${account.customer?.lastName}`
                        : account.customer?.companyName}
                    </TableCell>
                    <TableCell>{account.product?.productName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.accountType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[account.status]}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(account.currentBalance)}
                    </TableCell>
                    <TableCell>{account.branch?.name}</TableCell>
                    <TableCell>{formatDate(account.openingDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
