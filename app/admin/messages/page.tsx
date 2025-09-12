'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  MessageSquare, 
  Reply,
  MoreHorizontal,
  Eye,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

interface Message {
  id: string;
  customer: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: 'support' | 'complaint' | 'inquiry' | 'feedback';
  date: string;
  lastReply?: string;
}

const mockMessages: Message[] = [
  {
    id: 'MSG-001',
    customer: 'John Doe',
    customerEmail: 'john.doe@example.com',
    subject: 'Delayed shipment to Germany',
    message: 'My order #ORD-001 was supposed to arrive yesterday but it hasn\'t been delivered yet. Can you please check the status?',
    status: 'new',
    priority: 'high',
    category: 'complaint',
    date: '2024-01-15 14:30'
  },
  {
    id: 'MSG-002',
    customer: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    subject: 'Question about pricing to USA',
    message: 'I need to ship 15kg to New York. What would be the total cost including all fees?',
    status: 'replied',
    priority: 'medium',
    category: 'inquiry',
    date: '2024-01-15 10:15',
    lastReply: '2024-01-15 11:00'
  },
  {
    id: 'MSG-003',
    customer: 'Ahmed Hassan',
    customerEmail: 'ahmed.hassan@example.com',
    subject: 'Excellent service!',
    message: 'I wanted to thank you for the excellent service. My package arrived on time and in perfect condition.',
    status: 'closed',
    priority: 'low',
    category: 'feedback',
    date: '2024-01-14 16:45',
    lastReply: '2024-01-14 17:00'
  },
  {
    id: 'MSG-004',
    customer: 'Maria Garcia',
    customerEmail: 'maria.garcia@example.com',
    subject: 'Damaged package received',
    message: 'The package I received was damaged during shipping. The box was crushed and some items inside were broken.',
    status: 'new',
    priority: 'high',
    category: 'complaint',
    date: '2024-01-14 09:20'
  },
  {
    id: 'MSG-005',
    customer: 'Robert Johnson',
    customerEmail: 'robert.johnson@example.com',
    subject: 'How to track my shipment?',
    message: 'I just placed an order but I can\'t find the tracking information. Could you please help me?',
    status: 'replied',
    priority: 'medium',
    category: 'support',
    date: '2024-01-13 13:10',
    lastReply: '2024-01-13 14:30'
  }
];

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [replyText, setReplyText] = React.useState('');

  const messageColumns: Column<Message>[] = [
    {
      key: 'id',
      label: 'Message ID',
      sortable: true,
      render: (value) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value, message) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{message.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (value, message) => (
        <div>
          <div className="font-medium truncate max-w-[200px]">{value}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {message.message}
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => {
        const categoryColors = {
          support: 'bg-blue-100 text-blue-800',
          complaint: 'bg-red-100 text-red-800',
          inquiry: 'bg-yellow-100 text-yellow-800',
          feedback: 'bg-green-100 text-green-800'
        };
        return (
          <Badge className={categoryColors[value as keyof typeof categoryColors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => {
        const priorityColors = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={priorityColors[value as keyof typeof priorityColors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          new: { color: 'bg-blue-100 text-blue-800', icon: Clock },
          replied: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          closed: { color: 'bg-gray-100 text-gray-800', icon: Archive }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config.icon;
        
        return (
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const handleMessageAction = (message: Message) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setSelectedMessage(message)}>
          <Eye className="mr-2 h-4 w-4" />
          View & Reply
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleSendReply = () => {
    // Handle send reply logic
    console.log('Reply sent:', replyText);
    setReplyText('');
    setSelectedMessage(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Manage customer support messages and inquiries
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                All time messages
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Urgent messages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Messages</CardTitle>
            <CardDescription>
              View and respond to customer support messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockMessages}
              columns={messageColumns}
              actions={handleMessageAction}
              searchPlaceholder="Search messages by customer, subject, or content..."
            />
          </CardContent>
        </Card>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>{selectedMessage?.subject}</span>
              </DialogTitle>
              <DialogDescription>
                From: {selectedMessage?.customer} ({selectedMessage?.customerEmail})
              </DialogDescription>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-4">
                {/* Message Details */}
                <div className="flex items-center space-x-4 text-sm">
                  <Badge className={
                    selectedMessage.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedMessage.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedMessage.priority} priority
                  </Badge>
                  <Badge className={
                    selectedMessage.category === 'complaint' ? 'bg-red-100 text-red-800' :
                    selectedMessage.category === 'support' ? 'bg-blue-100 text-blue-800' :
                    selectedMessage.category === 'inquiry' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {selectedMessage.category}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(selectedMessage.date).toLocaleString()}
                  </span>
                </div>

                {/* Original Message */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{selectedMessage.message}</p>
                </div>

                {/* Reply Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Reply</label>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
              <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                <Reply className="mr-2 h-4 w-4" />
                Send Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
