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
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, UserPlus, Users, Shield, Mail, Phone, MoreHorizontal, Edit, Lock } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: string;
  branch: string;
  isActive: boolean;
  lastLogin?: string;
}

const users: User[] = [
  {
    id: 'user-001',
    email: 'admin@indiabank.demo',
    firstName: 'System',
    lastName: 'Administrator',
    employeeId: 'EMP001',
    role: 'ADMIN',
    branch: 'Head Office',
    isActive: true,
    lastLogin: '2024-12-01T10:30:00Z'
  },
  {
    id: 'user-002',
    email: 'teller@indiabank.demo',
    firstName: 'Bank',
    lastName: 'Teller',
    employeeId: 'EMP002',
    role: 'TELLER',
    branch: 'Mumbai Branch',
    isActive: true,
    lastLogin: '2024-12-01T09:15:00Z'
  },
  {
    id: 'user-003',
    email: 'cs@indiabank.demo',
    firstName: 'Customer',
    lastName: 'Support',
    employeeId: 'EMP003',
    role: 'CUSTOMER_SERVICE',
    branch: 'Delhi Branch',
    isActive: true,
    lastLogin: '2024-11-30T16:45:00Z'
  },
  {
    id: 'user-004',
    email: 'ops@indiabank.demo',
    firstName: 'Operations',
    lastName: 'Manager',
    employeeId: 'EMP004',
    role: 'OPERATIONS',
    branch: 'Head Office',
    isActive: true,
    lastLogin: '2024-12-01T08:00:00Z'
  },
  {
    id: 'user-005',
    email: 'credit@indiabank.demo',
    firstName: 'Credit',
    lastName: 'Analyst',
    employeeId: 'EMP005',
    role: 'CREDIT',
    branch: 'Bangalore Branch',
    isActive: false
  },
  {
    id: 'user-006',
    email: 'finance@indiabank.demo',
    firstName: 'Finance',
    lastName: 'Manager',
    employeeId: 'EMP006',
    role: 'FINANCE',
    branch: 'Head Office',
    isActive: true,
    lastLogin: '2024-11-29T14:20:00Z'
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    TELLER: 'bg-blue-100 text-blue-800',
    CUSTOMER_SERVICE: 'bg-green-100 text-green-800',
    OPERATIONS: 'bg-purple-100 text-purple-800',
    CREDIT: 'bg-orange-100 text-orange-800',
    FINANCE: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new system user account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Enter last name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="user@indiabank.demo" />
              </div>
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input placeholder="EMPXXX" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TELLER">Teller</SelectItem>
                      <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
                      <SelectItem value="OPERATIONS">Operations</SelectItem>
                      <SelectItem value="CREDIT">Credit</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HO">Head Office - Mumbai</SelectItem>
                      <SelectItem value="DEL">Delhi Branch</SelectItem>
                      <SelectItem value="BLR">Bangalore Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-3xl font-bold text-gray-600">
                  {users.filter(u => !u.isActive).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-3xl font-bold text-red-600">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TELLER">Teller</SelectItem>
                <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
                <SelectItem value="OPERATIONS">Operations</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.employeeId}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.branch}</TableCell>
                  <TableCell>
                    <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString() 
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Lock className="h-4 w-4" />
                      </Button>
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
