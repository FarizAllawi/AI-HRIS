import { dashboard, login, register } from '@/routes';
import { index as jobPosting } from '@/routes/job-posting-public';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
  const { auth } = usePage<SharedData>().props;

  return (
    <>
      <Head title="Trilogi University - Careers">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&family=inter:400,500,600,700"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        {/* Navigation */}
        <nav className="relative z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                  <span className="text-xl font-bold text-white">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Trilogi University
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Career Opportunities
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden items-center space-x-8 md:flex">
                <Link
                  href="/"
                  className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Home
                </Link>
                <Link
                  href={jobPosting().url}
                  className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Job Openings
                </Link>
                <a
                  href="#about"
                  className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  About Us
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Contact
                </a>
              </div>

              {/* Auth Links */}
              <div className="flex items-center space-x-4">
                {auth.user ? (
                  <Link
                    href={dashboard()}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:from-blue-700 hover:to-indigo-700"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href={login()}
                      className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      Sign In
                    </Link>
                    <Link
                      href={register()}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:from-blue-700 hover:to-indigo-700"
                    >
                      Apply Now
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl leading-tight font-bold text-gray-900 lg:text-6xl dark:text-white">
                  Shape the Future of
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {' '}
                    Education
                  </span>
                </h1>
                <p className="mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                  Join Trilogi University's dynamic team and help us create
                  transformative educational experiences. Discover exciting
                  career opportunities where innovation meets excellence.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <Link
                    href={jobPosting().url}
                    className="transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                  >
                    Explore Opportunities
                  </Link>
                  <a
                    href="#about"
                    className="transform rounded-xl border border-gray-300/60 dark:border-gray-700/60 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:scale-105 hover:bg-white/50 dark:hover:bg-gray-800/50 dark:text-gray-300"
                  >
                    Learn More
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10 rounded-2xl bg-white/80 dark:bg-gray-900/60 p-8 shadow-2xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <svg
                          className="h-6 w-6 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Academic Excellence
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Leading innovation in higher education
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <svg
                          className="h-6 w-6 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Collaborative Team
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Work with passionate educators
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                        <svg
                          className="h-6 w-6 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Growth Opportunities
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Continuous learning and development
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-blue-200 opacity-50 dark:bg-blue-800"></div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-indigo-200 opacity-50 dark:bg-indigo-800"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/50 py-20 dark:bg-gray-800/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white">
                Why Choose Trilogi University?
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                Be part of an institution that values innovation, excellence,
                and the transformative power of education.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 p-8 shadow-lg transition-shadow hover:shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Research Excellence
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Contribute to cutting-edge research projects and publications
                  that shape the future of various fields.
                </p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 p-8 shadow-lg transition-shadow hover:shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Competitive Benefits
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enjoy comprehensive health coverage, retirement plans, and
                  professional development opportunities.
                </p>
              </div>

              <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 p-8 shadow-lg transition-shadow hover:shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Global Impact
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Make a difference on a global scale through international
                  partnerships and community outreach programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white">
                  About Trilogi University
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Trilogi University has been at the forefront of higher
                  education excellence for over three decades. Our commitment to
                  academic rigor, innovation, and student success has made us a
                  leader in educational transformation.
                </p>
                <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                  We foster an environment where faculty, staff, and students
                  collaborate to push boundaries, challenge conventions, and
                  create solutions for tomorrow's challenges.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      15,000+
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Students Enrolled
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      1,200+
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Faculty & Staff
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      50+
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Academic Programs
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      30+
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Years of Excellence
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
              Explore our current openings and take the first step towards an
              exciting career in education.
            </p>
            <Link
              href={jobPosting().url}
              className="inline-block transform rounded-xl bg-white/90 px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition-all hover:scale-105 hover:bg-white hover:shadow-xl"
            >
              View Open Positions
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-gray-900 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="col-span-2">
                <div className="mb-6 flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                    <span className="text-xl font-bold text-white">T</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Trilogi University</h3>
                    <p className="text-gray-400">Shaping Tomorrow's Leaders</p>
                  </div>
                </div>
                <p className="mb-6 max-w-md text-gray-400">
                  Join our community of educators, researchers, and innovators
                  who are passionate about transforming the future of education.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-blue-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-blue-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">Quick Links</h4>
                <div className="space-y-2">
                  <Link
                    href={jobPosting().url}
                    className="block text-gray-400 transition-colors hover:text-white"
                  >
                    Job Openings
                  </Link>
                  <a
                    href="#about"
                    className="block text-gray-400 transition-colors hover:text-white"
                  >
                    About Us
                  </a>
                  <a
                    href="#"
                    className="block text-gray-400 transition-colors hover:text-white"
                  >
                    Departments
                  </a>
                  <a
                    href="#"
                    className="block text-gray-400 transition-colors hover:text-white"
                  >
                    Research
                  </a>
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
            <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Trilogi University. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
