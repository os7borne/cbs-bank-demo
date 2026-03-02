'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Landmark, Loader2, Search } from 'lucide-react';
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

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  currentBalance: number;
}

const branches = [
  { id: 'branch-001', name: 'Head Office - Mumbai' },
  { id: 'branch-002', name: 'Delhi Branch' },
  { id: 'branch-003', name: 'Bangalore Branch' },
];

const loanProducts = [
  { id: 'prod-003', name: 'Personal Loan', minAmount: 50000, maxAmount: 2000000, interestRate: 12 },
  { id: 'prod-004', name: 'Home Loan', minAmount: 500000, maxAmount: 10000000, interestRate: 8.5 },
];

export default function NewLoanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(loanProducts[0]);

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => setCustomers(data.customers || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetch(`/api/customers/${selectedCustomer.id}/accounts`)
        .then(r => r.json())
        .then(data => setAccounts(data.accounts || []))
        .catch(console.error);
    }
  }, [selectedCustomer]);

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
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          productId: formData.get('productId'),
          disbursementAccountId: formData.get('disbursementAccountId'),
          branchId: formData.get('branchId'),
          principalAmount: parseFloat(formData.get('principalAmount') as string),
          interestRate: parseFloat(formData.get('interestRate') as string),
          tenureMonths: parseInt(formData.get('tenureMonths') as string),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create loan');
      }

      const result = await response.json();
      router.push(`/loans/${result.id}`);
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

  function calculateEMI() {
    const principal = selectedProduct.minAmount;
    const rate = selectedProduct.interestRate / 12 / 100;
    const tenure = 36;
    const emi = principal * rate * Math.pow(1 + rate, tenure) / (Math.pow(1 + rate, tenure) - 1);
    return emi.toFixed(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/loans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Loan Application</h1>
          <p className="text-muted-foreground">
            Create a new loan for a customer
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
              Search and select the customer for this loan
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
                  <Landmark className="h-5 w-5" />
                  Loan Details
                </CardTitle>
                <CardDescription>
                  Configure the loan application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productId">Loan Product *</Label>
                    <Select 
                      name="productId" 
                      required
                      value={selectedProduct.id}
                      onValueChange={(v) => {
                        const product = loanProducts.find(p => p.id === v);
                        if (product) setSelectedProduct(product);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {loanProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="principalAmount">Loan Amount (₹) *</Label>
                    <Input 
                      id="principalAmount" 
                      name="principalAmount" 
                      type="number"
                      min={selectedProduct.minAmount}
                      max={selectedProduct.maxAmount}
                      defaultValue={selectedProduct.minAmount}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Range: ₹{selectedProduct.minAmount.toLocaleString()} - ₹{selectedProduct.maxAmount.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input 
                      id="interestRate" 
                      name="interestRate" 
                      type="number"
                      step="0.1"
                      defaultValue={selectedProduct.interestRate}
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenureMonths">Tenure (Months) *</Label>
                    <Input 
                      id="tenureMonths" 
                      name="tenureMonths" 
                      type="number"
                      min="6"
                      max="360"
                      defaultValue="36"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disbursementAccountId">Disbursement Account *</Label>
                  <Select name="disbursementAccountId" required disabled={accounts.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={accounts.length === 0 ? "No accounts available" : "Select account"} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountNumber} ({account.accountType}) - ₹{account.currentBalance?.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {accounts.length === 0 && (
                    <p className="text-sm text-amber-600">
                      Customer has no accounts. Please open an account first.
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium mb-2">Estimated EMI</h4>
                  <p className="text-2xl font-bold">₹{calculateEMI()}</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated monthly installment for {selectedProduct.name}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/loans">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading || accounts.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
