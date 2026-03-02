'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Calendar, Clock, Play, CheckCircle2, AlertCircle, Loader2, Sun } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface EodJob {
  id: string;
  branchName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  processed: number;
  total: number;
}

const branches = [
  { id: 'branch-001', name: 'Head Office - Mumbai' },
  { id: 'branch-002', name: 'Delhi Branch' },
  { id: 'branch-003', name: 'Bangalore Branch' },
];

export default function EodPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<EodJob[]>([
    { id: '1', branchName: 'Head Office - Mumbai', status: 'COMPLETED', startedAt: '2024-12-01T18:00:00Z', completedAt: '2024-12-01T18:15:32Z', processed: 5243, total: 5243 },
    { id: '2', branchName: 'Delhi Branch', status: 'COMPLETED', startedAt: '2024-12-01T18:00:00Z', completedAt: '2024-12-01T18:12:45Z', processed: 3892, total: 3892 },
    { id: '3', branchName: 'Bangalore Branch', status: 'RUNNING', startedAt: '2024-12-01T18:00:00Z', processed: 2105, total: 4156 },
  ]);

  async function runEod(branchId: string) {
    setIsLoading(true);
    // Simulate EOD run
    await new Promise(r => setTimeout(r, 2000));
    setJobs(jobs.map(job => 
      job.id === branchId 
        ? { ...job, status: 'COMPLETED' as const, completedAt: new Date().toISOString(), processed: job.total }
        : job
    ));
    setIsLoading(false);
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    RUNNING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  const allCompleted = jobs.every(j => j.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">End of Day Processing</h1>
          <p className="text-muted-foreground">
            Run EOD tasks and monitor processing status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" />
          <span className="text-sm text-muted-foreground">
            Business Date: {formatDate(currentDate)}
          </span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Branches</p>
                <p className="text-3xl font-bold">{jobs.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {jobs.filter(j => j.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-3xl font-bold text-blue-600">
                  {jobs.filter(j => j.status === 'RUNNING').length}
                </p>
              </div>
              <Loader2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {jobs.filter(j => j.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EOD Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>EOD Status by Branch</CardTitle>
          <CardDescription>
            Monitor end-of-day processing for all branches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.branchName}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status]}>
                      {job.status === 'RUNNING' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : '-'}
                  </TableCell>
                  <TableCell>
                    {job.completedAt ? new Date(job.completedAt).toLocaleTimeString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(job.processed / job.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {job.processed}/{job.total}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.status === 'PENDING' && (
                      <Button 
                        size="sm" 
                        onClick={() => runEod(job.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Run EOD
                      </Button>
                    )}
                    {job.status === 'RUNNING' && (
                      <Button size="sm" variant="outline" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </Button>
                    )}
                    {job.status === 'COMPLETED' && (
                      <Button size="sm" variant="outline" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Completed
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* EOD Steps */}
      <Card>
        <CardHeader>
          <CardTitle>EOD Processing Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, name: 'Interest Accrual', status: 'Completed', time: '18:00:00' },
              { step: 2, name: 'Fee Processing', status: 'Completed', time: '18:05:00' },
              { step: 3, name: 'Transaction Posting', status: 'Completed', time: '18:08:00' },
              { step: 4, name: 'Balance Updates', status: 'Completed', time: '18:12:00' },
              { step: 5, name: 'Report Generation', status: 'Completed', time: '18:15:00' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Status: {item.status}</p>
                </div>
                <div className="text-sm text-muted-foreground">{item.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
