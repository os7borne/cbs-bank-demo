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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';

const branches = [
  { id: 'branch-001', name: 'Head Office - Mumbai' },
  { id: 'branch-002', name: 'Delhi Branch' },
  { id: 'branch-003', name: 'Bangalore Branch' },
];

export default function NewCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType,
          salutation: formData.get('salutation'),
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          companyName: formData.get('companyName'),
          primaryEmail: formData.get('primaryEmail'),
          primaryPhone: formData.get('primaryPhone'),
          branchId: formData.get('branchId'),
          riskRating: formData.get('riskRating'),
          isPEP: formData.get('isPEP') === 'on',
          kycStatus: 'PENDING',
          // Address
          addressLine1: formData.get('addressLine1'),
          city: formData.get('city'),
          state: formData.get('state'),
          postalCode: formData.get('postalCode'),
          country: formData.get('country'),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create customer');
      }

      const result = await response.json();
      router.push(`/customers/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Customer</h1>
          <p className="text-muted-foreground">
            Create a new customer record
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={customerType} onValueChange={(v) => setCustomerType(v as 'INDIVIDUAL' | 'BUSINESS')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="INDIVIDUAL" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="BUSINESS" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="INDIVIDUAL" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Enter the customer&apos;s personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salutation">Salutation</Label>
                    <Select name="salutation" defaultValue="Mr">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Email *</Label>
                    <Input id="primaryEmail" name="primaryEmail" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">Phone *</Label>
                    <Input id="primaryPhone" name="primaryPhone" type="tel" placeholder="+91-9876543210" required />
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
                    <Label htmlFor="riskRating">Risk Rating</Label>
                    <Select name="riskRating" defaultValue="LOW">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="isPEP" name="isPEP" />
                  <Label htmlFor="isPEP" className="text-sm">
                    Politically Exposed Person (PEP)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
                <CardDescription>
                  Customer&apos;s residential address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Textarea id="addressLine1" name="addressLine1" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input id="postalCode" name="postalCode" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" defaultValue="IN" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="BUSINESS" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Enter the business details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input id="companyName" name="companyName" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Business Email *</Label>
                    <Input id="primaryEmail" name="primaryEmail" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">Business Phone *</Label>
                    <Input id="primaryPhone" name="primaryPhone" type="tel" placeholder="+91-9876543210" required />
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
                    <Label htmlFor="riskRating">Risk Rating</Label>
                    <Select name="riskRating" defaultValue="MEDIUM">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registered Address</CardTitle>
                <CardDescription>
                  Business registered address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Textarea id="addressLine1" name="addressLine1" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input id="postalCode" name="postalCode" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" defaultValue="IN" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="outline" asChild>
              <Link href="/customers">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Customer'
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
