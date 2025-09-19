'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  RefreshCw,
  Download,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';

interface FormSubmission {
  id: string;
  sender_name: string;
  sender_tc: string;
  sender_address: string;
  sender_contact: string;
  receiver_name: string;
  receiver_address: string;
  city_postal: string;
  destination: string;
  receiver_contact: string;
  receiver_email: string;
  content_description: string;
  content_value: string;
  user_type: 'guest' | 'registered';
  user_email: string | null;
  user_id: string | null;
  status: 'waiting' | 'accepted' | 'declined' | 'pending';
  created_at: string;
  updated_at: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = React.useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [expandedCard, setExpandedCard] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the existing form-submissions API
      const params = new URLSearchParams({
        pageSize: '100',
        status: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      console.log('Fetching form submissions...');
      const response = await fetch(`/api/admin/form-submissions?${params}`);
      const data = await response.json();
      
      console.log('API Response:', { status: response.status, data });
      
      if (response.ok) {
        setRequests(data.submissions || []);
      } else {
        setError(data.error || 'Failed to load form submissions');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load form submissions');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.user_email && request.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    waiting: requests.filter(r => r.status === 'waiting').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    declined: requests.filter(r => r.status === 'declined').length,
    totalValue: requests.reduce((sum, r) => {
      return sum + (parseFloat(r.content_value) || 0);
    }, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'waiting':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'accepted':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'declined':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/form-submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus
        })
      });

      if (response.ok) {
        // Refresh the data
        loadRequests();
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground">
              Chatbot requests with pricing options and conversions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadRequests}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All form submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                New submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waiting}</div>
              <p className="text-xs text-muted-foreground">
                Under review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted}</div>
              <p className="text-xs text-muted-foreground">
                Approved requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Content value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by sender, receiver, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="waiting">Waiting</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2" />
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={loadRequests}>
                Try Again
              </Button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'No requests found matching your filters' : 'No requests found'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const isExpanded = expandedCard === request.id;
              
              return (
                <Card key={request.id} className="overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedCard(isExpanded ? null : request.id)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left Side - Sender Info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {request.sender_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{request.sender_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.user_type === 'guest' ? 'Guest User' : 'Registered User'}
                          </p>
                        </div>
                      </div>

                      {/* Middle - Shipment Info */}
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">To: </span>
                          <span className="font-medium">{request.receiver_name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Destination: </span>
                          <span className="font-medium">{request.destination}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value: </span>
                          <span className="font-medium">${request.content_value}</span>
                        </div>
                      </div>

                      {/* Right Side - Status and Date */}
                      <div className="flex items-center space-x-4">
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        
                        {/* Status Dropdown */}
                        <select
                          value={request.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(request.id, e.target.value);
                          }}
                          className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer transition-colors ${getStatusColor(request.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="waiting">Waiting</option>
                          <option value="accepted">Accepted</option>
                          <option value="declined">Declined</option>
                        </select>

                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Sender Details */}
                        <div>
                          <h4 className="font-semibold mb-3">Sender Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Name: </span>
                              <span>{request.sender_name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">TC: </span>
                              <span>{request.sender_tc}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contact: </span>
                              <span>{request.sender_contact}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Address: </span>
                              <span>{request.sender_address}</span>
                            </div>
                            {request.user_email && (
                              <div>
                                <span className="text-muted-foreground">Email: </span>
                                <span>{request.user_email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Receiver Details */}
                        <div>
                          <h4 className="font-semibold mb-3">Receiver Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Name: </span>
                              <span>{request.receiver_name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contact: </span>
                              <span>{request.receiver_contact}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email: </span>
                              <span>{request.receiver_email}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Address: </span>
                              <span>{request.receiver_address}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">City/Postal: </span>
                              <span>{request.city_postal}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Destination: </span>
                              <span>{request.destination}</span>
                            </div>
                          </div>
                        </div>

                        {/* Package Details */}
                        <div className="md:col-span-2">
                          <h4 className="font-semibold mb-3">Package Information</h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Description: </span>
                              <span>{request.content_description}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Declared Value: </span>
                              <span className="font-medium">${request.content_value}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created: </span>
                              <span>
                                {new Date(request.created_at).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Updated: </span>
                              <span>
                                {new Date(request.updated_at).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
