import { Link } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { index as jobPostingIndex } from '@/routes/job-posting-public';

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <span className="text-xl font-bold text-white">T</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Trilogi University</h3>
                <p className="text-gray-400">Shaping Tomorrow's Leaders</p>
              </div>
            </div>
            <p className="max-w-md text-gray-400">
              Join our community of educators, researchers, and innovators who are passionate about transforming the future of education.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 transition-colors hover:text-white">Home</Link>
              <Link href={jobPostingIndex().url} className="block text-gray-400 transition-colors hover:text-white">Job Openings</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>123 University Avenue</p>
              <p>Jakarta, Indonesia</p>
              <p>Phone: +62 21 1234 5678</p>
              <p>Email: careers@trilogi.ac.id</p>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-gray-400">
          <p>&copy; 2024 Trilogi University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
