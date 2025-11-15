"use client";

import {
  BarChart3,
  Package,
  Settings,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  iconColor?: string;
  exactMatch?: boolean;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  {
    title: "Vendas",
    url: "/",
    icon: ShoppingCart,
    iconColor: "text-sky-500",
    exactMatch: true,
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Package,
    iconColor: "text-violet-500",
  },
  {
    title: "Relatórios",
    url: "/sales-report",
    icon: BarChart3,
    iconColor: "text-pink-700",
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    iconColor: "text-orange-700",
  },
];

function isRouteActive(
  pathname: string,
  itemUrl: string,
  exactMatch?: boolean
): boolean {
  if (exactMatch) {
    return pathname === itemUrl;
  }
  return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`);
}

export function MainSidebar({ items = defaultItems, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 bg-background"
      {...props}
    >
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center justify-center">
          <Image
            src="/logo-header.svg"
            alt="Mundo Gelado"
            width={350}
            height={40}
            className="block transition-all duration-200 group-data-[collapsible=icon]:hidden"
            priority
          />
          <Image
            src="/favicon.svg"
            alt="Mundo Gelado"
            width={40}
            height={40}
            className="hidden transition-all duration-200 group-data-[collapsible=icon]:block"
            priority
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const isActive = isRouteActive(pathname, item.url, item.exactMatch);

            return (
              <Link
                key={item.url}
                href={item.url}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.title}
              >
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "w-full justify-start rounded-lg px-3 py-2.5 transition-all duration-200",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3"
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-opacity",
                        item.iconColor,
                        isActive ? "opacity-100" : "opacity-80",
                        "group-data-[collapsible=icon]:mr-0",
                        "mr-3"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
