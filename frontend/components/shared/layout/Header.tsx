"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

export function Header() {
  const { user, logout } = useAuth();

  // Get user initials for avatar (first letter of name)
  const userInitials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : 'U';

  const displayName = user?.name || 'PattPay User';
  const displayEmail = user?.email || 'user@pattpay.com';

  const handleLogout = () => {
    toast.success('Signed out successfully', {
      description: 'You have been logged out of your account.',
    });
    logout();
  };
  return (
    <header className="h-16 w-full border-b border-border bg-surface dark:bg-black shrink-0">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 h-9 font-mono text-sm"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <span className="font-sans font-semibold text-sm">Notifications</span>
                <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-brand">
                  Mark all read
                </Button>
              </div>
              <DropdownMenuSeparator />
              <div className="p-4 text-center text-sm text-muted">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-brand-300 text-surface text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-sans text-sm font-medium">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex flex-col p-2">
                <span className="font-sans font-medium text-sm">{displayName}</span>
                <span className="text-xs text-muted">{displayEmail}</span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
