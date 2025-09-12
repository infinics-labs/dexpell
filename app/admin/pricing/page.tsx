'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CreditCard, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  Download,
  Globe
} from 'lucide-react';

interface PricingRule {
  id: string;
  carrier: 'UPS' | 'DHL' | 'ARAMEX';
  region: string;
  weightRange: string;
  pricePerKg: number;
  minimumCharge: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

const mockPricingRules: PricingRule[] = [
  {
    id: 'PR-001',
    carrier: 'UPS',
    region: 'Europe Zone 1',
    weightRange: '0-5 kg',
    pricePerKg: 25.50,
    minimumCharge: 45.00,
    status: 'active',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'PR-002',
    carrier: 'UPS',
    region: 'Europe Zone 1',
    weightRange: '5-10 kg',
    pricePerKg: 22.00,
    minimumCharge: 45.00,
    status: 'active',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'PR-003',
    carrier: 'DHL',
    region: 'North America',
    weightRange: '0-5 kg',
    pricePerKg: 28.00,
    minimumCharge: 50.00,
    status: 'active',
    lastUpdated: '2024-01-14'
  },
  {
    id: 'PR-004',
    carrier: 'ARAMEX',
    region: 'Middle East',
    weightRange: '0-10 kg',
    pricePerKg: 18.50,
    minimumCharge: 35.00,
    status: 'active',
    lastUpdated: '2024-01-14'
  },
  {
    id: 'PR-005',
    carrier: 'UPS',
    region: 'Asia Pacific',
    weightRange: '10-20 kg',
    pricePerKg: 24.75,
    minimumCharge: 60.00,
    status: 'inactive',
    lastUpdated: '2024-01-10'
  }
];

export default function PricingPage() {
  const [isAddPricingOpen, setIsAddPricingOpen] = React.useState(false);

  const pricingColumns: Column<PricingRule>[] = [
    {
      key: 'id',
      label: 'Rule ID',
      sortable: true,
      render: (value) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'carrier',
      label: 'Carrier',
      sortable: true,
      render: (value) => {
        const carrierColors = {
          UPS: 'bg-amber-100 text-amber-800',
          DHL: 'bg-red-100 text-red-800',
          ARAMEX: 'bg-blue-100 text-blue-800'
        };
        return (
          <Badge className={carrierColors[value as keyof typeof carrierColors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true
    },
    {
      key: 'weightRange',
      label: 'Weight Range',
      sortable: true
    },
    {
      key: 'pricePerKg',
      label: 'Price/kg',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'minimumCharge',
      label: 'Min. Charge',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={statusColors[value as keyof typeof statusColors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true
    }
  ];

  const handlePricingAction = (rule: PricingRule) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit Rule
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Globe className="mr-2 h-4 w-4" />
          View Regions
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Rule
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleAddPricing = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle add pricing logic here
    setIsAddPricingOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
            <p className="text-muted-foreground">
              Configure shipping rates and pricing rules for different carriers and regions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Dialog open={isAddPricingOpen} onOpenChange={setIsAddPricingOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Pricing Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Pricing Rule</DialogTitle>
                  <DialogDescription>
                    Create a new pricing rule for a specific carrier and region.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddPricing}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="carrier">Carrier</Label>
                      <select 
                        id="carrier" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="UPS">UPS</option>
                        <option value="DHL">DHL</option>
                        <option value="ARAMEX">ARAMEX</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Input id="region" placeholder="e.g., Europe Zone 1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightRange">Weight Range</Label>
                      <Input id="weightRange" placeholder="e.g., 0-5 kg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerKg">Price per KG ($)</Label>
                      <Input id="pricePerKg" type="number" step="0.01" placeholder="25.50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimumCharge">Minimum Charge ($)</Label>
                      <Input id="minimumCharge" type="number" step="0.01" placeholder="45.00" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Rule</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Across all carriers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">
                91% of total rules
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price/kg</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24.85</div>
              <p className="text-xs text-muted-foreground">
                Across all regions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today</div>
              <p className="text-xs text-muted-foreground">
                15 rules updated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Rules</CardTitle>
            <CardDescription>
              Manage pricing rules for different carriers, regions, and weight ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockPricingRules}
              columns={pricingColumns}
              actions={handlePricingAction}
              searchPlaceholder="Search pricing rules..."
            />
          </CardContent>
        </Card>

        {/* Carrier-specific pricing cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="bg-amber-100 text-amber-800 mr-2">UPS</Badge>
                UPS Pricing
              </CardTitle>
              <CardDescription>
                UPS Express shipping rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Europe Zone 1 (0-5kg)</span>
                  <span className="font-medium">$25.50/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Europe Zone 1 (5-10kg)</span>
                  <span className="font-medium">$22.00/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>North America (0-10kg)</span>
                  <span className="font-medium">$28.75/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Asia Pacific (10-20kg)</span>
                  <span className="font-medium text-muted-foreground">$24.75/kg (Inactive)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="bg-red-100 text-red-800 mr-2">DHL</Badge>
                DHL Pricing
              </CardTitle>
              <CardDescription>
                DHL Express shipping rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Europe Zone 1 (0-5kg)</span>
                  <span className="font-medium">$26.00/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>North America (0-5kg)</span>
                  <span className="font-medium">$28.00/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Asia Pacific (0-10kg)</span>
                  <span className="font-medium">$25.50/kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="bg-blue-100 text-blue-800 mr-2">ARAMEX</Badge>
                Aramex Pricing
              </CardTitle>
              <CardDescription>
                Aramex shipping rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Middle East (0-10kg)</span>
                  <span className="font-medium">$18.50/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Europe (0-5kg)</span>
                  <span className="font-medium">$22.00/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Africa (0-10kg)</span>
                  <span className="font-medium">$20.25/kg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
