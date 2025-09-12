'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RefreshCw, Users as UsersIcon } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  tc: string;
  orders: number;
  totalSpent: number;
  firstOrder: string;
  lastOrder: string;
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users-summary');
      const data = await response.json();
      
      if (response.ok) {
        // Map the real user data to our interface
        const mappedUsers = (data.users || []).map((user: any) => ({
          id: user.tc,
          name: user.name,
          email: user.email || 'No email',
          contact: user.contact,
          tc: user.tc,
          orders: user.orderCount,
          totalSpent: user.totalValue,
          firstOrder: user.firstOrder,
          lastOrder: user.lastOrder
        }));
        setUsers(mappedUsers);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to connect to database');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tc.includes(searchTerm)
  );

  const userColumns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{value}</div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{value}</div>
      )
    },
    {
      key: 'tc',
      label: 'TC Number',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-mono">{value}</div>
      )
    },
    {
      key: 'orders',
      label: 'Orders',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => (
        <div className="font-medium">${value.toFixed(2)}</div>
      )
    },
    {
      key: 'firstOrder',
      label: 'First Order',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage and view all customer information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Active customers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.orders, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${users.reduce((sum, user) => sum + user.totalSpent, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search users by name, email, or TC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Database</CardTitle>
            <CardDescription>
              All customers who have submitted forms ({filteredUsers.length} of {users.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <RefreshCw className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">{error}</p>
                <Button onClick={loadUsers}>
                  Try Again
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users found matching your search' : 'No users found'}
                </p>
              </div>
            ) : (
              <DataTable
                data={filteredUsers}
                columns={userColumns}
                pageSize={10}
                searchPlaceholder="Search users..."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}