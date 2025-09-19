'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Users as UsersIcon, 
  MessageSquare,
  Package,
  TrendingUp,
  Eye,
  Download,
  Merge,
  Clock,
  MapPin
} from 'lucide-react';

interface Customer {
  tc: string; // Primary identifier (unique)
  name: string;
  company?: string;
  email: string;
  phone: string;
  country: string;
  address?: string;
  tax_id?: string;
  customer_type: 'guest' | 'registered';
  registration_date: string;
  last_activity: string;
  total_requests: number;
  total_bookings: number;
  total_spent: number;
  tags: string[];
  status: 'active' | 'inactive' | 'blocked';
}

interface CustomerRequest {
  id: string;
  sender_name: string;
  receiver_name: string;
  destination: string;
  content_value: string;
  content_description: string;
  status: 'waiting' | 'accepted' | 'declined' | 'pending';
  created_at: string;
  updated_at: string;
}

interface CustomerBooking {
  id: string;
  booking_number: string;
  date: string;
  route: string;
  carrier: string;
  chargeable_weight: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  tracking_number?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [customerRequests, setCustomerRequests] = React.useState<CustomerRequest[]>([]);
  const [customerBookings, setCustomerBookings] = React.useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showCustomerDetail, setShowCustomerDetail] = React.useState(false);
  const [showExportDialog, setShowExportDialog] = React.useState(false);

  React.useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch form submissions to aggregate customer data by TC
      const response = await fetch('/api/admin/form-submissions?pageSize=1000');
      const data = await response.json();
      
      if (response.ok) {
        // Group submissions by TC number to create unique customers
        const customerMap = new Map<string, Customer>();
        
        (data.submissions || []).forEach((submission: any) => {
          const tc = submission.sender_tc;
          
          if (customerMap.has(tc)) {
            // Update existing customer
            const customer = customerMap.get(tc)!;
            customer.total_requests++;
            customer.total_spent += parseFloat(submission.content_value) || 0;
            customer.last_activity = submission.created_at > customer.last_activity ? 
              submission.created_at : customer.last_activity;
          } else {
            // Create new customer
            customerMap.set(tc, {
              tc: tc,
              name: submission.sender_name,
              company: '', // Will be enhanced later
              email: submission.user_email || '',
              phone: submission.sender_contact,
              country: 'Turkey', // Default, can be enhanced
              address: submission.sender_address,
              tax_id: tc,
              customer_type: submission.user_type || 'guest',
              registration_date: submission.created_at,
              last_activity: submission.created_at,
              total_requests: 1,
              total_bookings: 0, // Will be calculated separately
              total_spent: parseFloat(submission.content_value) || 0,
              tags: [],
              status: 'active'
            });
          }
        });
        
        const uniqueCustomers = Array.from(customerMap.values());
        setCustomers(uniqueCustomers);
      } else {
        setError(data.error || 'Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to connect to database');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerDetails = async (customerTc: string) => {
    try {
      // Fetch all requests for this customer by TC
      const requestsResponse = await fetch(`/api/admin/form-submissions?pageSize=1000`);
      const requestsData = await requestsResponse.json();
      
      if (requestsResponse.ok) {
        // Filter requests by customer TC
        const customerRequests = (requestsData.submissions || [])
          .filter((submission: any) => submission.sender_tc === customerTc)
          .map((submission: any) => ({
            id: submission.id,
            sender_name: submission.sender_name,
            receiver_name: submission.receiver_name,
            destination: submission.destination,
            content_value: submission.content_value,
            content_description: submission.content_description,
            status: submission.status,
            created_at: submission.created_at,
            updated_at: submission.updated_at
          }));
        
        setCustomerRequests(customerRequests);
      }
      
      // Mock bookings for now - will be replaced with real booking API later
      const mockBookings: CustomerBooking[] = [
        {
          id: '1',
          booking_number: 'BK001',
          date: new Date().toISOString(),
          route: 'Turkey → Germany',
          carrier: 'DHL',
          chargeable_weight: 2.5,
          price: 45.80,
          status: 'delivered',
          tracking_number: 'DHL123456789'
        }
      ];
      
      setCustomerBookings(mockBookings);
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
    loadCustomerDetails(customer.tc);
  };

  const handleExportData = (format: 'csv' | 'xlsx') => {
    // Implementation for exporting customer data
    console.log(`Exporting customer data as ${format}`);
    // This would generate and download the file
  };

  const handleMergeDuplicates = () => {
    // Implementation for merging duplicate customers
    console.log('Merging duplicate customers');
    // This would identify and merge customers with similar data
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.tc.includes(searchTerm) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const stats = {
    total: customers.length,
    guest: customers.filter(c => c.customer_type === 'guest').length,
    registered: customers.filter(c => c.customer_type === 'registered').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0),
    totalRequests: customers.reduce((sum, c) => sum + c.total_requests, 0),
    totalBookings: customers.reduce((sum, c) => sum + c.total_bookings, 0)
  };

  const customerColumns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'Name/Company',
      sortable: true,
      render: (value, customer) => (
        <div>
          <div className="font-medium">{value}</div>
          {customer.company && (
            <div className="text-sm text-muted-foreground">{customer.company}</div>
          )}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{value || 'N/A'}</div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{value}</div>
      )
    },
    {
      key: 'country',
      label: 'Country',
      sortable: true,
      render: (value) => (
        <div className="text-sm">{value}</div>
      )
    },
    {
      key: 'total_requests',
      label: 'Requests',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-1 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'total_bookings',
      label: 'Bookings',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <Package className="w-4 h-4 mr-1 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'total_spent',
      label: 'Total Spend',
      sortable: true,
      render: (value) => (
        <div className="font-medium">${value.toFixed(2)}</div>
      )
    },
    {
      key: 'last_activity',
      label: 'Last Activity',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.length > 0 ? value.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          )) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'tc',
      label: 'Actions',
      sortable: false,
      render: (value, customer) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewCustomer(customer)}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      )
    }
  ];

  if (showCustomerDetail && selectedCustomer) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCustomerDetail(false)}
              >
                ← Back to Customers
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{selectedCustomer.name}</h1>
                <p className="text-muted-foreground">Customer Profile & History</p>
              </div>
            </div>
          </div>

          {/* Customer Info Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customer Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={
                  selectedCustomer.customer_type === 'premium' ? 'bg-gold-500/10 text-gold-600 border-gold-500/20' :
                  selectedCustomer.customer_type === 'regular' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                  'bg-gray-500/10 text-gray-600 border-gray-500/20'
                }>
                  {selectedCustomer.customer_type}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedCustomer.total_requests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedCustomer.total_bookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${selectedCustomer.total_spent.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">{selectedCustomer.name}</span>
                </div>
                {selectedCustomer.company && (
                  <div>
                    <span className="text-muted-foreground">Company: </span>
                    <span className="font-medium">{selectedCustomer.company}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span>{selectedCustomer.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Country: </span>
                  <span>{selectedCustomer.country}</span>
                </div>
                {selectedCustomer.address && (
                  <div>
                    <span className="text-muted-foreground">Address: </span>
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax & Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-muted-foreground">TC/Tax ID: </span>
                  <span className="font-mono">{selectedCustomer.tc}</span>
                </div>
                {selectedCustomer.tax_id && selectedCustomer.tax_id !== selectedCustomer.tc && (
                  <div>
                    <span className="text-muted-foreground">Additional Tax ID: </span>
                    <span className="font-mono">{selectedCustomer.tax_id}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Customer Type: </span>
                  <Badge className={
                    selectedCustomer.customer_type === 'registered' ? 
                    'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                    'bg-gray-500/10 text-gray-600 border-gray-500/20'
                  }>
                    {selectedCustomer.customer_type}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Registration Date: </span>
                  <span>{new Date(selectedCustomer.registration_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tags: </span>
                  <div className="mt-1">
                    {selectedCustomer.tags.length > 0 ? selectedCustomer.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="mr-1">
                        {tag}
                      </Badge>
                    )) : (
                      <span className="text-sm text-muted-foreground">No tags</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Requests and Bookings */}
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
              <TabsTrigger value="requests">Requests ({customerRequests.length})</TabsTrigger>
              <TabsTrigger value="bookings">Bookings ({customerBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>All customer requests and bookings chronologically</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Combined timeline of requests and bookings */}
                    {[...customerRequests.map(req => ({
                      type: 'request',
                      id: req.id,
                      date: req.created_at,
                      title: `Request to ${req.destination}`,
                      subtitle: `${req.receiver_name} - $${req.content_value}`,
                      status: req.status,
                      description: req.content_description
                    })), ...customerBookings.map(booking => ({
                      type: 'booking',
                      id: booking.id,
                      date: booking.date,
                      title: `Booking ${booking.booking_number}`,
                      subtitle: `${booking.route} via ${booking.carrier}`,
                      status: booking.status,
                      description: `${booking.chargeable_weight}kg - $${booking.price}`
                    }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((activity, index) => (
                      <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                          {activity.type === 'request' ? (
                            <MessageSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Package className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                              <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={
                                activity.status === 'accepted' || activity.status === 'delivered' ? 
                                'bg-green-500/10 text-green-600' :
                                activity.status === 'pending' || activity.status === 'waiting' ?
                                'bg-yellow-500/10 text-yellow-600' :
                                'bg-red-500/10 text-red-600'
                              }>
                                {activity.status}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(activity.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {customerRequests.length === 0 && customerBookings.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No activity found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests</CardTitle>
                  <CardDescription>All chatbot requests from this customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customerRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge className={
                            request.type === 'pricing' ? 'bg-blue-500/10 text-blue-600' :
                            request.type === 'booking' ? 'bg-green-500/10 text-green-600' :
                            'bg-purple-500/10 text-purple-600'
                          }>
                            {request.type}
                          </Badge>
                          <div>
                            <div className="font-medium">{request.route}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(request.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{request.value ? `$${request.value}` : '-'}</div>
                          <div className="text-sm text-muted-foreground">{request.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                  <CardDescription>Booking #, date, route, carrier, chargeable weight, price, status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Booking #</th>
                          <th className="text-left p-2 font-medium">Date</th>
                          <th className="text-left p-2 font-medium">Route</th>
                          <th className="text-left p-2 font-medium">Carrier</th>
                          <th className="text-left p-2 font-medium">Weight</th>
                          <th className="text-left p-2 font-medium">Price</th>
                          <th className="text-left p-2 font-medium">Status</th>
                          <th className="text-left p-2 font-medium">Tracking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerBookings.map((booking) => (
                          <tr key={booking.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div className="font-medium">{booking.booking_number}</div>
                            </td>
                            <td className="p-2">
                              <div className="text-sm">
                                {new Date(booking.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-sm">{booking.route}</div>
                            </td>
                            <td className="p-2">
                              <div className="text-sm">{booking.carrier}</div>
                            </td>
                            <td className="p-2">
                              <div className="text-sm">{booking.chargeable_weight} kg</div>
                            </td>
                            <td className="p-2">
                              <div className="font-medium">${booking.price.toFixed(2)}</div>
                            </td>
                            <td className="p-2">
                              <Badge className={
                                booking.status === 'delivered' ? 'bg-green-500/10 text-green-600' :
                                booking.status === 'in_transit' ? 'bg-blue-500/10 text-blue-600' :
                                booking.status === 'confirmed' ? 'bg-purple-500/10 text-purple-600' :
                                booking.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                                'bg-yellow-500/10 text-yellow-600'
                              }>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="text-xs text-muted-foreground">
                                {booking.tracking_number || 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {customerBookings.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No bookings found for this customer
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Customer profiles with request history and bookings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMergeDuplicates}>
              <Merge className="mr-2 h-4 w-4" />
              Merge Duplicates
            </Button>
            <Button variant="outline" onClick={() => handleExportData('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={loadCustomers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.guest} guest, {stats.registered} registered
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                All customer requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                Completed bookings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
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
              placeholder="Search by name, company, email, phone, or TC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Database</CardTitle>
            <CardDescription>
              All customers with their profiles and activity ({filteredCustomers.length} of {customers.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading customers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">{error}</p>
                <Button onClick={loadCustomers}>
                  Try Again
                </Button>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                </p>
              </div>
            ) : (
              <DataTable
                data={filteredCustomers}
                columns={customerColumns}
                pageSize={10}
                searchPlaceholder="Search customers..."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
