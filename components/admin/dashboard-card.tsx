'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description?: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardCard({
  title,
  description,
  value,
  change,
  icon: Icon,
  className,
  children
}: DashboardCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || change) && (
          <div className="flex items-center justify-between mt-1">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {change && (
              <p className={cn(
                "text-xs font-medium",
                change.type === 'increase' && "text-green-600",
                change.type === 'decrease' && "text-red-600",
                change.type === 'neutral' && "text-muted-foreground"
              )}>
                {change.type === 'increase' && '+'}
                {change.type === 'decrease' && '-'}
                {change.value}
              </p>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
