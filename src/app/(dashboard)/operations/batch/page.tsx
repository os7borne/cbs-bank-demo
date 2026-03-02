'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Play, RotateCcw, Search, Clock, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface BatchJob {
  id: string;
  jobName: string;
  jobType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalRecords: number;
  processed: number;
  failedRecords: number;
  startedAt?: string;
  completedAt?: string;
  runBy: string;
  businessDate: string;
}

const initialJobs: BatchJob[] = [
  { 
    id: 'batch-001', 
    jobName: 'EOD - Mumbai Branch', 
    jobType: 'EOD', 
    status: 'COMPLETED', 
    totalRecords: 5243, 
    processed: 5243, 
    failedRecords: 0,
    startedAt: '2024-12-01T18:00:00Z',
    completedAt: '2024-12-01T18:15:32Z',
    runBy: 'system',
    businessDate: '2024-12-01'
  },
  { 
    id: 'batch-002', 
    jobName: 'EOD - Delhi Branch', 
    jobType: 'EOD', 
    status: 'COMPLETED', 
    totalRecords: 3892, 
    processed: 3892, 
    failedRecords: 0,
    startedAt: '2024-12-01T18:00:00Z',
    completedAt: '2024-12-01T18:12:45Z',
    runBy: 'system',
    businessDate: '2024-12-01'
  },
  { 
    id: 'batch-003', 
    jobName: 'Interest Accrual - Savings', 
    jobType: 'INTEREST_ACCRUAL', 
    status: 'COMPLETED', 
    totalRecords: 15234, 
    processed: 15234, 
    failedRecords: 0,
    startedAt: '2024-12-01T00:30:00Z',
    completedAt: '2024-12-01T01:45:22Z',
    runBy: 'system',
    businessDate: '2024-12-01'
  },
  { 
    id: 'batch-004', 
    jobName: 'Loan EMI Processing', 
    jobType: 'LOAN_EMI', 
    status: 'RUNNING', 
    totalRecords: 8921, 
    processed: 6543, 
    failedRecords: 12,
    startedAt: '2024-12-01T08:00:00Z',
    runBy: 'system',
    businessDate: '2024-12-01'
  },
  { 
    id: 'batch-005', 
    jobName: 'Statement Generation', 
    jobType: 'REPORT', 
    status: 'PENDING', 
    totalRecords: 5000, 
    processed: 0, 
    failedRecords: 0,
    runBy: 'admin@indiabank.demo',
    businessDate: '2024-12-01'
  },
];

export default function BatchPage() {
  const [jobs, setJobs] = useState<BatchJob[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.jobType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || job.jobType === typeFilter;
    return matchesSearch && matchesType;
  });

  async function runJob(jobId: string) {
    setRunningJob(jobId);
    // Simulate job execution
    await new Promise(r => setTimeout(r, 2000));
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, status: 'COMPLETED' as const, processed: job.totalRecords, completedAt: new Date().toISOString() }
        : job
    ));
    setRunningJob(null);
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    RUNNING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batch Jobs</h1>
          <p className="text-muted-foreground">
            Manage and monitor batch job processing
          </p>
        </div>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Run All Pending
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-3xl font-bold">{jobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {jobs.filter(j => j.status === 'COMPLETED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Running</p>
            <p className="text-3xl font-bold text-blue-600">
              {jobs.filter(j => j.status === 'RUNNING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {jobs.filter(j => j.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-3xl font-bold text-red-600">
              {jobs.filter(j => j.status === 'FAILED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Jobs</CardTitle>
          <CardDescription>View and manage batch processing jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
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
                <SelectItem value="EOD">EOD</SelectItem>
                <SelectItem value="INTEREST_ACCRUAL">Interest Accrual</SelectItem>
                <SelectItem value="LOAN_EMI">Loan EMI</SelectItem>
                <SelectItem value="REPORT">Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Business Date</TableHead>
                <TableHead>Run By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.jobName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.jobType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status]}>
                      {job.status === 'RUNNING' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(job.processed / job.totalRecords) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {job.processed}/{job.totalRecords}
                      </span>
                      {job.failedRecords > 0 && (
                        <span className="text-xs text-red-600">
                          ({job.failedRecords} failed)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{job.businessDate}</TableCell>
                  <TableCell>{job.runBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {job.status === 'PENDING' && (
                        <Button 
                          size="sm" 
                          onClick={() => runJob(job.id)}
                          disabled={runningJob === job.id}
                        >
                          {runningJob === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {job.status === 'COMPLETED' && (
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4" />
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
