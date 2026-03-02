'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Download, Search, Shield, Calendar, User, FileText, Filter } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface AuditEvent {
  id: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedAt: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

const auditEvents: AuditEvent[] = [
  {
    id: 'audit-001',
    eventType: 'TRANSACTION',
    resourceType: 'Account',
    resourceId: 'acc-001',
    action: 'CASH_DEPOSIT',
    newValue: '₹50,000 deposited',
    performedBy: 'teller@indiabank.demo',
    performedAt: '2024-11-30T10:30:00Z',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS'
  },
  {
    id: 'audit-002',
    eventType: 'LOGIN',
    resourceType: 'User',
    resourceId: 'user-002',
    action: 'USER_LOGIN',
    performedBy: 'teller@indiabank.demo',
    performedAt: '2024-11-30T09:00:00Z',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS'
  },
  {
    id: 'audit-003',
    eventType: 'CUSTOMER',
    resourceType: 'Customer',
    resourceId: 'cust-001',
    action: 'KYC_UPDATE',
    oldValue: 'Address: Old Address',
    newValue: 'Address: New Mumbai Address',
    performedBy: 'cs@indiabank.demo',
    performedAt: '2024-11-29T14:20:00Z',
    ipAddress: '192.168.1.105',
    status: 'SUCCESS'
  },
  {
    id: 'audit-004',
    eventType: 'ACCOUNT',
    resourceType: 'Account',
    resourceId: 'acc-003',
    action: 'STATUS_CHANGE',
    oldValue: 'ACTIVE',
    newValue: 'FROZEN',
    performedBy: 'admin@indiabank.demo',
    performedAt: '2024-11-28T16:30:00Z',
    ipAddress: '192.168.1.110',
    status: 'WARNING'
  },
  {
    id: 'audit-005',
    eventType: 'AUTH',
    resourceType: 'User',
    resourceId: 'user-005',
    action: 'FAILED_LOGIN',
    performedBy: 'unknown',
    performedAt: '2024-11-28T11:15:00Z',
    ipAddress: '203.0.113.45',
    status: 'FAILURE'
  },
  {
    id: 'audit-006',
    eventType: 'LOAN',
    resourceType: 'Loan',
    resourceId: 'loan-001',
    action: 'DISBURSEMENT',
    newValue: '₹500,000 disbursed',
    performedBy: 'credit@indiabank.demo',
    performedAt: '2024-01-20T09:00:00Z',
    ipAddress: '192.168.1.102',
    status: 'SUCCESS'
  },
  {
    id: 'audit-007',
    eventType: 'WORKFLOW',
    resourceType: 'WorkflowRequest',
    resourceId: 'wf-002',
    action: 'APPROVED',
    newValue: 'Loan application approved',
    performedBy: 'admin@indiabank.demo',
    performedAt: '2024-04-12T10:00:00Z',
    ipAddress: '192.168.1.110',
    status: 'SUCCESS'
  },
];

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.resourceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || event.eventType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    SUCCESS: 'bg-green-100 text-green-800',
    FAILURE: 'bg-red-100 text-red-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Reports</h1>
          <p className="text-muted-foreground">
            View audit trails and system activity logs
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Events (24h)</p>
            <p className="text-3xl font-bold">{auditEvents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-3xl font-bold text-green-600">
              {auditEvents.filter(e => e.status === 'SUCCESS').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="text-3xl font-bold text-yellow-600">
              {auditEvents.filter(e => e.status === 'WARNING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Failures</p>
            <p className="text-3xl font-bold text-red-600">
              {auditEvents.filter(e => e.status === 'FAILURE').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <CardDescription>Filter and review system audit events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="TRANSACTION">Transaction</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="ACCOUNT">Account</SelectItem>
                <SelectItem value="LOAN">Loan</SelectItem>
                <SelectItem value="WORKFLOW">Workflow</SelectItem>
                <SelectItem value="AUTH">Auth</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="FAILURE">Failure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(event.performedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.eventType}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{event.action}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{event.resourceType}</p>
                      <p className="text-xs text-muted-foreground">{event.resourceId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {event.performedBy}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[event.status]}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{event.ipAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Event Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent High-Priority Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditEvents
              .filter(e => e.status === 'WARNING' || e.status === 'FAILURE')
              .slice(0, 3)
              .map((event) => (
                <div 
                  key={event.id} 
                  className={`p-4 border rounded-lg ${
                    event.status === 'FAILURE' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[event.status]}>
                          {event.status}
                        </Badge>
                        <span className="font-medium">{event.action}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.eventType} on {event.resourceType} ({event.resourceId})
                      </p>
                      {event.oldValue && (
                        <div className="mt-2 text-sm">
                          <span className="text-red-600 line-through">{event.oldValue}</span>
                          {' → '}
                          <span className="text-green-600">{event.newValue}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{formatDate(event.performedAt)}</p>
                      <p>{event.performedBy}</p>
                      <p className="font-mono text-xs">{event.ipAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
