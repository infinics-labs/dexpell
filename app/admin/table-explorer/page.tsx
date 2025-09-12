'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Table
} from 'lucide-react';

interface TableInfo {
  [tableName: string]: {
    exists: boolean;
    count: number;
    error: string | null;
  };
}

export default function TableExplorerPage() {
  const [tableInfo, setTableInfo] = React.useState<TableInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/table-info');
      const data = await response.json();
      
      if (response.ok) {
        setTableInfo(data.possibleTables);
      } else {
        setError(data.error || 'Failed to check tables');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getExistingTables = () => {
    if (!tableInfo) return [];
    return Object.entries(tableInfo)
      .filter(([_, info]) => info.exists)
      .map(([name, info]) => ({ name, ...info }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Table Explorer</h1>
            <p className="text-muted-foreground">
              Find your database tables and identify the correct table name
            </p>
          </div>
          <Button onClick={checkTables} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            Scan Tables
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <XCircle className="mr-2 h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Found Tables */}
        {tableInfo && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Existing Tables Found
                </CardTitle>
                <CardDescription>
                  Tables that exist in your Supabase database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getExistingTables().length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getExistingTables().map((table) => (
                      <Card key={table.name} className="border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center">
                            <Table className="mr-2 h-4 w-4 text-green-600" />
                            {table.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Found
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {table.count} records
                            </p>
                            {table.name !== 'orders' && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-800 font-medium">
                                  This might be your orders table!
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  You'll need to update the API to use "{table.name}" instead of "orders"
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tables Found</h3>
                    <p className="text-muted-foreground">
                      None of the common table names were found in your database.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Table Check Results */}
            <Card>
              <CardHeader>
                <CardTitle>All Checked Tables</CardTitle>
                <CardDescription>
                  Results of checking common table names
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(tableInfo).map(([tableName, info]) => (
                    <div key={tableName} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {info.exists ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <span className="font-medium">{tableName}</span>
                          {info.exists && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({info.count} records)
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        {info.exists ? (
                          <Badge className="bg-green-100 text-green-800">Found</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Not Found</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  How to fix the table name issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  {getExistingTables().length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">If you found your table:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Note the correct table name from the results above</li>
                        <li>The admin panel is currently looking for a table called "orders"</li>
                        <li>We need to update the code to use your actual table name</li>
                        <li>Let me know which table contains your order data</li>
                      </ol>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">If no tables were found:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Check your Supabase dashboard to see your actual table names</li>
                      <li>Make sure your table is in the "public" schema</li>
                      <li>Verify your Supabase credentials are correct</li>
                      <li>Check that Row Level Security (RLS) isn't blocking access</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Quick Fix:</h4>
                    <p className="text-blue-700 text-sm">
                      Once you identify your table name, I can quickly update all the API endpoints 
                      to use the correct table name instead of "orders".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !tableInfo && (
          <Card>
            <CardContent className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Scanning your database tables...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
