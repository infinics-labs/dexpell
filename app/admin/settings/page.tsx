'use client';

import * as React from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Users, 
  Globe,
  Bell,
  Plug, 
  Shield,
  Save,
  Upload,
  RefreshCw,
  Check,
  Key,
  FileText
} from 'lucide-react';

interface OrganizationSettings {
  companyName: string;
  logo: string;
  contactEmail: string;
  address: string;
  phone: string;
  website: string;
}

interface UserRole {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Expert';
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface NotificationSettings {
  formSent: boolean;
  reminder: boolean;
  booked: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  auditLogEnabled: boolean;
  kvkkCompliance: boolean;
}


export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('organization');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');

  // Organization Settings
  const [orgSettings, setOrgSettings] = React.useState<OrganizationSettings>({
    companyName: 'Dexpell Logistics',
    logo: '/images/dexpell-logo.jpg',
    contactEmail: 'info@dexpell.com',
    address: 'Istanbul, Turkey',
    phone: '+90 555 123 4567',
    website: 'https://dexpell.com'
  });

  // Users & Roles
  const [users, setUsers] = React.useState<UserRole[]>([
    {
      id: '1',
      name: 'System Owner',
      email: 'owner@dexpell.com',
      role: 'Owner',
      status: 'active',
      lastLogin: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Admin User',
      email: 'admin@dexpell.com',
      role: 'Admin',
      status: 'active',
      lastLogin: new Date().toISOString()
    }
  ]);

  // Localization
  const [language, setLanguage] = React.useState('EN');
  const [timezone, setTimezone] = React.useState('Europe/Istanbul');

  // Notifications
  const [notifications, setNotifications] = React.useState<NotificationSettings>({
    formSent: true,
    reminder: true,
    booked: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  // Security
  const [security, setSecurity] = React.useState<SecuritySettings>({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    sessionTimeout: 60,
    twoFactorEnabled: false,
    auditLogEnabled: true,
    kvkkCompliance: true
  });


  const handleSave = async (section: string) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveMessage(`${section} settings saved successfully!`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Admin':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Expert':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your system configuration and preferences
            </p>
          </div>
          {saveMessage && (
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">{saveMessage}</span>
            </div>
          )}
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="organization" className="flex items-center space-x-1">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="localization" className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Localization</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-1">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-1">
              <Plug className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Settings */}
          <TabsContent value="organization">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Organization Settings</span>
              </CardTitle>
              <CardDescription>
                  Manage your company information, logo, and contact details
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo */}
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 border rounded-lg overflow-hidden">
                      <Image
                        src={orgSettings.logo}
                        alt="Company Logo"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Logo
                    </Button>
                  </div>
                </div>

                {/* Company Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                      value={orgSettings.companyName}
                      onChange={(e) => setOrgSettings({ ...orgSettings, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                      id="contactEmail"
                    type="email"
                      value={orgSettings.contactEmail}
                      onChange={(e) => setOrgSettings({ ...orgSettings, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={orgSettings.phone}
                      onChange={(e) => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={orgSettings.website}
                      onChange={(e) => setOrgSettings({ ...orgSettings, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    value={orgSettings.address}
                    onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                  rows={3}
                />
              </div>

                <Button onClick={() => handleSave('Organization')} disabled={isSaving}>
                  {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Organization Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users & Roles */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Users & Roles</span>
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions (Owner, Admin, Expert)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Users List */}
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                        <Button variant="outline" size="sm">
                          <Key className="w-4 h-4 mr-1" />
                          Reset Password
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={() => handleSave('Users & Roles')} disabled={isSaving}>
                  {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save User Settings
                </Button>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Localization */}
          <TabsContent value="localization">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Localization</span>
              </CardTitle>
              <CardDescription>
                  Configure language and timezone settings
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Language</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="EN">English</option>
                      <option value="TR">Türkçe</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>Timezone</Label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="Europe/London">Europe/London (GMT+0/+1)</option>
                      <option value="America/New_York">America/New_York (GMT-5/-4)</option>
                    </select>
                  </div>
                </div>

                <Button onClick={() => handleSave('Localization')} disabled={isSaving}>
                  {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Localization Settings
                </Button>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                  Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium">Event Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Form Sent</div>
                        <div className="text-sm text-muted-foreground">When a new form is submitted</div>
                      </div>
                      <Switch
                        checked={notifications.formSent}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, formSent: checked })}
                      />
                    </div>
              <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Reminder</div>
                        <div className="text-sm text-muted-foreground">Reminder notifications for pending actions</div>
                </div>
                <Switch
                        checked={notifications.reminder}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, reminder: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Booked</div>
                        <div className="text-sm text-muted-foreground">When a booking is confirmed</div>
                      </div>
                      <Switch
                        checked={notifications.booked}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, booked: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">SMS Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications via SMS</div>
                      </div>
                      <Switch
                        checked={notifications.smsNotifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-muted-foreground">Browser push notifications</div>
                </div>
                <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                />
              </div>
                  </div>
                </div>

                <Button onClick={() => handleSave('Notifications')} disabled={isSaving}>
                  {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Notification Settings
                </Button>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plug className="w-5 h-5" />
                  <span>Integrations</span>
              </CardTitle>
              <CardDescription>
                  Connect with external services and platforms
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
                {/* WhatsApp Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">W</span>
                    </div>
                    <div>
                      <div className="font-medium">WhatsApp Business</div>
                      <div className="text-sm text-muted-foreground">Send notifications and updates via WhatsApp</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Not Connected</Badge>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>

                {/* Email Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">@</span>
                    </div>
                    <div>
                      <div className="font-medium">Email Service</div>
                      <div className="text-sm text-muted-foreground">SMTP configuration for email notifications</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500/10 text-green-600">Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>

                {/* SMS Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">S</span>
                    </div>
                    <div>
                      <div className="font-medium">SMS Gateway</div>
                      <div className="text-sm text-muted-foreground">Send SMS notifications to customers</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Not Connected</Badge>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>

                <Button onClick={() => handleSave('Integrations')} disabled={isSaving}>
                  {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Integration Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure security policies, audit logs, and KVKK compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Policy */}
                <div className="space-y-4">
                  <h4 className="font-medium">Password Policy</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="passwordLength">Minimum Password Length</Label>
                      <Input
                        id="passwordLength"
                        type="number"
                        value={security.passwordMinLength}
                        onChange={(e) => setSecurity({ ...security, passwordMinLength: parseInt(e.target.value) })}
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Require Uppercase Letters</div>
                        <div className="text-sm text-muted-foreground">At least one uppercase letter (A-Z)</div>
                      </div>
                      <Switch
                        checked={security.passwordRequireUppercase}
                        onCheckedChange={(checked) => setSecurity({ ...security, passwordRequireUppercase: checked })}
                      />
                    </div>
              <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Require Numbers</div>
                        <div className="text-sm text-muted-foreground">At least one number (0-9)</div>
                </div>
                <Switch
                        checked={security.passwordRequireNumbers}
                        onCheckedChange={(checked) => setSecurity({ ...security, passwordRequireNumbers: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Require Symbols</div>
                        <div className="text-sm text-muted-foreground">At least one special character</div>
                </div>
                <Switch
                        checked={security.passwordRequireSymbols}
                        onCheckedChange={(checked) => setSecurity({ ...security, passwordRequireSymbols: checked })}
                />
              </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="space-y-4">
                  <h4 className="font-medium">Security Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">Require 2FA for all admin users</div>
                      </div>
                      <Switch
                        checked={security.twoFactorEnabled}
                        onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Audit Log</div>
                        <div className="text-sm text-muted-foreground">Log all user actions and system events</div>
                      </div>
                      <Switch
                        checked={security.auditLogEnabled}
                        onCheckedChange={(checked) => setSecurity({ ...security, auditLogEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">KVKK Compliance</div>
                        <div className="text-sm text-muted-foreground">Turkish data protection law compliance</div>
                </div>
                <Switch
                        checked={security.kvkkCompliance}
                        onCheckedChange={(checked) => setSecurity({ ...security, kvkkCompliance: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button onClick={() => handleSave('Security')} disabled={isSaving}>
                    {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Security Settings
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Audit Log
                  </Button>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AdminLayout>
  );
}