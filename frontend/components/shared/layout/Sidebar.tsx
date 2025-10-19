"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  History,
  Bell,
  HelpCircle,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar h-full w-[200px] shrink-0 border-r border-border">
      <div className="relative z-40 flex text-muted h-full shrink-0 flex-col bg-surface dark:bg-black">
        <div className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            {/* Logo */}
            <div className="flex h-16 w-full shrink-0 items-center border-b border-border px-4">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/text-logo.png"
                  alt="PattPay"
                  width={120}
                  height={32}
                  className="pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand/10 hover:text-brand",
                        pathname?.includes("dashboard") &&
                          "bg-brand/10 text-brand"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <p className="text-sm font-medium font-sans">
                        Dashboard
                      </p>
                    </Link>

                    <Link
                      href="/subscriptions"
                      className={cn(
                        "flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand/10 hover:text-brand",
                        pathname?.includes("subscriptions") &&
                          "bg-brand/10 text-brand"
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      <p className="text-sm font-medium font-sans">
                        Subscriptions
                      </p>
                    </Link>

                    <Link
                      href="/payments"
                      className={cn(
                        "flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand/10 hover:text-brand",
                        pathname?.includes("payments") &&
                          "bg-brand/10 text-brand"
                      )}
                    >
                      <Wallet className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium font-sans">
                          Payments
                        </p>
                        <Badge
                          className={cn(
                            "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-accent/20 px-1.5 text-accent dark:bg-accent/30"
                          )}
                          variant="outline"
                        >
                          NEW
                        </Badge>
                      </div>
                    </Link>

                    <Link
                      href="/history"
                      className={cn(
                        "flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand/10 hover:text-brand",
                        pathname?.includes("history") &&
                          "bg-brand/10 text-brand"
                      )}
                    >
                      <History className="h-4 w-4" />
                      <p className="text-sm font-medium font-sans">
                        History
                      </p>
                    </Link>

                    <Link
                      href="/links"
                      className={cn(
                        "flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand/10 hover:text-brand",
                        pathname?.includes("links") &&
                          "bg-brand/10 text-brand"
                      )}
                    >
                      <Link2 className="h-4 w-4" />
                      <p className="text-sm font-medium font-sans">
                        Links
                      </p>
                    </Link>

                    <Separator className="w-full my-2" />

                    <Link
                      href="/notifications"
                      className={cn(
                        "flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand/10 hover:text-brand",
                        pathname?.includes("notifications") &&
                          "bg-brand/10 text-brand"
                      )}
                    >
                      <Bell className="h-4 w-4" />
                      <p className="text-sm font-medium font-sans">
                        Notifications
                      </p>
                    </Link>

                    <Link
                      href="/help"
                      className={cn(
                        "flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-brand/10 hover:text-brand",
                        pathname?.includes("help") && "bg-brand/10 text-brand"
                      )}
                    >
                      <HelpCircle className="h-4 w-4" />
                      <p className="text-sm font-medium font-sans">
                        Help
                      </p>
                    </Link>
                  </div>
                </ScrollArea>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
