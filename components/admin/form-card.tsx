'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Calendar,
  ChevronRight,
  X,
  DollarSign,
  Globe,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

interface FormCardProps {
  submission: FormSubmission;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FormCard({ submission, isExpanded, onToggle }: FormCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - hh:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Card View */}
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isExpanded && "shadow-lg border-primary"
        )}
        onClick={onToggle}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{submission.sender_name}</h3>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", statusColors[submission.status])}
                >
                  {submission.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ID: {submission.id.slice(0, 8)}...
              </p>
            </div>
            <ChevronRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{submission.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${submission.content_value}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{submission.sender_contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{formatDate(submission.created_at).split(' - ')[0]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Detail Panel */}
      {isExpanded && (
        <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-background border-l shadow-xl z-50 animate-in slide-in-from-right duration-300">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Form Submission Details</h2>
                  <p className="text-muted-foreground">ID: {submission.id}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Status and Timestamps */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    Status & Timeline
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge 
                      variant="outline" 
                      className={statusColors[submission.status]}
                    >
                      {submission.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{formatDate(submission.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">{formatDate(submission.updated_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User Type</span>
                    <Badge variant="secondary">{submission.user_type}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Sender Information */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sender Information
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="font-medium">{submission.sender_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">TC Number</label>
                    <p className="font-medium">{submission.sender_tc}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Contact</label>
                    <p className="font-medium">{submission.sender_contact}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Address</label>
                    <p className="font-medium">{submission.sender_address}</p>
                  </div>
                  {submission.user_email && (
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium">{submission.user_email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Receiver Information */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Receiver Information
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="font-medium">{submission.receiver_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Contact</label>
                    <p className="font-medium">{submission.receiver_contact}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{submission.receiver_email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Address</label>
                    <p className="font-medium">{submission.receiver_address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">City/Postal</label>
                    <p className="font-medium">{submission.city_postal}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Destination</label>
                    <p className="font-medium">{submission.destination}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Package Information */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Package Details
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Content Description</label>
                    <p className="font-medium">{submission.content_description}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Declared Value</label>
                    <p className="font-medium text-lg">${submission.content_value}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Label
                </Button>
                <Button variant="outline" className="flex-1">
                  Update Status
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
}
