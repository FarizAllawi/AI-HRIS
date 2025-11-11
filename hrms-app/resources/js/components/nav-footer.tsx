// nav-footer.tsx
import { Icon } from '@/components/icon';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
                            items,
                            className,
                            ...props
                          }: ComponentPropsWithoutRef<typeof SidebarGroup> & {
  items: NavItem[];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup
      {...props}
      className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
    >
      <SidebarGroupContent>
        <SidebarMenu className={isCollapsed ? 'space-y-1' : 'space-y-1'}>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`
                  group transition-all duration-200 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200
                  hover:bg-white/60 dark:hover:bg-slate-800/60 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60
                  ${isCollapsed
                  ? 'rounded-lg justify-center px-3'
                  : 'rounded-lg px-3'
                }
                `}
              >
                <a
                  href={
                    typeof item.href === 'string' ? item.href : item.href.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isCollapsed ? 'py-3 justify-center' : 'py-2.5'}`}
                >
                  <Icon
                    iconNode={item.icon}
                    className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                  />

                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium">{item.title}</span>
                      <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
