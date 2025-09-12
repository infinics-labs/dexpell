'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview'
  },
  {
    title: 'Form Submissions',
    href: '/admin/forms',
    icon: FileText,
    description: 'Submitted forms'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Customer database'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export function AdminSidebar({ isCollapsed, onToggleCollapse, className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "relative flex flex-col bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <div>
              <h2 className="font-semibold text-sm">Dexpell Admin</h2>
              <p className="text-xs text-muted-foreground">Management Panel</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 px-3",
                    isCollapsed ? "px-2" : "px-3",
                    isActive && "bg-secondary/80"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-3")} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Dexpell Admin Panel v1.0
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Athlos Technology
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
