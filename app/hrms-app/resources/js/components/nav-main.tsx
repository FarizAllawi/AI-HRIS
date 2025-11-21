// nav-main.tsx
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup className="py-0">


      <SidebarMenu className="space-y-1.5">
        {items.map((item) => {
          const isActive = page.url.startsWith(
            typeof item.href === 'string' ? item.href : item.href.url,
          );

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: item.title }}
                className={`
                  group relative transition-all duration-200 border
                  ${isCollapsed
                  ? 'mx-1 rounded-lg justify-center px-3'
                  : 'mx-2 rounded-xl px-4'
                }
                  ${isActive
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg border-transparent`
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                }
                  hover:scale-[1.02] active:scale-[0.98] hover:shadow-md
                `}
              >
                <Link href={item.href} prefetch className={`py-3 ${isCollapsed ? 'justify-center' : ''}`}>
                  <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'text-white' : item.color}`}>
                    {item.icon && <item.icon className="h-5 w-5" />}
                  </div>

                  {!isCollapsed && (
                    <>
                      <span className="font-semibold tracking-wide text-sm">{item.title}</span>

                      {/* Active indicator for expanded state */}
                      {isActive && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-1.5 w-1.5 rounded-full bg-white/90 shadow-sm"></div>
                        </div>
                      )}
                    </>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
