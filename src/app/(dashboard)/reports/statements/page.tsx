'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Download, FileText, Calendar, Search, Eye, Mail } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/format';

interface Statement {
  id: string;
  accountNumber: string;
  customerName: string;
  statementType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  status: 'READY' | 'GENERATING' | 'SENT';
  fileSize?: string;
}

const statements: Statement[] = [
  {
    id: 'stmt-001',
    accountNumber: '1000000001',
    customerName: 'Rajesh Kumar',
    statementType: 'MONTHLY',
    periodStart: '2024-11-01',
    periodEnd: '2024-11-30',
    generatedAt: '2024-12-01T00:00:00Z',
    status: 'READY',
    fileSize: '245 KB'
  },
  {
    id: 'stmt-002',
    accountNumber: '1000000002',
    customerName: 'Rajesh Kumar',
    statementType: 'MONTHLY',
    periodStart: '2024-11-01',
    periodEnd: '2024-11-30',
    generatedAt: '2024-12-01T00:00:00Z',
    status: 'READY',
    fileSize: '189 KB'
  },
  {
    id: 'stmt-003',
    accountNumber: '1000000003',
    customerName: 'Priya Sharma',
    statementType: 'MONTHLY',
    periodStart: '2024-11-01',
    periodEnd: '2024-11-30',
    generatedAt: '2024-12-01T00:05:00Z',
    status: 'SENT',
    fileSize: '312 KB'
  },
  {
    id: 'stmt-004',
    accountNumber: '1000000005',
    customerName: 'Sharma Enterprises',
    statementType: 'QUARTERLY',
    periodStart: '2024-09-01',
    periodEnd: '2024-11-30',
    generatedAt: '2024-12-01T00:10:00Z',
    status: 'READY',
    fileSize: '1.2 MB'
  },
  {
    id: 'stmt-005',
    accountNumber: '1000000008',
    customerName: 'Tech Solutions India',
    statementType: 'MONTHLY',
    periodStart: '2024-11-01',
    periodEnd: '2024-11-30',
    generatedAt: '2024-12-01T00:15:00Z',
    status: 'GENERATING'
  },
];

export default function StatementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [generating, setGenerating] = useState<string | null>(null);

  const filteredStatements = statements.filter(stmt => {
    const matchesSearch = stmt.accountNumber.includes(searchQuery) ||
                         stmt.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || stmt.statementType === typeFilter;
    return matchesSearch && matchesType;
  });

  async function generateStatement(id: string) {
    setGenerating(id);
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(null);
  }

  const statusColors: Record<string, string> = {
    READY: 'bg-green-100 text-green-800',
    GENERATING: 'bg-blue-100 text-blue-800',
    SENT: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Statements</h1>
          <p className="text-muted-foreground">
            Generate and download customer account statements
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Batch
        </Button>
      </div>

      {/* Generate New Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Statement</CardTitle>
          <CardDescription>Create a custom statement for a specific account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input placeholder="Enter account number" />
            </div>
            <div className="space-y-2">
              <Label>Statement Type</Label>
              <Select defaultValue="MONTHLY">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                  <SelectItem value="CUSTOM">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" />
            </div>
          </div>
          <Button className="mt-4">
            <Calendar className="mr-2 h-4 w-4" />
            Generate Statement
          </Button>
        </CardContent>
      </Card>

      {/* Statements List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Statements</CardTitle>
          <CardDescription>View and download account statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by account or customer..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStatements.map((stmt) => (
                <TableRow key={stmt.id}>
                  <TableCell className="font-medium">{stmt.accountNumber}</TableCell>
                  <TableCell>{stmt.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stmt.statementType}</Badge>
                  </TableCell>
                  <TableCell>
                    {stmt.periodStart} to {stmt.periodEnd}
                  </TableCell>
                  <TableCell>{formatDate(stmt.generatedAt)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[stmt.status]}>
                      {stmt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{stmt.fileSize || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {stmt.status === 'READY' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {stmt.status === 'GENERATING' && (
                        <Button size="sm" disabled>
                          Generating...
                        </Button>
                      )}
                      {stmt.status === 'SENT' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
