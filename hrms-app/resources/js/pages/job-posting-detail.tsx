import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard, login, register } from '@/routes';
import { index as jobPostingIndex } from '@/routes/job-posting-public';
import { type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
  Building2,
  Calendar,
  ChevronRight,
  DollarSign,
  Home,
  MapPin,
  Share2,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
  benefits: Array<{ value: string }>;
  requirements: Array<{ value: string }>;
  responsibilities: Array<{ value: string }>;
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
  const { auth, jobPosting, flash } = pageProps;
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    email: auth.user?.email || '',
    phone: '',
    portfolio_link: '',
    resume_file: null as File | null,
    answers: jobPosting.questions.reduce(
      (acc, question) => {
        acc[question.id] = '';
        return acc;
      },
      {} as Record<string, string>,
    ),
  });

  useEffect(() => {
    if (flash?.success) {
      setShowSuccessMessage(true);
      setShowApplicationForm(false);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [flash]);

  const handleApply = () => {
    if (!auth.user) {
      router.visit(register());
      return;
    }
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/job-posting/${jobPosting.id}/apply`);
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
        <nav className="relative z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3">
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
              </Link>

              {/* Navigation Links */}
              <div className="hidden items-center space-x-8 md:flex">
                <Link
                  href="/"
                  className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Home
                </Link>
                <Link
                  href={jobPostingIndex().url}
                  className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Job Openings
                </Link>
              </div>

              {/* Auth Links */}
              <div className="flex items-center space-x-4">
                {auth.user ? (
                  <Button asChild>
                    <Link href={dashboard()}>Dashboard</Link>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" asChild>
                      <Link href={login()}>Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href={register()}>Apply Now</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

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
            {/* Success Message */}
            {showSuccessMessage && flash?.success && (
              <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                <div className="flex items-center">
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <AlertDescription>{flash.success}</AlertDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSuccessMessage(false)}
                    className="ml-auto text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              </Alert>
            )}

            {/* Error Message */}
            {flash?.error && (
              <Alert
                variant="destructive"
                className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              >
                <div className="flex items-center">
                  <svg
                    className="mr-3 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <AlertDescription>{flash.error}</AlertDescription>
                </div>
              </Alert>
            )}
            {!showApplicationForm ? (
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Job Details */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                    <CardHeader>
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <CardTitle className="text-3xl">
                          {jobPosting.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-sm">
                          {jobPosting.type}
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
                            variant="outline"
                            className="flex-1 border-gray-300/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
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
            ) : (
              /* Application Form */
              <div className="mx-auto max-w-4xl">
                <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Apply for {jobPosting.title}</CardTitle>
                    <CardDescription>
                      Fill out the form below to submit your application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmitApplication}
                      className="space-y-6"
                    >
                      {/* Personal Information */}
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                          Personal Information
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={data.email}
                              onChange={(e) => setData('email', e.target.value)}
                              disabled={!!auth.user}
                              required
                              className="bg-white/80 dark:bg-gray-900/60 border-gray-300/60 dark:border-gray-700/60"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.email}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={data.phone}
                              onChange={(e) => setData('phone', e.target.value)}
                              required
                              className="bg-white/80 dark:bg-gray-900/60 border-gray-300/60 dark:border-gray-700/60"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor="portfolio_link">
                            Portfolio Link (Optional)
                          </Label>
                          <Input
                            id="portfolio_link"
                            type="url"
                            value={data.portfolio_link}
                            onChange={(e) =>
                              setData('portfolio_link', e.target.value)
                            }
                            placeholder="https://your-portfolio.com"
                            className="bg-white/80 dark:bg-gray-900/60 border-gray-300/60 dark:border-gray-700/60"
                          />
                        </div>
                      </div>

                      {/* Resume Upload */}
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                          Resume
                        </h2>
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <Label
                              htmlFor="resume_file"
                              className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white hover:from-blue-700 hover:to-indigo-700"
                            >
                              Choose File
                            </Label>
                            <Input
                              id="resume_file"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) =>
                                setData(
                                  'resume_file',
                                  e.target.files?.[0] || null,
                                )
                              }
                              className="hidden"
                              required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                              PDF, DOC, or DOCX up to 10MB
                            </p>
                            {data.resume_file && (
                              <p className="mt-2 text-sm text-green-600">
                                Selected: {data.resume_file.name}
                              </p>
                            )}
                          </div>
                        </div>
                        {errors.resume_file && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.resume_file}
                          </p>
                        )}
                      </div>

                      {/* Questions */}
                      {jobPosting.questions.length > 0 && (
                        <div>
                          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Additional Questions
                          </h2>
                          <div className="space-y-6">
                            {jobPosting.questions.map((question) => (
                              <div key={question.id}>
                                <Label htmlFor={question.id}>
                                  {question.question}
                                </Label>
                                <Textarea
                                  id={question.id}
                                  value={data.answers[question.id] || ''}
                                  onChange={(e) =>
                                    setData('answers', {
                                      ...data.answers,
                                      [question.id]: e.target.value,
                                    })
                                  }
                                  rows={4}
                                  placeholder="Enter your answer here..."
                                  required
                                  className="bg-white/80 dark:bg-gray-900/60 border-gray-300/60 dark:border-gray-700/60"
                                />
                                {errors[`answers.${question.id}`] && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors[`answers.${question.id}`]}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Submit Buttons */}
                      <div className="flex space-x-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowApplicationForm(false)}
                          className="flex-1 border-gray-300/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={processing}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        >
                          {processing ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
