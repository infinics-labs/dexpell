'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Package, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  customerEmail: string;
  origin: string;
  destination: string;
  weight: string;
  dimensions: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  trackingNumber?: string;
  date: string;
  estimatedDelivery: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    customerEmail: 'john.doe@example.com',
    origin: 'Istanbul, Turkey',
    destination: 'Berlin, Germany',
    weight: '5.2 kg',
    dimensions: '30×25×15 cm',
    status: 'shipped',
    amount: 145.50,
    trackingNumber: 'TRK-001-2024',
    date: '2024-01-15',
    estimatedDelivery: '2024-01-18'
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    origin: 'Ankara, Turkey',
    destination: 'New York, USA',
    weight: '12.8 kg',
    dimensions: '50×40×30 cm',
    status: 'processing',
    amount: 298.00,
    date: '2024-01-15',
    estimatedDelivery: '2024-01-20'
  },
  {
    id: 'ORD-003',
    customer: 'Ahmed Hassan',
    customerEmail: 'ahmed.hassan@example.com',
    origin: 'Izmir, Turkey',
    destination: 'Dubai, UAE',
    weight: '3.1 kg',
    dimensions: '25×20×10 cm',
    status: 'delivered',
    amount: 89.25,
    trackingNumber: 'TRK-003-2024',
    date: '2024-01-14',
    estimatedDelivery: '2024-01-17'
  },
  {
    id: 'ORD-004',
    customer: 'Maria Garcia',
    customerEmail: 'maria.garcia@example.com',
    origin: 'Istanbul, Turkey',
    destination: 'Madrid, Spain',
    weight: '8.7 kg',
    dimensions: '40×30×25 cm',
    status: 'pending',
    amount: 167.75,
    date: '2024-01-14',
    estimatedDelivery: '2024-01-19'
  },
  {
    id: 'ORD-005',
    customer: 'Robert Johnson',
    customerEmail: 'robert.johnson@example.com',
    origin: 'Bursa, Turkey',
    destination: 'London, UK',
    weight: '15.3 kg',
    dimensions: '60×45×35 cm',
    status: 'cancelled',
    amount: 275.80,
    date: '2024-01-13',
    estimatedDelivery: '2024-01-18'
  }
];

export default function OrdersPage() {
  const orderColumns: Column<Order>[] = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value, order) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'origin',
      label: 'Route',
      render: (value, order) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <span className="font-medium">{value}</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <span>→</span>
            <span>{order.destination}</span>
          </div>
        </div>
      )
    },
    {
      key: 'weight',
      label: 'Details',
      render: (value, order) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-muted-foreground">{order.dimensions}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
          processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
          shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
          delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config.icon;
        
        return (
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true
    }
  ];

  const handleOrderAction = (order: Order) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit Order
        </DropdownMenuItem>
        {order.trackingNumber && (
          <DropdownMenuItem>
            <Truck className="mr-2 h-4 w-4" />
            Track Package
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Cancel Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all cargo orders
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">423</div>
              <p className="text-xs text-muted-foreground">
                Currently shipping
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,654</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">112</div>
              <p className="text-xs text-muted-foreground">
                4.8% cancellation rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              Complete list of cargo orders with tracking and management options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockOrders}
              columns={orderColumns}
              actions={handleOrderAction}
              searchPlaceholder="Search orders by ID, customer, or destination..."
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
