// nav-user.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, Shield } from 'lucide-react';

export function NavUser() {
  const { auth } = usePage<SharedData>().props;
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group  rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-sidebar-accent-foreground data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              data-test="sidebar-menu-button"
            >
              <UserInfo user={auth.user} />

              {/* Admin Badge */}
              {auth.user.role === 'admin' && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </div>
              )}

              <ChevronsUpDown className="ml-auto size-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 group-hover:scale-110 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/95 p-2 shadow-xl"
            side={
              isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'
            }
            sideOffset={8}
          >
            <UserMenuContent user={auth.user} />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
