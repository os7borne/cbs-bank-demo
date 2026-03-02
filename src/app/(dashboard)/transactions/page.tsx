"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("cash-deposit");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    amount: "",
    narration: "",
    referenceNumber: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionType: activeTab === "cash-deposit" ? "CASH_DEPOSIT" : "CASH_WITHDRAWAL",
          accountNumber: formData.accountNumber,
          amount: parseFloat(formData.amount),
          narration: formData.narration,
          referenceNumber: formData.referenceNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Transaction failed");
      }

      toast.success("Transaction posted successfully");
      setFormData({ accountNumber: "", amount: "", narration: "", referenceNumber: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          Post teller transactions and transfers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Post Transaction
            </CardTitle>
            <CardDescription>
              Enter transaction details to post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cash-deposit">Cash Deposit</TabsTrigger>
                <TabsTrigger value="cash-withdrawal">Cash Withdrawal</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
              </TabsList>

              <TabsContent value="cash-deposit" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="narration">Narration</Label>
                    <Input
                      id="narration"
                      placeholder="Enter narration"
                      value={formData.narration}
                      onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
                    <Input
                      id="referenceNumber"
                      placeholder="Enter reference"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Post Deposit"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="cash-withdrawal" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="narration">Narration</Label>
                    <Input
                      id="narration"
                      placeholder="Enter narration"
                      value={formData.narration}
                      onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Post Withdrawal"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="transfer" className="space-y-4">
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  Transfer functionality coming soon
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent transactions posted in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-muted-foreground">
              <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Transaction history will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
