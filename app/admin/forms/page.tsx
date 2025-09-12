'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw,
  Download
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export default function FormsPage() {
  const [submissions, setSubmissions] = React.useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expandedCard, setExpandedCard] = React.useState<string | null>(null);
  // Remove unused stats for now
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadFormSubmissions();
  }, []);

  const loadFormSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      console.log('Submissions received:', data.submissions);
      
      if (response.ok) {
        setSubmissions(data.submissions || []);
      } else {
        setError(data.error || 'Failed to load form submissions');
      }
    } catch (error) {
      console.error('Error loading form submissions:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug logging
  React.useEffect(() => {
    console.log('Component state:', {
      submissions: submissions.length,
      isLoading,
      error
    });
  }, [submissions, isLoading, error]);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
          <p className="text-muted-foreground">
            Manage and track all submitted forms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadFormSubmissions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Show submissions count */}
      <div className="text-sm text-muted-foreground mb-6">
        Found {submissions.length} form submissions
      </div>

      {/* Form Submissions Cards */}
      <div className="space-y-4">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3 max-w-md">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium">Connection Error</h3>
                <p className="text-muted-foreground">{error}</p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This usually means your Supabase database is not configured.
                  </p>
                  <Button onClick={loadFormSubmissions}>
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Loading submissions...</p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No form submissions found</p>
            </div>
          ) : (
            submissions.map((submission, index) => {
                console.log(`Rendering card ${index + 1}:`, submission.sender_name);
                
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'accepted':
                      return 'bg-green-500/10 text-green-400 border-green-500/20';
                    case 'pending':
                      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                    case 'declined':
                      return 'bg-red-500/10 text-red-400 border-red-500/20';
                    case 'waiting':
                      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    case 'processing':
                      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                    default:
                      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                  }
                };

                const handleStatusChange = async (newStatus: string) => {
                  try {
                    const response = await fetch('/api/admin/form-submissions', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        id: submission.id,
                        status: newStatus
                      })
                    });

                    if (response.ok) {
                      // Refresh the data
                      loadFormSubmissions();
                    }
                  } catch (error) {
                    console.error('Error updating status:', error);
                  }
                };

                const isExpanded = expandedCard === submission.id;
                
                return (
                  <div key={submission.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Horizontal Card - Always Visible */}
                    <div 
                      className="group p-4 hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer"
                      onClick={() => setExpandedCard(isExpanded ? null : submission.id)}
                    >
                      <div className="flex items-center justify-between">
                        {/* Left Side - User Info */}
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {submission.sender_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{submission.sender_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {submission.user_type === 'guest' ? 'Guest' : 'Registered'}
                            </p>
                          </div>
                        </div>

                        {/* Middle - Quick Info */}
                        <div className="flex items-center space-x-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">To: </span>
                            <span className="text-foreground">{submission.receiver_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dest: </span>
                            <span className="text-foreground">{submission.destination}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Value: </span>
                            <span className="text-foreground font-medium">${submission.content_value}</span>
                          </div>
                        </div>

                        {/* Right Side - Status and Date */}
                        <div className="flex items-center space-x-4">
                          <div className="text-xs text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          
                          {/* Status Dropdown */}
                          <select
                            value={submission.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(e.target.value);
                            }}
                            className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer transition-colors ${getStatusColor(submission.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="waiting">Waiting</option>
                            <option value="processing">Processing</option>
                          </select>

                          {/* Expand Arrow */}
                          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details - Shows Below */}
                    {isExpanded && (
                      <div className="border-t border-border bg-card/50 p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Sender Details */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Sender Information</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Name: </span>
                                <span className="text-foreground">{submission.sender_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">TC: </span>
                                <span className="text-foreground">{submission.sender_tc}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Contact: </span>
                                <span className="text-foreground">{submission.sender_contact}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Address: </span>
                                <span className="text-foreground">{submission.sender_address}</span>
                              </div>
                              {submission.user_email && (
                                <div>
                                  <span className="text-muted-foreground">Email: </span>
                                  <span className="text-foreground">{submission.user_email}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Receiver Details */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Receiver Information</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Name: </span>
                                <span className="text-foreground">{submission.receiver_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Contact: </span>
                                <span className="text-foreground">{submission.receiver_contact}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email: </span>
                                <span className="text-foreground">{submission.receiver_email}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Address: </span>
                                <span className="text-foreground">{submission.receiver_address}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">City/Postal: </span>
                                <span className="text-foreground">{submission.city_postal}</span>
                              </div>
                            </div>
                          </div>

                          {/* Package Details */}
                          <div className="md:col-span-2">
                            <h4 className="font-semibold text-foreground mb-3">Package Information</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Description: </span>
                                <span className="text-foreground">{submission.content_description}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Declared Value: </span>
                                <span className="text-foreground font-medium">${submission.content_value}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Created: </span>
                                <span className="text-foreground">
                                  {new Date(submission.created_at).toLocaleDateString('en-US', {
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
                  </div>
                );
            })
          )}
      </div>
    </AdminLayout>
  );
}
