'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Building2, Plus, MapPin, Phone, Mail, Users, Wallet, Edit, MoreHorizontal } from 'lucide-react';

interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  isActive: boolean;
  openingDate: string;
  employeeCount: number;
  accountCount: number;
}

const branches: Branch[] = [
  {
    id: 'branch-001',
    code: 'HO001',
    name: 'Head Office - Mumbai',
    address: '101, Maker Chambers III, Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'IN',
    phone: '+91-22-22223333',
    email: 'head.office@indiabank.demo',
    isActive: true,
    openingDate: '2020-01-15',
    employeeCount: 45,
    accountCount: 5243
  },
  {
    id: 'branch-002',
    code: 'BR002',
    name: 'Delhi Branch',
    address: '12, Connaught Place',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110001',
    country: 'IN',
    phone: '+91-11-23456789',
    email: 'delhi.branch@indiabank.demo',
    isActive: true,
    openingDate: '2020-06-20',
    employeeCount: 28,
    accountCount: 3892
  },
  {
    id: 'branch-003',
    code: 'BR003',
    name: 'Bangalore Branch',
    address: '45, MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'IN',
    phone: '+91-80-23456789',
    email: 'bangalore.branch@indiabank.demo',
    isActive: true,
    openingDate: '2021-03-10',
    employeeCount: 22,
    accountCount: 2156
  },
];

export default function BranchesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalEmployees = branches.reduce((sum, b) => sum + b.employeeCount, 0);
  const totalAccounts = branches.reduce((sum, b) => sum + b.accountCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-muted-foreground">
            Manage bank branches and their settings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>Create a new branch location</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch Code</Label>
                  <Input placeholder="e.g., BR004" />
                </div>
                <div className="space-y-2">
                  <Label>Branch Name</Label>
                  <Input placeholder="e.g., Chennai Branch" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea placeholder="Enter full address..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input placeholder="State" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input placeholder="Postal Code" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+91-XX-XXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="branch@indiabank.demo" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Create Branch
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
                <p className="text-sm text-muted-foreground">Total Branches</p>
                <p className="text-3xl font-bold">{branches.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {branches.filter(b => b.isActive).length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-3xl font-bold text-purple-600">{totalAccounts.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} className={!branch.isActive ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">{branch.code}</Badge>
                  <CardTitle className="text-lg">{branch.name}</CardTitle>
                </div>
                <Badge className={branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    {branch.address}, {branch.city}, {branch.state} {branch.postalCode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{branch.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-xl font-bold">{branch.employeeCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accounts</p>
                  <p className="text-xl font-bold">{branch.accountCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Opening Date: {new Date(branch.openingDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>Complete list of branch locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Accounts</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.code}</TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.city}</TableCell>
                  <TableCell>{branch.state}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{branch.phone}</p>
                      <p className="text-muted-foreground">{branch.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{branch.employeeCount}</TableCell>
                  <TableCell>{branch.accountCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
