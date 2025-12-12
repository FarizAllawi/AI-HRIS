import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register, logout } from '@/routes';
import { index as jobPostingIndex, myApplications } from '@/routes/job-posting-public';
import type { SharedData } from '@/types';

export default function PublicNavbar() {
  const { auth } = usePage<SharedData>().props;

  return (
    <nav className="relative z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex w-8 h-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <span className="text-sm sm:text-xl font-bold text-white">T</span>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Trilogi University</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Career Opportunities</p>
            </div>
          </Link>

          <div className="hidden items-center space-x-8 md:flex">
            <Link href="/" className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Home</Link>
            <Link href={jobPostingIndex().url} className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Job Openings</Link>
          </div>

          <div className="flex items-center space-x-4">
            {auth.user ? (
              <>
              { auth.user.role === 'hrms-user' ? (
                <Link href={dashboard()} className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:from-blue-700 hover:to-indigo-700">Dashboard</Link>
              ) : (

                  <div className="flex items-center space-x-2">
                      <Button variant="ghost" asChild>
                          <Link href={logout()}>Log Out</Link>
                      </Button>
                      <Link href={myApplications()} className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:from-blue-700 hover:to-indigo-700">My Applications</Link>
                  </div>
              )}
              </>
            ) : (
              <div className="flex items-center sm:space-x-2">
                <Button variant="ghost" asChild>
                  <Link href={login()} className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 sm:bg-none sm:flex px-2 py-1 sm:px-4 sm:py-2 font-medium text-white transition-colors sm:hover-none hover:from-blue-700 hover:to-indigo-700">Sign In</Link>
                </Button>
                <Link href={register()}  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:flex px-2 py-1 sm:px-4 sm:py-2 font-medium text-white transition-colors hover:from-blue-700 hover:to-indigo-700">Apply Now</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
