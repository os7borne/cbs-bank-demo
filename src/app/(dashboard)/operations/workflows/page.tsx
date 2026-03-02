'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, CheckCircle2, XCircle, AlertCircle, Clock, Eye, FileText } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface WorkflowRequest {
  id: string;
  requestType: string;
  entityType: string;
  entityId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

const initialRequests: WorkflowRequest[] = [
  {
    id: 'wf-001',
    requestType: 'ACCOUNT_FREEZE',
    entityType: 'Account',
    entityId: 'acc-003',
    reason: 'Suspicious activity detected',
    status: 'PENDING',
    priority: 'HIGH',
    createdBy: 'cs@indiabank.demo',
    createdAt: '2024-11-28T16:30:00Z'
  },
  {
    id: 'wf-002',
    requestType: 'LOAN_APPROVAL',
    entityType: 'Loan',
    entityId: 'loan-004',
    reason: 'Customer credit check passed',
    status: 'APPROVED',
    priority: 'NORMAL',
    createdBy: 'credit@indiabank.demo',
    approvedBy: 'admin@indiabank.demo',
    approvedAt: '2024-04-12T10:00:00Z',
    createdAt: '2024-04-10T14:00:00Z'
  },
  {
    id: 'wf-003',
    requestType: 'KYC_UPDATE',
    entityType: 'Customer',
    entityId: 'cust-006',
    reason: 'Address verification required',
    status: 'PENDING',
    priority: 'NORMAL',
    createdBy: 'ops@indiabank.demo',
    createdAt: '2024-11-29T09:15:00Z'
  },
  {
    id: 'wf-004',
    requestType: 'LIMIT_INCREASE',
    entityType: 'Account',
    entityId: 'acc-005',
    reason: 'Business expansion - higher transaction volume',
    status: 'PENDING',
    priority: 'URGENT',
    createdBy: 'cs@indiabank.demo',
    createdAt: '2024-11-29T11:30:00Z'
  },
  {
    id: 'wf-005',
    requestType: 'ACCOUNT_CLOSE',
    entityType: 'Account',
    entityId: 'acc-002',
    reason: 'Customer request - account consolidation',
    status: 'REJECTED',
    priority: 'LOW',
    createdBy: 'teller@indiabank.demo',
    approvedBy: 'admin@indiabank.demo',
    approvedAt: '2024-11-25T14:20:00Z',
    createdAt: '2024-11-24T10:00:00Z'
  },
];

export default function WorkflowsPage() {
  const [requests, setRequests] = useState<WorkflowRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approveNote, setApproveNote] = useState('');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requestType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleApprove(request: WorkflowRequest) {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  }

  function confirmApprove() {
    if (selectedRequest) {
      setRequests(requests.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, status: 'APPROVED' as const, approvedBy: 'admin@indiabank.demo', approvedAt: new Date().toISOString() }
          : r
      ));
      setIsDialogOpen(false);
      setApproveNote('');
    }
  }

  function handleReject(requestId: string) {
    setRequests(requests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'REJECTED' as const, approvedBy: 'admin@indiabank.demo', approvedAt: new Date().toISOString() }
        : r
    ));
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve pending workflow requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Approved Today</p>
            <p className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.status === 'APPROVED' && r.approvedAt?.startsWith('2024-12')).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">High Priority</p>
            <p className="text-3xl font-bold text-orange-600">
              {requests.filter(r => r.priority === 'HIGH' && r.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-3xl font-bold">{requests.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Requests</CardTitle>
          <CardDescription>Manage approval requests from operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {request.requestType}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.entityType}</Badge>
                    <p className="text-xs text-muted-foreground">{request.entityId}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[request.priority]}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status]}>
                      {request.status === 'PENDING' && <Clock className="mr-1 h-3 w-3" />}
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                  <TableCell>{request.createdBy}</TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    {request.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(request)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this {selectedRequest?.requestType} request?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{selectedRequest?.requestType}</p>
              <p className="text-sm text-muted-foreground">{selectedRequest?.reason}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Approval Notes (Optional)</label>
              <Textarea 
                placeholder="Add any notes..."
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
