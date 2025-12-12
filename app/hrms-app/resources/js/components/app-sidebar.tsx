// app-sidebar.tsx
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as applicant } from '@/routes/applicant';
import { index as employee } from '@/routes/employee';
import { index as interviewSchedule } from '@/routes/interview-schedule';
import { index as jobPosting } from '@/routes/job-posting';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
  BookOpen,
  CalendarClock,
  FileUser,
  Folder,
  IdCardLanyard,
  LayoutGrid,
  SquareLibrary,
  Users,
  Briefcase,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
  // {
  //   title: 'Dashboard',
  //   href: dashboard(),
  //   icon: LayoutGrid,
  //   color: 'text-blue-600',
  //   gradient: 'from-blue-600 to-blue-700',
  // },
  {
    title: 'Job Posting',
    href: jobPosting(),
    icon: Briefcase,
    color: 'text-emerald-600',
    gradient: 'from-emerald-600 to-emerald-700',
  },
  {
    title: 'Applicant',
    href: applicant(),
    icon: Users,
    color: 'text-purple-600',
    gradient: 'from-purple-600 to-purple-700',
  },
  {
    title: 'Interview Schedule',
    href: interviewSchedule(),
    icon: CalendarClock,
    color: 'text-orange-600',
    gradient: 'from-orange-600 to-orange-700',
  },
  {
    title: 'Employee',
    href: employee(),
    icon: IdCardLanyard,
    color: 'text-rose-600',
    gradient: 'from-rose-600 to-rose-700',
  },
];

const footerNavItems: NavItem[] = [
  {
    title: 'Repository',
    href: 'https://github.com/FarizAllawi/AI-HRIS',
    icon: Folder,
    color: 'text-slate-500',
  },
  {
    title: 'Documentation',
    href: 'https://laravel.com/docs/starter-kits#react',
    icon: BookOpen,
    color: 'text-slate-500',
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      // className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/30 transition-all duration-300"
    >
      <SidebarHeader className={`px-4 pt-6 pb-2 ${isCollapsed ? 'px-3 pt-2' : ''}`}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group hover:bg-transparent dark:hover:bg-transparent transition-all duration-300"
            >
              <Link href={dashboard()} prefetch className={isCollapsed ? 'px-1 justify-center' : 'px-2'}>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className={`${isCollapsed ? 'px-0' : 'px-3'} mt-4`}>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter className={`${isCollapsed ? 'px-2' : 'px-3'} pb-4 space-y-3 mt-auto`}>
        <NavFooter items={footerNavItems} className={`mt-auto bg-slate-50/80 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-200/40 dark:border-slate-700/40 ${isCollapsed ? 'p-2' : 'p-3'}`} />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
