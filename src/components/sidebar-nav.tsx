"use client";

import {
  BarChart3,
  type LucideIcon,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  color?: string;
  isActive?: boolean;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  {
    title: "Vendas",
    url: "/",
    icon: ShoppingCart,
    color: "text-sky-500",
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Package,
    color: "text-violet-500",
  },
  {
    title: "Relatórios",
    url: "/sales-report",
    icon: BarChart3,
    color: "text-pink-700",
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    color: "text-orange-700",
  },
];

export function MainSidebar({ items = defaultItems, ...props }: SidebarProps) {
  const [activeItem, setActiveItem] = React.useState("/");

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
            const isActive = activeItem === item.url;
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={() => setActiveItem(item.url)}
              >
                <SidebarMenuButton
                  className={`w-full justify-start rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-pink-200/70 ${isActive ? "bg-pink-100 font-medium text-accent-foreground" : ""} group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3`}
                  tooltip={item.title}
                >
                  {item.icon && (
                    <item.icon
                      className={`mr-3 h-5 w-5 ${item.color} ${isActive ? "opacity-100" : "opacity-80"} group-data-[collapsible=icon]:mr-0`}
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