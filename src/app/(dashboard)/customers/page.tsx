import { CustomerService } from '@/lib/services';
import { formatDate, formatPhone } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Users, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

async function getCustomers() {
  const customers = await CustomerService.findAll(50);
  return customers;
}

const riskRatingColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  VERY_HIGH: 'bg-red-100 text-red-800',
};

const kycStatusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-800',
};

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer relationships and KYC information
          </p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Directory
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {customers.length} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Risk Rating</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.customerNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {customer.customerType === 'INDIVIDUAL'
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.companyName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {customer.customerType === 'INDIVIDUAL'
                            ? 'Individual'
                            : customer.customerType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.customerType}</Badge>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs">{customer.primaryEmail}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPhone(customer.primaryPhone)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={riskRatingColors[customer.riskRating] || 'bg-gray-100'}>
                        {customer.riskRating}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={kycStatusColors[customer.kycStatus] || 'bg-gray-100'}>
                        {customer.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/customers/${customer.id}`}>
                          View
                        </Link>
                      </Button>
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
