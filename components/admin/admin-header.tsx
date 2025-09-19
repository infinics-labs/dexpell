'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  showMenuToggle?: boolean;
}

export function AdminHeader({ onMenuToggle, showMenuToggle = false }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left side - Logo and mobile menu toggle */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          {showMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/images/dexpell-logo.jpg"
                alt="Dexpell Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <h2 className="font-semibold text-sm">Dexpell</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Right side - Search and theme toggle */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative w-64 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders, users, settings..."
              className="pl-8 w-full"
            />
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
