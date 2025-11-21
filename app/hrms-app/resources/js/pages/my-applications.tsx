import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type SharedData } from '@/types';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Button } from '@/components/ui/button';
import { Calendar, Bot, UserCheck, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import {User} from "@/types/user";
import {Media} from "@/types/media";

interface ApplicationItem {
  id: string;
  created_at: string;
  ai_screening_score?: number | null;
  hr_screening_score?: number | null;
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
    status: string;
  };
}

interface ApplicantProfile {
  id?: string;
  email?: string;
  phone?: string | null;
  portfolioLink?: string | null;
  resumeMediaId?: string | null;
  user?: User,
    resume?: Media
}

interface Props extends SharedData {
  applications: ApplicationItem[];
  applicant?: ApplicantProfile | null;
}

export default function MyApplications() {
  const { applications, applicant } = usePage<Props>().props;

  const [name, setName] = useState<string>(applicant?.user?.name || '');
  const [email, setEmail] = useState<string>(applicant?.user?.email || applicant?.email || '');
  const [phone, setPhone] = useState<string>(applicant?.phone || '');
  const [portfolio, setPortfolio] = useState<string>(applicant?.portfolioLink || '');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatJobType = (t: string) =>
    t ? t.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : t;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    if (portfolio) formData.append('portfolioLink', portfolio);
    if (resumeFile) formData.append('resumeFile', resumeFile);

    router.post('/my-applications/profile', formData, {
      forceFormData: true,
      preserveScroll: true,
    });
  };
    console.log("applicant:", applicant);
  return (
    <>
      <Head title="My Applications">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&family=inter:400,500,600,700"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <PublicNavbar />
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-3 text-4xl font-bold text-white lg:text-5xl">
                My Applications
              </h1>
              <p className="text-blue-100 text-lg">
                Review the jobs you've applied to and track your progress.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar: Applicant Profile */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="grid gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 ..." />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="portfolio">Portfolio Link</Label>
                      <Input id="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="resume">Resume (PDF/DOC, max 5MB)</Label>
                      <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                      {applicant?.resumeMediaId && (
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          Current: <a className="text-blue-600 hover:underline" href={applicant?.resume?.url} target="_blank" rel="noreferrer">View resume</a>
                        </div>
                      )}
                    </div>
                    <div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">Save Profile</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Main: Applications List */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-300">
                  {applications.length} application{applications.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4">
                {applications.length === 0 ? (
                  <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <Bot className="h-12 w-12 text-gray-400" />
                      </div>
                      <CardTitle className="mb-2 text-xl">No applications yet</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">
                        Explore open roles and start your application journey.
                      </p>
                      <div className="mt-6 flex justify-center">
                        <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                          <Link href="/job-openings">Browse Job Openings</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  applications.map((app) => (
                    <Card
                      key={app.id}
                      className="transition-shadow hover:shadow-lg bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur"
                    >
                      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <CardTitle className="text-xl text-gray-900 dark:text-white">
                              {app.job.title}
                            </CardTitle>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-0">
                              {formatJobType(app.job.type)}
                            </Badge>
                            <Badge variant="outline">{app.job.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4" />
                            {app.job.location}
                          </div>
                        </div>
                      </CardHeader>
                      <Separator className="opacity-50" />
                      <CardContent className="py-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Applied on</span>
                            </div>
                            <div className="mt-1 font-medium text-gray-900 dark:text-white">
                              {formatDate(app.created_at)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              <span>AI Screening</span>
                            </div>
                            <div className="mt-1 font-medium text-gray-900 dark:text-white">
                              {app.ai_screening_score ?? '-'}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              <span>HR Screening</span>
                            </div>
                            <div className="mt-1 font-medium text-gray-900 dark:text-white">
                              {app.hr_screening_score ?? '-'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <PublicFooter />
      </div>
    </>
  );
}
