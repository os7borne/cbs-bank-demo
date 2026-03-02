'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Wallet, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  customerNumber: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  primaryEmail: string;
}

interface Product {
  id: string;
  productCode: string;
  productName: string;
  productType: string;
  category: string;
}

const branches = [
  { id: 'branch-001', name: 'Head Office - Mumbai' },
  { id: 'branch-002', name: 'Delhi Branch' },
  { id: 'branch-003', name: 'Bangalore Branch' },
];

export default function NewAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);

  useEffect(() => {
    // Fetch customers and products
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([customersData, productsData]) => {
      setCustomers(customersData.customers || []);
      setProducts(productsData.products || []);
    }).catch(console.error);
  }, []);

  const filteredCustomers = customers.filter(c => 
    searchQuery === '' || 
    c.customerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    c.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          productId: formData.get('productId'),
          branchId: formData.get('branchId'),
          accountType: formData.get('accountType'),
          openingBalance: parseFloat(formData.get('openingBalance') as string) || 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create account');
      }

      const result = await response.json();
      router.push(`/accounts/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
  }

  function getCustomerName(customer: Customer) {
    if (customer.customerType === 'INDIVIDUAL') {
      return `${customer.firstName} ${customer.lastName}`;
    }
    return customer.companyName;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/accounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Open New Account</h1>
          <p className="text-muted-foreground">
            Create a new account for an existing customer
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showCustomerSearch ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
            <CardDescription>
              Search and select the customer for this account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, customer ID, or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="rounded-md border max-h-[400px] overflow-auto">
              {filteredCustomers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No customers found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{getCustomerName(customer)}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.customerNumber} • {customer.primaryEmail}
                        </p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {customer.customerType}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedCustomer && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{getCustomerName(selectedCustomer)}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.customerNumber} • {selectedCustomer.primaryEmail}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCustomerSearch(true)}
                  >
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Account Details
                </CardTitle>
                <CardDescription>
                  Configure the new account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type *</Label>
                    <Select name="accountType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAVINGS">Savings Account</SelectItem>
                        <SelectItem value="CURRENT">Current Account</SelectItem>
                        <SelectItem value="TERM_DEPOSIT">Term Deposit</SelectItem>
                        <SelectItem value="RECURRING_DEPOSIT">Recurring Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productId">Product *</Label>
                    <Select name="productId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Branch *</Label>
                    <Select name="branchId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openingBalance">Opening Balance (₹)</Label>
                    <Input 
                      id="openingBalance" 
                      name="openingBalance" 
                      type="number" 
                      min="0"
                      defaultValue="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/accounts">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  'Open Account'
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
