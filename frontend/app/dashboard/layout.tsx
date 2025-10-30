'use client';

import { Sidebar } from "@/components/shared/layout/Sidebar";
import { Header } from "@/components/shared/layout/Header";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useRequireAuth('/signin');

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="text-sm text-muted font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, useRequireAuth will redirect, but show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - render dashboard layout
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
