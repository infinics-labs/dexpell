'use client';

import * as React from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DashboardCard } from '@/components/admin/dashboard-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Clock,
  Package,
  DollarSign,
  RefreshCw,
  Plus,
  Upload,
  Eye,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface DashboardKPIs {
  newRequests: number;
  formPending: number;
  booked: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = React.useState<DashboardKPIs>({
    newRequests: 0,
    formPending: 0,
    booked: 0,
    revenue: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch form submissions data
      const submissionsResponse = await fetch('/api/admin/form-submissions?pageSize=1000');
      const submissionsData = await submissionsResponse.json();
      
      if (submissionsResponse.ok) {
        const submissions = submissionsData.submissions || [];
        
        // Calculate KPIs based on form status
        const newRequests = submissions.filter((s: any) => s.status === 'pending').length;
        const formPending = submissions.filter((s: any) => s.status === 'waiting').length;
        const booked = submissions.filter((s: any) => s.status === 'accepted').length;
        const revenue = submissions
          .filter((s: any) => s.status === 'accepted')
          .reduce((sum: number, s: any) => sum + (parseFloat(s.content_value) || 0), 0);
        
        setKpis({
          newRequests,
          formPending,
          booked,
          revenue
        });
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to connect to database');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate funnel conversion rates
  const totalRequests = kpis.newRequests + kpis.formPending + kpis.booked;
  const conversionRate = totalRequests > 0 ? ((kpis.booked / totalRequests) * 100).toFixed(1) : '0';

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Page Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
              Welcome back! Here's your business overview and key metrics.
          </p>
        </div>
        <Button variant="outline" onClick={loadDashboardData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3 max-w-md">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium">Connection Error</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadDashboardData}>
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <DashboardCard
                title="New Requests"
                value={isLoading ? "..." : kpis.newRequests.toString()}
                change={{ value: "Pending review", type: "neutral" }}
                icon={MessageSquare}
                description="Recently submitted forms"
              />
              <DashboardCard
                title="Form Pending"
                value={isLoading ? "..." : kpis.formPending.toString()}
                change={{ value: "Under review", type: "neutral" }}
                icon={Clock}
                description="Forms being processed"
              />
            <DashboardCard
                title="Booked"
                value={isLoading ? "..." : kpis.booked.toString()}
                change={{ value: "Completed", type: "increase" }}
                icon={Package}
                description="Successfully booked"
            />
            <DashboardCard
                title="Revenue"
                value={isLoading ? "..." : `$${kpis.revenue.toFixed(2)}`}
                change={{ value: "Total earnings", type: "increase" }}
                icon={DollarSign}
                description="From booked requests"
            />
          </div>

            {/* Funnel and Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Conversion Funnel</span>
                  </CardTitle>
                  <CardDescription>
                    Request-to-booking conversion flow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Funnel Steps */}
                    <div className="space-y-4">
                      {/* New Requests */}
                      <div className="relative">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                              <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-black text-lg">New Requests</div>
                              <div className="text-sm text-gray-600">Initial submissions</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-black">{kpis.newRequests}</div>
                            <div className="text-sm font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                              100%
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Form Pending */}
                      <div className="relative">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-black text-lg">Form Pending</div>
                              <div className="text-sm text-gray-600">Under review</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-black">{kpis.formPending}</div>
                            <div className="text-sm font-medium text-amber-700 bg-amber-200 px-2 py-1 rounded-full">
                              {totalRequests > 0 ? ((kpis.formPending / totalRequests) * 100).toFixed(1) : '0'}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booked */}
                      <div className="relative">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-black text-lg">Booked</div>
                              <div className="text-sm text-gray-600">Successfully converted</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-black">{kpis.booked}</div>
                            <div className="text-sm font-medium text-emerald-700 bg-emerald-200 px-2 py-1 rounded-full">
                              {conversionRate}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conversion Summary */}
                    <div className="pt-6 border-t-2 border-gray-200">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-black text-lg">Overall Conversion Rate:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <span className="font-bold text-2xl text-black">{conversionRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button asChild className="w-full justify-start h-12">
                      <Link href="/admin/requests">
                        <Plus className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Create Manual Request</div>
                          <div className="text-xs text-muted-foreground">Add new request manually</div>
                        </div>
                      </Link>
                    </Button>

                    <Button variant="outline" className="w-full justify-start h-12">
                      <Upload className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Import CSV</div>
                        <div className="text-xs text-muted-foreground">Bulk import requests</div>
                      </div>
                    </Button>

                    <Button variant="outline" asChild className="w-full justify-start h-12">
                      <Link href="/admin/requests">
                        <Eye className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">View Requests</div>
                          <div className="text-xs text-muted-foreground">Manage all requests</div>
                        </div>
                      </Link>
              </Button>

                    <Button variant="outline" asChild className="w-full justify-start h-12">
                      <Link href="/admin/customers">
                        <MessageSquare className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">View Customers</div>
                          <div className="text-xs text-muted-foreground">Customer management</div>
                        </div>
                      </Link>
              </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
        </>
      )}
      </div>
    </AdminLayout>
  );
}