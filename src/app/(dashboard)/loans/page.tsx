import { LoanService } from '@/lib/services';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/format';
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
import { Receipt, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

async function getLoans() {
  const loans = await LoanService.findAll(50);
  return loans;
}

const statusColors: Record<string, string> = {
  APPLICATION: 'bg-yellow-100 text-yellow-800',
  UNDERWRITING: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  DISBURSED: 'bg-purple-100 text-purple-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  WRITTEN_OFF: 'bg-red-100 text-red-800',
};

export default async function LoansPage() {
  const loans = await getLoans();
  const overdueLoans = loans.filter(l => l.daysPastDue > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">
            Manage loan applications and portfolio
          </p>
        </div>
        <Button asChild>
          <Link href="/loans/new">
            <Plus className="mr-2 h-4 w-4" />
            New Loan
          </Link>
        </Button>
      </div>

      {overdueLoans.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-700 text-base">
              <AlertCircle className="h-5 w-5" />
              Delinquency Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {overdueLoans.length} loan(s) are currently past due. Immediate attention required.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Loan Portfolio
          </CardTitle>
          <CardDescription>
            {loans.length} loans found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>DPD</TableHead>
                  <TableHead>Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">
                      <Link href={`/loans/${loan.id}`} className="hover:underline">
                        {loan.loanNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {loan.disbursementAccount?.customer?.customerType === 'INDIVIDUAL'
                        ? `${loan.disbursementAccount?.customer?.firstName} ${loan.disbursementAccount?.customer?.lastName}`
                        : loan.disbursementAccount?.customer?.companyName}
                    </TableCell>
                    <TableCell>{loan.product?.productName}</TableCell>
                    <TableCell>{formatCurrency(loan.principalAmount)}</TableCell>
                    <TableCell>{formatPercentage(loan.interestRate)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[loan.status]}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {loan.daysPastDue > 0 ? (
                        <Badge variant="destructive">{loan.daysPastDue}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(loan.principalOutstanding)}
                    </TableCell>
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
