'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Database,
  Key,
  Globe,
  RefreshCw
} from 'lucide-react';

interface DebugInfo {
  hasUrl: boolean;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  urlPreview: string;
  keyPreview: string;
}

interface ConnectionTest {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  totalOrders?: number;
}

export default function DebugPage() {
  const [envInfo, setEnvInfo] = React.useState<DebugInfo | null>(null);
  const [connectionTest, setConnectionTest] = React.useState<ConnectionTest | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/debug-env');
      const data = await response.json();
      setEnvInfo(data);
    } catch (error) {
      console.error('Failed to check environment:', error);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setConnectionTest(data);
    } catch (error) {
      setConnectionTest({
        success: false,
        error: 'Failed to test connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge className={status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {status ? '✓' : '✗'} {label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Debug</h1>
          <p className="text-muted-foreground">
            Diagnose Supabase connection and configuration issues
          </p>
        </div>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Environment Variables
            </CardTitle>
            <CardDescription>
              Check if Supabase credentials are properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {envInfo ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        {getStatusIcon(envInfo.hasUrl)}
                        <span className="ml-2">Supabase URL</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getStatusBadge(envInfo.hasUrl, 'NEXT_PUBLIC_SUPABASE_URL')}
                        {envInfo.hasUrl && (
                          <p className="text-xs text-muted-foreground">
                            {envInfo.urlPreview}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        {getStatusIcon(envInfo.hasAnonKey)}
                        <span className="ml-2">Anon Key</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getStatusBadge(envInfo.hasAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')}
                        {envInfo.hasAnonKey && (
                          <p className="text-xs text-muted-foreground">
                            {envInfo.keyPreview}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        {getStatusIcon(envInfo.hasServiceKey)}
                        <span className="ml-2">Service Key</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getStatusBadge(envInfo.hasServiceKey, 'SUPABASE_SERVICE_ROLE_KEY')}
                        <p className="text-xs text-muted-foreground">
                          Optional, but recommended for admin operations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(!envInfo.hasUrl || !envInfo.hasAnonKey) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-yellow-800">Missing Environment Variables</h4>
                    </div>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Please add the missing environment variables to your <code>.env.local</code> file:</p>
                      <pre className="mt-2 bg-yellow-100 p-2 rounded text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Checking environment...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Connection
            </CardTitle>
            <CardDescription>
              Test the connection to your Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testConnection} 
                disabled={isLoading || !envInfo?.hasUrl || !envInfo?.hasAnonKey}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Test Connection
              </Button>

              {connectionTest && (
                <div className={`border rounded-lg p-4 ${
                  connectionTest.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {connectionTest.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <h4 className={`font-semibold ${
                      connectionTest.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {connectionTest.success ? 'Connection Successful!' : 'Connection Failed'}
                    </h4>
                  </div>
                  
                  {connectionTest.message && (
                    <p className={`text-sm ${
                      connectionTest.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {connectionTest.message}
                    </p>
                  )}

                  {connectionTest.totalOrders !== undefined && (
                    <p className="text-sm text-green-700 mt-1">
                      Found {connectionTest.totalOrders} orders in your database
                    </p>
                  )}

                  {connectionTest.error && (
                    <p className="text-sm text-red-700 mt-1">
                      Error: {connectionTest.error}
                    </p>
                  )}

                  {connectionTest.details && (
                    <p className="text-xs text-red-600 mt-1">
                      Details: {connectionTest.details}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              How to configure your Supabase connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Get your Supabase credentials:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Select your project</li>
                  <li>Go to Settings → API</li>
                  <li>Copy the Project URL and anon public key</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Create .env.local file in your project root:</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Restart your development server:</h4>
                <pre className="bg-muted p-3 rounded text-xs">
                  npm run dev
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
