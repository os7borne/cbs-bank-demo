'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

type SeedResult = {
  success: boolean;
  message: string;
  details?: string[];
  summary?: {
    branches: number;
    currencies: number;
    glAccounts: number;
    products: number;
    customers: number;
    accounts: string;
    loans: number;
    batchJobs: number;
    workflows: number;
  };
  error?: string;
};

export function SeedDataButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clearExisting, setClearExisting] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearExisting }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed data');
      }

      setResult(data);
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Database className="h-4 w-4" />
          Seed Demo Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Seed Demo Data
          </DialogTitle>
          <DialogDescription>
            Populate the database with sample banking data for testing and demonstration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result && !error && (
            <>
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">What will be created:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      <li>3 Branches (Mumbai, Delhi, Bangalore)</li>
                      <li>2 Currencies (INR, USD)</li>
                      <li>6 GL Accounts</li>
                      <li>3 Products (Savings, Current, Personal Loan)</li>
                      <li>20 Customers with addresses</li>
                      <li>~30 Accounts (1-2 per customer)</li>
                      <li>10 Loans with various statuses</li>
                      <li>4 Batch job records</li>
                      <li>1 Workflow request</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="clear-existing" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    Clear existing data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Warning: This will delete all existing data before seeding
                  </p>
                </div>
                <Switch
                  id="clear-existing"
                  checked={clearExisting}
                  onCheckedChange={setClearExisting}
                />
              </div>
            </>
          )}

          {result?.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-medium">{result.message}</p>
                {result.details && (
                  <div className="mt-2 text-xs space-y-0.5">
                    {result.details.slice(0, 5).map((detail, i) => (
                      <p key={i}>{detail}</p>
                    ))}
                    {result.details.length > 5 && (
                      <p className="text-green-600">
                        ...and {result.details.length - 5} more items
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-2 text-xs text-green-600">
                  Refreshing page in 3 seconds...
                </p>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {!result && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSeed} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    {clearExisting ? 'Clear & Seed Data' : 'Seed Data'}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
