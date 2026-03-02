'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Landmark, Plus, Search, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface GlAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  category: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  isLeaf: boolean;
}

const accountTypes = [
  { value: 'ASSET', label: 'Asset', color: 'bg-blue-100 text-blue-800' },
  { value: 'LIABILITY', label: 'Liability', color: 'bg-red-100 text-red-800' },
  { value: 'EQUITY', label: 'Equity', color: 'bg-green-100 text-green-800' },
  { value: 'INCOME', label: 'Income', color: 'bg-purple-100 text-purple-800' },
  { value: 'EXPENSE', label: 'Expense', color: 'bg-orange-100 text-orange-800' },
];

export default function GlAccountsPage() {
  const [accounts, setAccounts] = useState<GlAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const response = await fetch('/api/gl-accounts');
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching GL accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/gl-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountCode: formData.get('accountCode'),
          accountName: formData.get('accountName'),
          accountType: formData.get('accountType'),
          category: formData.get('category'),
          openingBalance: parseFloat(formData.get('openingBalance') as string) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create GL account');
      }

      setIsDialogOpen(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error creating GL account:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredAccounts = accounts.filter(account => 
    searchQuery === '' || 
    account.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.accountType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const typeConfig = accountTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-100';
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = accountTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GL Accounts</h1>
          <p className="text-muted-foreground">
            Manage chart of accounts
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {accountTypes.map((type) => {
          const count = accounts.filter(a => a.accountType === type.value).length;
          return (
            <Card key={type.value}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{type.label}</p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Chart of Accounts
            </CardTitle>
            <CardDescription>
              {filteredAccounts.length} accounts found
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add GL Account</DialogTitle>
                  <DialogDescription>
                    Create a new general ledger account
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountCode">Account Code *</Label>
                        <Input 
                          id="accountCode" 
                          name="accountCode" 
                          placeholder="e.g., 1001"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type *</Label>
                        <Select name="accountType" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {accountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name *</Label>
                      <Input 
                        id="accountName" 
                        name="accountName" 
                        placeholder="e.g., Cash on Hand"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category" 
                        name="category" 
                        placeholder="e.g., ASSETS_CASH"
                      />
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
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading accounts...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Opening Balance</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No GL accounts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.accountCode}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(account.accountType)}>
                            {getTypeLabel(account.accountType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.category}</Badge>
                        </TableCell>
                        <TableCell>
                          ₹{(account.openingBalance || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{(account.currentBalance || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Badge className={account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
