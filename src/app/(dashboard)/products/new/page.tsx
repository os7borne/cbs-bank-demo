'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Package, Landmark, PiggyBank, Loader2 } from 'lucide-react';
import Link from 'next/link';

const currencies = [
  { id: 'curr-001', code: 'INR', name: 'Indian Rupee' },
  { id: 'curr-002', code: 'USD', name: 'US Dollar' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productType, setProductType] = useState<'DEPOSIT' | 'LOAN'>('DEPOSIT');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          productCode: formData.get('productCode'),
          productName: formData.get('productName'),
          category: formData.get('category'),
          currencyId: formData.get('currencyId'),
          description: formData.get('description'),
          // Deposit specific
          minOpeningBalance: parseFloat(formData.get('minOpeningBalance') as string) || 0,
          interestRate: parseFloat(formData.get('interestRate') as string) || 0,
          minBalance: parseFloat(formData.get('minBalance') as string) || 0,
          // Loan specific
          minAmount: parseFloat(formData.get('minAmount') as string) || 0,
          maxAmount: parseFloat(formData.get('maxAmount') as string) || 0,
          maxTenure: parseInt(formData.get('maxTenure') as string) || 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create product');
      }

      const result = await response.json();
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
          <p className="text-muted-foreground">
            Create a new banking product
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={productType} onValueChange={(v) => setProductType(v as 'DEPOSIT' | 'LOAN')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="DEPOSIT" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="LOAN" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Loan
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="DEPOSIT" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
                <CardDescription>
                  Basic details for the deposit product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Product Code *</Label>
                    <Input 
                      id="productCode" 
                      name="productCode" 
                      placeholder="e.g., SAV001"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input 
                      id="productName" 
                      name="productName" 
                      placeholder="e.g., Regular Savings Account"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAVINGS">Savings</SelectItem>
                        <SelectItem value="CURRENT">Current</SelectItem>
                        <SelectItem value="TERM_DEPOSIT">Term Deposit</SelectItem>
                        <SelectItem value="RECURRING_DEPOSIT">Recurring Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currencyId">Currency *</Label>
                    <Select name="currencyId" required defaultValue="curr-001">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.id} value={curr.id}>
                            {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Brief description of the product..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Set interest rates and balance requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input 
                      id="interestRate" 
                      name="interestRate" 
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      defaultValue="3.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minOpeningBalance">Min Opening Balance (₹)</Label>
                    <Input 
                      id="minOpeningBalance" 
                      name="minOpeningBalance" 
                      type="number"
                      min="0"
                      defaultValue="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minBalance">Minimum Balance (₹)</Label>
                    <Input 
                      id="minBalance" 
                      name="minBalance" 
                      type="number"
                      min="0"
                      defaultValue="500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="LOAN" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
                <CardDescription>
                  Basic details for the loan product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Product Code *</Label>
                    <Input 
                      id="productCode" 
                      name="productCode" 
                      placeholder="e.g., PL001"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input 
                      id="productName" 
                      name="productName" 
                      placeholder="e.g., Personal Loan"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERSONAL_LOAN">Personal Loan</SelectItem>
                        <SelectItem value="HOME_LOAN">Home Loan</SelectItem>
                        <SelectItem value="VEHICLE_LOAN">Vehicle Loan</SelectItem>
                        <SelectItem value="BUSINESS_LOAN">Business Loan</SelectItem>
                        <SelectItem value="EDUCATION_LOAN">Education Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currencyId">Currency *</Label>
                    <Select name="currencyId" required defaultValue="curr-001">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.id} value={curr.id}>
                            {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Brief description of the product..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Set loan amount limits and interest rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                    <Input 
                      id="minAmount" 
                      name="minAmount" 
                      type="number"
                      min="0"
                      defaultValue="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
                    <Input 
                      id="maxAmount" 
                      name="maxAmount" 
                      type="number"
                      min="0"
                      defaultValue="2000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input 
                      id="interestRate" 
                      name="interestRate" 
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      defaultValue="12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTenure">Max Tenure (Months)</Label>
                    <Input 
                      id="maxTenure" 
                      name="maxTenure" 
                      type="number"
                      min="6"
                      max="360"
                      defaultValue="60"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" asChild>
              <Link href="/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
