import { ProductService } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Building2, Plus, Package } from 'lucide-react';
import Link from 'next/link';

async function getProducts() {
  const products = await ProductService.findAll();
  return products;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  INACTIVE: 'bg-red-100 text-red-800',
};

export default async function ProductsPage() {
  const products = await getProducts();
  const depositProducts = products.filter(p => p.productType === 'DEPOSIT');
  const loanProducts = products.filter(p => p.productType === 'LOAN');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Factory</h1>
          <p className="text-muted-foreground">
            Manage deposit and loan products with rates and fees
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="deposits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deposits">
            Deposit Products ({depositProducts.length})
          </TabsTrigger>
          <TabsTrigger value="loans">
            Loan Products ({loanProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Deposit Products
              </CardTitle>
              <CardDescription>
                Savings, Current, and Term Deposit products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Interest Tiers</TableHead>
                      <TableHead>Accounts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depositProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.productCode}</TableCell>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.currency?.code}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[product.status] || 'bg-gray-100'}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.interestRateTiers?.length || 0} tier(s)</TableCell>
                        <TableCell>{product._count?.accounts || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Loan Products
              </CardTitle>
              <CardDescription>
                Personal and SME loan products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Loans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.productCode}</TableCell>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.currency?.code}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[product.status] || 'bg-gray-100'}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{product._count?.accounts || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
