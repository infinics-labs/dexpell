'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DashboardCard } from '@/components/admin/dashboard-card';
import { 
  FileText, 
  Users,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = React.useState({
    totalSubmissions: 0,
    totalUsers: 0
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
      
      // Fetch users data
      const usersResponse = await fetch('/api/admin/users-summary');
      const usersData = await usersResponse.json();
      
      if (submissionsResponse.ok && usersResponse.ok) {
        const submissions = submissionsData.submissions || [];
        const users = usersData.users || [];
        
        setDashboardData({
          totalSubmissions: submissions.length,
          totalUsers: users.length
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

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your business overview.
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
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <DashboardCard
              title="Total Form Submissions"
              value={isLoading ? "..." : dashboardData.totalSubmissions.toString()}
              change={{ value: "Real data", type: "increase" }}
              icon={FileText}
              description="All form submissions"
            />
            <DashboardCard
              title="Total Users"
              value={isLoading ? "..." : dashboardData.totalUsers.toString()}
              change={{ value: "Real data", type: "increase" }}
              icon={Users}
              description="Unique customers"
            />
          </div>

          {/* Welcome Message */}
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Dexpell Admin</h2>
            <p className="text-muted-foreground mb-6">
              Use the sidebar to navigate between different sections of your admin panel.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <a href="/admin/forms">View Form Submissions</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/users">Manage Users</a>
              </Button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}