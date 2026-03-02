import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";
import Link from "next/link";

const reports = [
  {
    title: "Account Statement",
    description: "Generate customer account statements with transaction history",
    href: "/reports/statements",
    icon: FileText,
  },
  {
    title: "Trial Balance",
    description: "GL trial balance report for accounting reconciliation",
    href: "/reports/trial-balance",
    icon: FileText,
  },
  {
    title: "Audit Trail",
    description: "Track all system changes and user activities",
    href: "/reports/audit",
    icon: FileText,
  },
  {
    title: "Loan Portfolio Report",
    description: "Summary of all loans with risk classification",
    href: "#",
    icon: FileText,
  },
  {
    title: "Deposit Summary",
    description: "Aggregated deposit balances by product and branch",
    href: "#",
    icon: FileText,
  },
  {
    title: "Daily Transaction Report",
    description: "All transactions posted for a specific date",
    href: "#",
    icon: FileText,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download banking reports
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className="h-5 w-5" />
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={report.href}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
