import { LoanService } from '@/lib/services';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Receipt, 
  ArrowLeft, 
  User, 
  Calendar, 
  Percent,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getLoan(id: string) {
  const loan = await LoanService.findById(id);
  return loan;
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

const statusIcons: Record<string, React.ReactNode> = {
  APPLICATION: <Clock className="h-5 w-5 text-yellow-600" />,
  UNDERWRITING: <FileText className="h-5 w-5 text-blue-600" />,
  APPROVED: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  REJECTED: <AlertCircle className="h-5 w-5 text-red-600" />,
  DISBURSED: <Wallet className="h-5 w-5 text-purple-600" />,
  ACTIVE: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  CLOSED: <CheckCircle2 className="h-5 w-5 text-gray-600" />,
  WRITTEN_OFF: <AlertCircle className="h-5 w-5 text-red-600" />,
};

interface LoanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params;
  const loan = await getLoan(id);

  if (!loan) {
    notFound();
  }

  const customer = loan.disbursementAccount?.customer;
  const customerName = customer?.customerType === 'INDIVIDUAL'
    ? `${customer.firstName} ${customer.lastName}`
    : customer?.companyName;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/loans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{loan.loanNumber}</h1>
          <p className="text-muted-foreground">
            Loan Account Details
          </p>
        </div>
        <Badge className={statusColors[loan.status]}>
          {statusIcons[loan.status]}
          <span className="ml-2">{loan.status}</span>
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Principal Amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(loan.principalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(loan.principalOutstanding)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interest Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(loan.interestRate)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tenure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.tenureMonths} months</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="repayment">Repayment</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Loan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Loan Number</p>
                  <p className="font-medium">{loan.loanNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{loan.product?.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Application Date</p>
                  <p className="font-medium">{formatDate(loan.applicationDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sanction Date</p>
                  <p className="font-medium">{loan.sanctionDate ? formatDate(loan.sanctionDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disbursement Date</p>
                  <p className="font-medium">{loan.disbursementDate ? formatDate(loan.disbursementDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[loan.status]}>{loan.status}</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-medium">{formatPercentage(loan.interestRate)} p.a.</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">EMI Amount</p>
                  <p className="font-medium">{loan.emiAmount ? formatCurrency(loan.emiAmount) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="font-medium">{loan.totalInterest ? formatCurrency(loan.totalInterest) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Past Due</p>
                  <p className="font-medium">
                    {loan.daysPastDue > 0 ? (
                      <Badge variant="destructive">{loan.daysPastDue} DPD</Badge>
                    ) : (
                      <span className="text-green-600">Current</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repayment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Repayment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Principal Paid</p>
                  <p className="font-medium">{formatCurrency(loan.principalPaid || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Paid</p>
                  <p className="font-medium">{formatCurrency(loan.interestPaid || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Accrued</p>
                  <p className="font-medium">{formatCurrency(loan.interestAccrued || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Penalty Charged</p>
                  <p className="font-medium">{formatCurrency(loan.penaltyCharged || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Penalty Paid</p>
                  <p className="font-medium">{formatCurrency(loan.penaltyPaid || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Principal Outstanding</p>
                  <p className="font-medium text-lg">{formatCurrency(loan.principalOutstanding)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Payment Date</p>
                  <p className="font-medium">{loan.lastPaymentDate ? formatDate(loan.lastPaymentDate) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment Date</p>
                  <p className="font-medium">{loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Type</p>
                  <p className="font-medium">{customer?.customerType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disbursement Account</p>
                  <p className="font-medium">{loan.disbursementAccount?.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium">{loan.disbursementAccount?.accountType}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/customers/${customer?.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Customer
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/accounts/${loan.disbursementAccount?.id}`}>
                    <Building2 className="mr-2 h-4 w-4" />
                    View Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
