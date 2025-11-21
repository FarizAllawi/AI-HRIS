import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { index as jobPostingIndex} from '@/routes/job-posting-public';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
  ChevronRight,
  Home,
  Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import InputError from "@/components/input-error";
import {User} from "@/types/user";
import {JobPosting} from "@/types/job-posting";

interface Props extends SharedData {
  jobPosting: JobPosting;
  user: User
}

export default function JobPostingApply() {
  const pageProps = usePage<
    Props & { flash?: { success?: string; error?: string } }
  >().props;
  const { user, jobPosting, flash } = pageProps;
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    email: user?.applicant?.email || '',
    phone: user?.applicant?.phone || '',
    portfolioLink: user?.applicant?.portfolioLink || '',
    resumeFile: null as File | null,
    answers: jobPosting?.questions?.reduce(
      (acc, question) => {
        acc[question.id] = '';
        return acc;
      },
      {} as Record<string, string> ,
    ),
  });

  useEffect(() => {
    if (flash?.success) {
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [flash]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      post(`/job-openings/${jobPosting.id}/apply`, {
          forceFormData: true, // ensures file uploads work properly
          onSuccess: () => {
              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 5000);
          },
      });
  }

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
       <PublicNavbar/>

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
              {/* Application Form */}
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
                              onSubmit={handleSubmit}
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
                                              name="email"
                                              type="email"
                                              value={data.email}
                                              onChange={(e) => setData('email', e.target.value)}
                                              required
                                              className="bg-white/80 dark:bg-gray-900/60 border-gray-300/60 dark:border-gray-700/60"
                                          />
                                          <InputError message={errors.email} />
                                      </div>
                                      <div>
                                          <Label htmlFor="phone">Phone Number</Label>
                                          <Input
                                              id="phone"
                                              name="phone"
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
                                      <Label htmlFor="portfolioLink">
                                          Portfolio Link (Optional)
                                      </Label>
                                      <Input
                                          id="portfolioLink"
                                          name="porfolio_link"
                                          type="url"
                                          value={data.portfolioLink}
                                          onChange={(e) =>
                                              setData('portfolioLink', e.target.value)
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
                                              htmlFor="resumeFile"
                                              className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white hover:from-blue-700 hover:to-indigo-700"
                                          >
                                              Choose File
                                          </Label>
                                          <Input
                                              id="resumeFile"
                                              name="resumeFile"
                                              type="file"
                                              accept=".pdf,.doc,.docx"
                                              onChange={(e) =>
                                                  setData(
                                                      'resumeFile',
                                                      e.target.files?.[0] || null,
                                                  )
                                              }
                                              className="hidden"
                                          />
                                          <p className="mt-2 text-sm text-gray-500">
                                              {user?.applicant?.resumeMediaId && (<>Upload to update resume </>)}PDF, DOC, or DOCX up to 10MB
                                          </p>
                                          {data?.resumeFile ? (
                                              <p className="mt-2 text-sm text-green-600">
                                                  Selected: {data.resumeFile.name}
                                              </p>
                                          ) : user?.applicant?.resumeMediaId && (
                                                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                                      Current: <a className="text-blue-600 hover:underline" href={user?.applicant?.resume?.url} target="_blank" rel="noreferrer">View resume</a>
                                                  </div>
                                          )}
                                      </div>
                                  </div>
                                  <InputError message={errors.resumeFile} />
                              </div>

                              {/* Questions */}
                              {jobPosting?.questions?.length !== undefined && jobPosting?.questions?.length > 0 && (
                                  <div>
                                      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                          Additional Questions
                                      </h2>
                                      <div className="space-y-6">
                                          {jobPosting?.questions?.map((question) => (
                                              <div key={question.id}>
                                                  <Label htmlFor={question.id}>
                                                      {question.question}
                                                  </Label>
                                                  <Textarea
                                                      id={question.id}
                                                      name={`answers.${question.id}`}
                                                      value={data?.answers?.[question.id] || ''}
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
                                      asChild
                                      type="button"
                                      variant="outline"
                                      className="flex-1 border-gray-300/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
                                  >
                                      <Link href={`/job-openings/${jobPosting.id}`}>Cancel</Link>
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
          </div>
        </main>
          {/* Footer */}
          <PublicFooter />
      </div>
    </>
  );
}
