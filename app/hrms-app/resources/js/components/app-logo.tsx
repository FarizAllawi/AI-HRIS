// app-logo.tsx
import { useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <>
      <div className="flex aspect-square size-10 items-center justify-center rounded-xl transition-all duration-300  group-hover:scale-105 ring-2 ring-white/20">
        <AppLogoIcon className="size-5 fill-white" />
      </div>
      {!isCollapsed && (
        <div className="ml-3 grid flex-1 text-left">
          <span className="font-bold text-slate-900 dark:text-white text-lg leading-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            HRMS TRILOGI
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
            Hiring Platform
          </span>
        </div>
      )}
    </>
  );
}
