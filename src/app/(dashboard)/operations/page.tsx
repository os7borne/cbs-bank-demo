import { BatchService } from '@/lib/services';
import { formatDate, formatDateTime } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calculator, Play, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

async function getBatchJobs() {
  const jobs = await BatchService.findRecent(20);
  return jobs;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default async function OperationsPage() {
  const batchJobs = await getBatchJobs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
        <p className="text-muted-foreground">
          Batch jobs, EOD processing, and workflow approvals
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">EOD Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium">Completed</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last run: Today 11:30 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span className="font-medium">2 pending</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires your attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Business Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{formatDate(new Date())}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              System date active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Batch Jobs
            </CardTitle>
            <CardDescription>
              Recent batch job execution history
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Run EOD
            </Button>
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Interest Accrual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.jobName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.jobType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[job.status]}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.startedAt ? formatDateTime(job.startedAt) : '-'}
                    </TableCell>
                    <TableCell>
                      {job.completedAt ? formatDateTime(job.completedAt) : '-'}
                    </TableCell>
                    <TableCell>
                      {job.processedRecords !== null && job.processedRecords !== undefined
                        ? `${job.processedRecords} / ${job.totalRecords}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
