'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Package, 
  User, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  FileText,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { OrderService } from '@/lib/services/orders';
import { Database } from '@/lib/database.types';

type Order = Database['public']['Tables']['form_submissions']['Row'];

// Mock data - we'll replace this with real Supabase data
const mockOrders: Order[] = [
  {
    id: "8f964ee3-747f-440a-a901-4d3376289b23",
    sender_name: "Test Sender",
    sender_tc: "12345678901",
    sender_address: "Test Address, Istanbul, Turkey",
    sender_contact: "+90 555 123 4567",
    receiver_name: "Test Receiver",
    receiver_address: "Test Receiver Address",
    city_postal: "New York 10001",
    destination: "United States",
    receiver_contact: "+1 555 987 6543",
    receiver_email: "test@example.com",
    content_description: "Test Package Contents",
    content_value: "100",
    user_type: "guest",
    user_email: null,
    user_id: null,
    status: "pending",
    created_at: "2025-08-27T12:19:41.088636+00:00",
    updated_at: "2025-09-01T09:44:47.074838+00:00"
  },
  {
    id: "7ed3b48d-e952-42f5-8f7f-38dce37002ca",
    sender_name: "Test No RLS",
    sender_tc: "11111111111",
    sender_address: "Test No RLS Address, Istanbul, Turkey",
    sender_contact: "+90 555 111 2222",
    receiver_name: "Test No RLS Receiver",
    receiver_address: "Test No RLS Receiver Address",
    city_postal: "Test City 12345",
    destination: "Test Country",
    receiver_contact: "+1 555 333 4444",
    receiver_email: "test-no-rls@example.com",
    content_description: "Test No RLS Package Contents",
    content_value: "150",
    user_type: "guest",
    user_email: null,
    user_id: null,
    status: "pending",
    created_at: "2025-08-27T12:44:59.549099+00:00",
    updated_at: "2025-09-01T09:44:47.074838+00:00"
  },
  {
    id: "f4cb4097-b07b-4cf9-baf9-bcfecac85080",
    sender_name: "Test With RLS",
    sender_tc: "22222222222",
    sender_address: "Test With RLS Address, Istanbul, Turkey",
    sender_contact: "+90 555 777 8888",
    receiver_name: "Test With RLS Receiver",
    receiver_address: "Test With RLS Receiver Address",
    city_postal: "Test City 54321",
    destination: "Test Country",
    receiver_contact: "+1 555 999 0000",
    receiver_email: "test-with-rls@example.com",
    content_description: "Test With RLS Package Contents",
    content_value: "250",
    user_type: "guest",
    user_email: null,
    user_id: null,
    status: "pending",
    created_at: "2025-08-27T12:44:59.549099+00:00",
    updated_at: "2025-09-01T09:44:47.074838+00:00"
  },
  {
    id: "125968c7-16a7-4a84-8a8f-5a439026c9fa",
    sender_name: "özgür göksu",
    sender_tc: "123123",
    sender_address: "a",
    sender_contact: "5312311853",
    receiver_name: "hikmet",
    receiver_address: "a",
    city_postal: "göksu",
    destination: "ispanya",
    receiver_contact: "5312311853",
    receiver_email: "hikmetgoksu@gmail.com",
    content_description: "markasız tekstil",
    content_value: "210",
    user_type: "guest",
    user_email: null,
    user_id: null,
    status: "pending",
    created_at: "2025-08-27T12:49:11.413011+00:00",
    updated_at: "2025-09-01T09:44:47.074838+00:00"
  },
  {
    id: "a004cdb3-c8b3-4f32-adc3-aadc4c7e2e22",
    sender_name: "Test özgür",
    sender_tc: "321321",
    sender_address: "istanbul-test",
    sender_contact: "5312311853",
    receiver_name: "Test hikmet",
    receiver_address: "ispanya",
    city_postal: "06300",
    destination: "ispanya",
    receiver_contact: "5312311853",
    receiver_email: "hikmetgoksu@gmail.com",
    content_description: "markasız tekstil",
    content_value: "100",
    user_type: "guest",
    user_email: null,
    user_id: null,
    status: "pending",
    created_at: "2025-08-27T12:58:14.214347+00:00",
    updated_at: "2025-09-01T09:44:47.074838+00:00"
  }
];

export default function ShippingOrdersPage() {
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [users, setUsers] = React.useState<any[]>([]);
  const [isUsingMockData, setIsUsingMockData] = React.useState(false);

  // Load orders and users on component mount
  React.useEffect(() => {
    loadOrders();
    loadUsers();
  }, [searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        pageSize: '100' // Load more orders for better UX
      });
      
      const response = await fetch(`/api/admin/shipping-orders?${params}`);
      const data = await response.json();
      
      if (response.ok && data.orders) {
        console.log('✅ Loaded real orders:', data.orders.length);
        setOrders(data.orders);
        setIsUsingMockData(false);
      } else {
        console.error('Failed to load orders:', data.error);
        console.warn('API failed, falling back to mock data');
        // Fallback to mock data if API fails
        setOrders(mockOrders);
        setIsUsingMockData(true);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      console.warn('Network error, falling back to mock data');
      setOrders(mockOrders);
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users-summary');
      const data = await response.json();
      
      if (response.ok && data.users) {
        console.log('✅ Loaded real users:', data.users.length);
        setUsers(data.users);
      } else {
        console.error('Failed to load users:', data.error);
        // No fallback data available
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  // Filter orders based on search and status
  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sender_tc.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Use users from API, fallback to calculated from orders
  const uniqueUsers = React.useMemo(() => {
    if (users.length > 0) {
      return users;
    }
    
    // Fallback: calculate from orders if API data not available
    const userMap = new Map();
    orders.forEach(order => {
      const key = order.sender_tc;
      if (!userMap.has(key)) {
        userMap.set(key, {
          tc: order.sender_tc,
          name: order.sender_name,
          contact: order.sender_contact,
          email: order.user_email,
          orderCount: orders.filter(o => o.sender_tc === order.sender_tc).length,
          totalValue: orders.filter(o => o.sender_tc === order.sender_tc)
            .reduce((sum, o) => sum + parseFloat(o.content_value), 0)
        });
      }
    });
    return Array.from(userMap.values());
  }, [orders, users]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      setIsLoading(true);
      
      // Call API to update status
      const response = await fetch('/api/admin/shipping-orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      
      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        ));
        
        // Update selected order if it's the one being updated
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        const error = await response.json();
        console.error('Failed to update order status:', error);
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'declined': return XCircle;
      case 'processing': return RefreshCw;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Sidebar - User List */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg flex items-center">
              <User className="mr-2 h-5 w-5" />
              Users ({uniqueUsers.length})
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click on a user to filter orders
            </p>
          </div>
          
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {uniqueUsers.map((user) => (
                <Card 
                  key={user.tc}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSearchTerm(user.tc)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{user.name}</CardTitle>
                    <CardDescription className="text-xs">
                      TC: {user.tc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <Phone className="mr-1 h-3 w-3" />
                        {user.contact}
                      </div>
                      {user.email && (
                        <div className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.email}
                        </div>
                      )}
                      <div className="flex justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {user.orderCount || user.orders} orders
                        </Badge>
                        <span className="text-xs font-medium">
                          ${user.totalValue.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header with Search and Filters */}
          <div className="p-6 border-b bg-background">
            {/* Mock Data Warning */}
            {isUsingMockData && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Using Demo Data</h4>
                    <p className="text-sm text-yellow-700">
                      Database not connected. Showing sample data. 
                      <Link href="/admin/debug" className="underline ml-1">
                        Configure Supabase
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Shipping Orders</h1>
                <p className="text-muted-foreground">
                  Manage form submissions and shipping requests
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {filteredOrders.length} orders
                </Badge>
                {isUsingMockData && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Demo Data
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, TC, destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter === 'all' ? 'All' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>
                    Accepted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('declined')}>
                    Declined
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
                    Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('shipped')}>
                    Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('delivered')}>
                    Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Orders Grid */}
          <ScrollArea className="flex-1 p-6">
            {/* Debug Info - Always Visible */}
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
              <h3 className="font-bold text-red-800">🔍 DEBUG PANEL - ALWAYS VISIBLE</h3>
              <p className="text-sm">• Total orders: {orders.length}</p>
              <p className="text-sm">• Filtered orders: {filteredOrders.length}</p>
              <p className="text-sm">• Status filter: "{statusFilter}"</p>
              <p className="text-sm">• Search term: "{searchTerm}"</p>
              <p className="text-sm">• Is loading: {isLoading ? 'Yes' : 'No'}</p>
              <p className="text-sm">• Using mock data: {isUsingMockData ? 'Yes' : 'No'}</p>
              {orders.length > 0 && (
                <p className="text-sm">• Available statuses: {Array.from(new Set(orders.map(o => o.status))).join(', ')}</p>
              )}
              <p className="text-sm">• Orders data sample: {orders.length > 0 ? JSON.stringify(orders[0]?.sender_name) : 'No data'}</p>
            </div>
            
            {/* Simple Test Card - Always Visible */}
            <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
              <h3 className="font-bold text-green-800">✅ TEST CARD - ALWAYS SHOWS</h3>
              <p>If you can see this, the page is rendering correctly.</p>
              <p>Cards should appear below this message.</p>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-lg font-medium text-muted-foreground mb-2">No orders found</p>
                  <p className="text-sm text-muted-foreground">
                    {orders.length === 0 
                      ? "No orders available in the database" 
                      : `${orders.length} total orders, but none match current filters`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* SIMPLE CARDS TEST */}
                <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
                  <h3 className="font-bold text-yellow-800">🧪 CARDS SECTION REACHED</h3>
                  <p>We made it to the cards rendering section!</p>
                  <p>Orders count: {orders.length}, Filtered: {filteredOrders.length}</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* 🎯 DEMO CARD - This shows how cards should look */}
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-blue-700">
                        📋 DEMO EXAMPLE
                      </CardTitle>
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-xs text-muted-foreground">
                          #demo-123
                        </CardDescription>
                        <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          demo
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        Turkey → Spain
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        To: Demo Customer
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        Demo package contents
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          $150
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        Today
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 📊 REAL DATA CARDS */}
                {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <Card 
                    key={order.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base truncate">
                          {order.sender_name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')}>
                              <Edit className="mr-2 h-4 w-4" />
                              Set Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'shipped')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-xs text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </CardDescription>
                        <Badge className={getStatusColor(order.status)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          Turkey → {order.destination}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          To: {order.receiver_name}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          {order.content_description}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            ${order.content_value}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
              </>
            )}

            {!isLoading && filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No shipping orders have been submitted yet'
                  }
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Order Details Modal/Sidebar would go here */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Order Details
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sender Information */}
              <div>
                <h4 className="font-semibold mb-3">Sender Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedOrder.sender_name}</div>
                  <div><strong>TC:</strong> {selectedOrder.sender_tc}</div>
                  <div><strong>Address:</strong> {selectedOrder.sender_address}</div>
                  <div><strong>Contact:</strong> {selectedOrder.sender_contact}</div>
                </div>
              </div>

              {/* Receiver Information */}
              <div>
                <h4 className="font-semibold mb-3">Receiver Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedOrder.receiver_name}</div>
                  <div><strong>Address:</strong> {selectedOrder.receiver_address}</div>
                  <div><strong>City/Postal:</strong> {selectedOrder.city_postal}</div>
                  <div><strong>Destination:</strong> {selectedOrder.destination}</div>
                  <div><strong>Contact:</strong> {selectedOrder.receiver_contact}</div>
                  <div><strong>Email:</strong> {selectedOrder.receiver_email}</div>
                </div>
              </div>

              {/* Package Information */}
              <div>
                <h4 className="font-semibold mb-3">Package Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Content:</strong> {selectedOrder.content_description}</div>
                  <div><strong>Value:</strong> ${selectedOrder.content_value}</div>
                  <div><strong>Status:</strong> 
                    <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h4 className="font-semibold mb-3">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Order ID:</strong> {selectedOrder.id}</div>
                  <div><strong>User Type:</strong> {selectedOrder.user_type}</div>
                  <div><strong>Created:</strong> {formatDate(selectedOrder.created_at)}</div>
                  <div><strong>Updated:</strong> {formatDate(selectedOrder.updated_at)}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                  disabled={selectedOrder.status !== 'pending'}
                  className="flex-1"
                >
                  Start Processing
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                  disabled={selectedOrder.status === 'pending'}
                  variant="outline"
                  className="flex-1"
                >
                  Mark as Shipped
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
