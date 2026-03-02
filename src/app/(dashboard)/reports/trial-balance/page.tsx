'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Download, Calculator, Calendar, FileSpreadsheet, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  accountType: string;
  openingDebit: number;
  openingCredit: number;
  transactionDebit: number;
  transactionCredit: number;
  closingDebit: number;
  closingCredit: number;
}

const trialBalanceData: TrialBalanceItem[] = [
  {
    accountCode: '1001',
    accountName: 'Cash on Hand',
    accountType: 'ASSET',
    openingDebit: 50000000,
    openingCredit: 0,
    transactionDebit: 1250000,
    transactionCredit: 2750000,
    closingDebit: 48500000,
    closingCredit: 0,
  },
  {
    accountCode: '1101',
    accountName: 'Customer Deposits - Savings',
    accountType: 'LIABILITY',
    openingDebit: 0,
    openingCredit: 1200000000,
    transactionDebit: 15000000,
    transactionCredit: 65000000,
    closingDebit: 0,
    closingCredit: 1250000000,
  },
  {
    accountCode: '1102',
    accountName: 'Customer Deposits - Current',
    accountType: 'LIABILITY',
    openingDebit: 0,
    openingCredit: 800000000,
    transactionDebit: 25000000,
    transactionCredit: 75000000,
    closingDebit: 0,
    closingCredit: 850000000,
  },
  {
    accountCode: '1201',
    accountName: 'Loans Receivable',
    accountType: 'ASSET',
    openingDebit: 2000000000,
    openingCredit: 0,
    transactionDebit: 150000000,
    transactionCredit: 50000000,
    closingDebit: 2100000000,
    closingCredit: 0,
  },
  {
    accountCode: '4001',
    accountName: 'Interest Income',
    accountType: 'INCOME',
    openingDebit: 0,
    openingCredit: 110000000,
    transactionDebit: 0,
    transactionCredit: 15000000,
    closingDebit: 0,
    closingCredit: 125000000,
  },
  {
    accountCode: '4101',
    accountName: 'Fee Income',
    accountType: 'INCOME',
    openingDebit: 0,
    openingCredit: 22000000,
    transactionDebit: 0,
    transactionCredit: 3000000,
    closingDebit: 0,
    closingCredit: 25000000,
  },
];

export default function TrialBalancePage() {
  const [asOfDate, setAsOfDate] = useState('2024-12-01');
  const [branch, setBranch] = useState('ALL');

  const totals = trialBalanceData.reduce((acc, item) => ({
    openingDebit: acc.openingDebit + item.openingDebit,
    openingCredit: acc.openingCredit + item.openingCredit,
    transactionDebit: acc.transactionDebit + item.transactionDebit,
    transactionCredit: acc.transactionCredit + item.transactionCredit,
    closingDebit: acc.closingDebit + item.closingDebit,
    closingCredit: acc.closingCredit + item.closingCredit,
  }), {
    openingDebit: 0,
    openingCredit: 0,
    transactionDebit: 0,
    transactionCredit: 0,
    closingDebit: 0,
    closingCredit: 0,
  });

  const isBalanced = totals.closingDebit === totals.closingCredit;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ASSET: 'bg-blue-100 text-blue-800',
      LIABILITY: 'bg-red-100 text-red-800',
      EQUITY: 'bg-green-100 text-green-800',
      INCOME: 'bg-purple-100 text-purple-800',
      EXPENSE: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trial Balance</h1>
          <p className="text-muted-foreground">
            View and export trial balance reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>As of Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="ALL">All Branches</option>
                <option value="HO001">Head Office - Mumbai</option>
                <option value="BR002">Delhi Branch</option>
                <option value="BR003">Bangalore Branch</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value="INR - Indian Rupee" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Debits</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totals.closingDebit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.closingCredit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Difference</p>
            <p className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totals.closingDebit - totals.closingCredit))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className={isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Trial Balance Report
          </CardTitle>
          <CardDescription>
            As of {asOfDate} | All Branches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Opening Dr</TableHead>
                  <TableHead className="text-right">Opening Cr</TableHead>
                  <TableHead className="text-right">Period Dr</TableHead>
                  <TableHead className="text-right">Period Cr</TableHead>
                  <TableHead className="text-right">Closing Dr</TableHead>
                  <TableHead className="text-right">Closing Cr</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalanceData.map((item) => (
                  <TableRow key={item.accountCode}>
                    <TableCell className="font-medium">{item.accountCode}</TableCell>
                    <TableCell>{item.accountName}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(item.accountType)}>
                        {item.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.openingDebit > 0 ? formatCurrency(item.openingDebit) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.openingCredit > 0 ? formatCurrency(item.openingCredit) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.transactionDebit > 0 ? formatCurrency(item.transactionDebit) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.transactionCredit > 0 ? formatCurrency(item.transactionCredit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.closingDebit > 0 ? formatCurrency(item.closingDebit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.closingCredit > 0 ? formatCurrency(item.closingCredit) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted font-bold">
                  <TableCell colSpan={3}>TOTAL</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.openingDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.openingCredit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.transactionDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.transactionCredit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.closingDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.closingCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
