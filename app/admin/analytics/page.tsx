'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DashboardCard } from '@/components/admin/dashboard-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  Globe,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 12000, orders: 120 },
  { month: 'Feb', revenue: 15000, orders: 145 },
  { month: 'Mar', revenue: 18000, orders: 168 },
  { month: 'Apr', revenue: 22000, orders: 195 },
  { month: 'May', revenue: 25000, orders: 220 },
  { month: 'Jun', revenue: 28000, orders: 245 }
];

const topDestinations = [
  { country: 'Germany', orders: 145, revenue: 18500 },
  { country: 'USA', orders: 132, revenue: 22100 },
  { country: 'UAE', orders: 98, revenue: 12800 },
  { country: 'UK', orders: 87, revenue: 15200 },
  { country: 'France', orders: 76, revenue: 11900 }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('6m');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Detailed insights and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Last 6 months
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimeRange('1m')}>
                  Last month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('3m')}>
                  Last 3 months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('6m')}>
                  Last 6 months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('1y')}>
                  Last year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Revenue"
            value="$120,450"
            change={{ value: "18.2%", type: "increase" }}
            icon={DollarSign}
            description="vs last period"
          />
          <DashboardCard
            title="Orders Processed"
            value="1,295"
            change={{ value: "12.5%", type: "increase" }}
            icon={Package}
            description="vs last period"
          />
          <DashboardCard
            title="Active Customers"
            value="856"
            change={{ value: "8.1%", type: "increase" }}
            icon={Users}
            description="vs last period"
          />
          <DashboardCard
            title="Avg. Order Value"
            value="$93.00"
            change={{ value: "3.2%", type: "decrease" }}
            icon={TrendingUp}
            description="vs last period"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Monthly revenue and order volume over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/10">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Revenue Chart Placeholder
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Integration with charting library needed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>
                Current order status breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Delivered</span>
                  </div>
                  <div className="text-sm font-medium">65%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">In Transit</span>
                  </div>
                  <div className="text-sm font-medium">22%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Processing</span>
                  </div>
                  <div className="text-sm font-medium">8%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="text-sm font-medium">5%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Top Destinations
              </CardTitle>
              <CardDescription>
                Most popular shipping destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDestinations.map((destination, index) => (
                  <div key={destination.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{destination.country}</div>
                        <div className="text-sm text-muted-foreground">
                          {destination.orders} orders
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${destination.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction</CardTitle>
              <CardDescription>
                Customer feedback and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Rating</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl font-bold">4.8</span>
                    <span className="text-sm text-muted-foreground">/5.0</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>5 stars</span>
                    <span>78%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>4 stars</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>3 stars</span>
                    <span>5%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>2 stars</span>
                    <span>1%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '1%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>1 star</span>
                    <span>1%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '1%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance</CardTitle>
              <CardDescription>
                Important business metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delivery Success Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">98.5%</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg. Delivery Time</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">3.2 days</span>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Retention</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">85%</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Order Cancellation Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">2.1%</span>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Revenue Growth</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">+18.2%</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
