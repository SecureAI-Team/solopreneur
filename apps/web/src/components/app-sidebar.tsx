"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Send,
  BarChart3,
  Settings,
  Sparkles,
  MessageSquare,
  Users,
  Zap,
  FolderOpen,
  LogOut,
  User,
  Search
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

const mainNavItems = [
  {
    title: "总览",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "内容工作台",
    icon: FileText,
    href: "/content",
  },
  {
    title: "素材库",
    icon: FolderOpen,
    href: "/media",
  },
  {
    title: "发布中心",
    icon: Send,
    href: "/publish",
  },
  {
    title: "市场调研",
    icon: Search,
    href: "/research",
  },
  {
    title: "数据分析",
    icon: BarChart3,
    href: "/analytics",
  },
]

const toolsNavItems = [
  {
    title: "AI助手",
    icon: Sparkles,
    href: "/ai-assistant",
  },
  {
    title: "互动管理",
    icon: MessageSquare,
    href: "/inbox",
  },
  {
    title: "粉丝画像",
    icon: Users,
    href: "/audience",
  },
  {
    title: "自动化",
    icon: Zap,
    href: "/automation",
  },
]

export function AppSidebar() {
  const router = useRouter();
  const [user, setUser] = React.useState<{ name: string; avatar?: string; email?: string } | null>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback default
        setUser({ name: '创作者', email: 'creator@solomedia.com' });
      }
    } catch (e) {
      console.error('Failed to parse user data', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold">
                  S
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">SoloMedia</span>
                  <span className="text-xs text-muted-foreground">运营中心</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>主导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>工具</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatar || "/avatar.png"} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="font-medium truncate max-w-[150px]">{user?.name || 'Loading...'}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email || '免费版'}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56"
              >
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatar || "/avatar.png"} />
                    <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2 size-4" />
                    个人资料
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    设置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Zap className="mr-2 size-4 text-amber-500" />
                  升级到专业版
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                  <LogOut className="mr-2 size-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
