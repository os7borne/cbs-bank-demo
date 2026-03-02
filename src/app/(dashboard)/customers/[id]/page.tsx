import { notFound } from "next/navigation";
import { CustomerService } from "@/lib/services";
import { formatDate, formatCurrency, formatPhone } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Wallet, 
  AlertCircle,
  Edit,
  Plus,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCustomer(id: string) {
  const customer = await CustomerService.findWithDetails(id);
  return customer;
}

const riskRatingColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  VERY_HIGH: "bg-red-100 text-red-800",
};

const kycStatusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  EXPIRED: "bg-red-100 text-red-800",
};

const accountStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FROZEN: "bg-red-100 text-red-800",
  DORMANT: "bg-gray-100 text-gray-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  const displayName = customer.customerType === "INDIVIDUAL"
    ? `${customer.firstName} ${customer.lastName}`
    : customer.companyName;

  const initials = customer.customerType === "INDIVIDUAL"
    ? `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`
    : customer.companyName?.[0] || "C";

  const totalBalance = (customer.accounts || []).reduce(
    (sum: number, acc: any) => sum + (acc.currentBalance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{customer.customerNumber}</span>
              <span>•</span>
              <Badge variant="outline">{customer.customerType}</Badge>
              <Badge className={riskRatingColors[customer.riskRating]}>
                {customer.riskRating} Risk
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/customers/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/accounts/new?customerId=${id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Open Account
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(customer.accounts || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={kycStatusColors[customer.kycStatus]}>
              {customer.kycStatus}
            </Badge>
            {customer.kycExpiryDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Expires: {formatDate(customer.kycExpiryDate)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{customer.branch?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{customer.branch?.code}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.customerType === "INDIVIDUAL" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="font-medium">{customer.salutation} {customer.firstName} {customer.lastName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company Name</span>
                      <span className="font-medium">{customer.companyName}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Since</span>
                  <span className="font-medium">{formatDate(customer.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{customer.primaryEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{formatPhone(customer.primaryPhone)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {(customer.isPEP || customer.isSanctioned) && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.isPEP && (
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>Politically Exposed Person (PEP)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Customer Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(customer.accounts || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No accounts found</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/accounts/new?customerId=${id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Open Account
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Number</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.accounts.map((account: any) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">
                            <Link href={`/accounts/${account.id}`} className="hover:underline">
                              {account.accountNumber}
                            </Link>
                          </TableCell>
                          <TableCell>{account.product?.productName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{account.accountType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={accountStatusColors[account.status]}>
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(account.currentBalance || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(customer.addresses || []).length === 0 ? (
                <p className="text-muted-foreground">No addresses found</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {customer.addresses.map((address: any) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{address.addressType}</Badge>
                        {address.isPrimary && <Badge>Primary</Badge>}
                      </div>
                      <p className="font-medium">{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
