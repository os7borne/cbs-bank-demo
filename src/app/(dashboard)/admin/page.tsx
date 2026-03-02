import { UserService } from '@/lib/services';
import { collections } from '@/lib/firebase-admin';
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
import { Users, Building2, Landmark, Plus } from 'lucide-react';
import { SeedDataButton } from '@/components/admin/seed-data-button';

// Check if we're in build/static generation mode
const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY);
};

async function getAdminData() {
  // Return empty data during build time
  if (isBuildTime()) {
    return { users: [], branches: [], glAccounts: [] };
  }

  try {
    const [usersSnapshot, branchesSnapshot, glAccountsSnapshot] = await Promise.all([
      collections.users.orderBy('createdAt', 'desc').limit(10).get(),
      collections.branches.orderBy('code', 'asc').get(),
      collections.glAccounts.where('isLeaf', '==', true).orderBy('accountCode', 'asc').limit(10).get(),
    ]);

    const users = usersSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    const branches = branchesSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    const glAccounts = glAccountsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    return { users, branches, glAccounts };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return { users: [], branches: [], glAccounts: [] };
  }
}

export default async function AdminPage() {
  const { users, branches, glAccounts } = await getAdminData();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">
            Manage users, branches, and GL accounts
          </p>
        </div>
        <SeedDataButton />
      </div>

      {/* Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>
              System users and their roles
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Branches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Branches
            </CardTitle>
            <CardDescription>
              Branch network configuration
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No branches found
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch: any) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.code}</TableCell>
                      <TableCell>{branch.name}</TableCell>
                      <TableCell>{branch.city}</TableCell>
                      <TableCell>
                        <Badge className={branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* GL Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              GL Accounts
            </CardTitle>
            <CardDescription>
              Chart of accounts (top 10)
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {glAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No GL accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  glAccounts.map((account: any) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.accountCode}</TableCell>
                      <TableCell>{account.accountName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.accountType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {(account.currentBalance || 0).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
