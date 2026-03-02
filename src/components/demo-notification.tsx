"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, X } from "lucide-react";

const STORAGE_KEY = "demo-notification-dismissed";

export function DemoNotification() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already dismissed the notification
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Don't render on server
  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Info className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">Demo Environment</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Welcome to the <strong>India Bank Demo</strong>. This is a demonstration system with dummy data for testing and evaluation purposes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Read-Only Mode</p>
                <p className="text-muted-foreground mt-1">
                  Add, delete, and edit operations are disabled in this demo. Data changes will not persist.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• All data shown is fictional and for demonstration only</p>
            <p>• Try different user roles from the login page</p>
            <p>• Explore features: Customers, Accounts, Loans, Transactions</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            <X className="mr-1 h-4 w-4" />
            Don&apos;t show again
          </Button>
          <Button 
            size="sm" 
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
