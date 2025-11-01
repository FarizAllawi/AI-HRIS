import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { register } from '@/routes';
import { index as jobPostingIndex } from '@/routes/job-posting-public';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Building2,
  Calendar,
  ChevronRight,
  DollarSign,
  Home,
  MapPin,
  Share2,
} from 'lucide-react';

import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from "@/components/public/PublicFooter";

interface JobPostingQuestion {
  id: string;
  question: string;
  description?: string;
  weight: number;
}

interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  departments: string;
  type: string;
  salary: string;
  benefits: Array<{ id: string, value: string }>;
  requirements: Array<{ id: string, value: string }>;
  responsibilities: Array<{ id: string, value: string }>;
  qualifications: Array<{ id: string, value: string }>;
  required_skills: Array<{ id: string, value: string }>;
  preferred_skills: Array<{ id: string, value: string }>;
  created_at: string;
  updated_at: string;
  questions: JobPostingQuestion[];
}

interface Props extends SharedData {
  jobPosting: JobPosting;
}

export default function JobPostingDetail() {
  const pageProps = usePage<
    Props & { flash?: { success?: string; error?: string } }
  >().props;
  const { auth, jobPosting } = pageProps;

  const handleApply = () => {
    if (!auth.user) {
      router.visit(register());
      return;
    }
    router.visit(`/job-openings/${jobPosting.id}/apply`);
  };

  const formatSalary = (salary: string) => {
    if (!salary) return 'Competitive';
    // Handle different salary formats like "IDR 7.000.000" or "7000000"
    if (salary.includes('IDR') || salary.includes('Rp')) {
      return salary;
    }
    // If it's just a number, format it as IDR
    const numericValue = salary.replace(/\D/g, '');
    if (numericValue) {
      return `IDR ${parseInt(numericValue).toLocaleString('id-ID')}`;
    }
    return salary;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatJobType = (t: string) =>
    t ? t.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : t;

  console.log("Job Posting: ", jobPosting);

  return (
    <>
      <Head title={`${jobPosting.title} - Trilogi University`}>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&family=inter:400,500,600,700"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        {/* Navigation */}
        <PublicNavbar />

        {/* Breadcrumb */}
        <div className="bg-white/50 py-4 dark:bg-gray-800/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center">
                      <Home className="mr-3 lg:mr-4 h-4 w-4" />
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={jobPostingIndex().url}>Job Openings</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <span className="text-gray-700 dark:text-gray-300">
                    {jobPosting.title}
                  </span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Main Content */}
        <main className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Job Details */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                    <CardHeader>
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <CardTitle className="text-3xl">
                          {jobPosting.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-0"
                        >
                          {formatJobType(jobPosting.type)}
                        </Badge>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="h-5 w-5" />
                          <span>{jobPosting.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Building2 className="h-5 w-5" />
                          <span>{jobPosting.departments}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <DollarSign className="h-5 w-5" />
                          <span>{formatSalary(jobPosting.salary)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Description */}
                      <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">
                          About This Role
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          {jobPosting.description}
                        </p>
                      </div>

                      {/* Responsibilities */}
                      {jobPosting.responsibilities &&
                        jobPosting.responsibilities.length > 0 && (
                          <div className="mb-8">
                            <h2 className="mb-4 text-xl font-semibold">
                              Responsibilities
                            </h2>
                            <ul className="space-y-2">
                              {jobPosting.responsibilities.map(
                                (resp, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start text-gray-600 dark:text-gray-300"
                                  >
                                    <span className="mt-1 mr-3 text-blue-600">
                                      ✓
                                    </span>
                                    {resp.value}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Requirements */}
                      {jobPosting.requirements &&
                        jobPosting.requirements.length > 0 && (
                          <div className="mb-8">
                            <h2 className="mb-4 text-xl font-semibold">
                              Requirements
                            </h2>
                            <ul className="space-y-2">
                              {jobPosting.requirements.map((req, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-gray-600 dark:text-gray-300"
                                >
                                  <span className="mt-1 mr-3 text-blue-600">
                                    ✓
                                  </span>
                                  {req.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* RQualifications */}
                      {jobPosting.qualifications &&
                        jobPosting.qualifications.length > 0 && (
                          <div className="mb-8">
                            <h2 className="mb-4 text-xl font-semibold">
                              Qualifications
                            </h2>
                            <ul className="space-y-2">
                              {jobPosting.qualifications.map((req, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-gray-600 dark:text-gray-300"
                                >
                                  <span className="mt-1 mr-3 text-blue-600">
                                    ✓
                                  </span>
                                  {req.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Required Skills */}
                      {jobPosting.required_skills &&
                        jobPosting.required_skills.length > 0 && (
                          <div className="mb-8">
                            <h2 className="mb-4 text-xl font-semibold">
                              Required Skills
                            </h2>
                            <ul className="space-y-2">
                              {jobPosting.required_skills.map((req, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-gray-600 dark:text-gray-300"
                                >
                                  <span className="mt-1 mr-3 text-blue-600">
                                    ✓
                                  </span>
                                  {req.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Preferred Skills */}
                      {jobPosting.preferred_skills &&
                        jobPosting.preferred_skills.length > 0 && (
                          <div className="mb-8">
                            <h2 className="mb-4 text-xl font-semibold">
                              Preffered Skills
                            </h2>
                            <ul className="space-y-2">
                              {jobPosting.preferred_skills.map((req, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-gray-600 dark:text-gray-300"
                                >
                                  <span className="mt-1 mr-3 text-blue-600">
                                    ✓
                                  </span>
                                  {req.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Benefits */}
                      {jobPosting.benefits &&
                        jobPosting.benefits.length > 0 && (
                          <div className="mb-8">
                            <h2 className="mb-4 text-xl font-semibold">
                              Benefits & Perks
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {jobPosting.benefits.map((benefit, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="justify-start p-3"
                                >
                                  <span className="mr-2 text-blue-600">✓</span>
                                  {benefit.value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 space-y-6">
                    {/* Apply Card */}
                    <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Ready to Apply?</CardTitle>
                        <CardDescription>
                          Join our team and help shape the future of education.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={handleApply}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          size="lg"
                        >
                          {auth.user ? 'Apply Now' : 'Sign Up to Apply'}
                        </Button>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          Posted on {formatDate(jobPosting.created_at)}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Share */}
                    <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Share2 className="h-5 w-5" />
                          Share This Job
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-3">
                          <Button size="icon" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                            Twitter
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="flex-1 bg-white/90 text-blue-700 hover:bg-white"
                          >
                            LinkedIn
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="flex-1 bg-white/90 text-blue-700 hover:bg-white"
                          >
                            Copy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
          </div>
        </main>
      {/* Footer */}
      <PublicFooter />
      </div>
    </>
  );
}
