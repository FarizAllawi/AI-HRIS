import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { dashboard, login, register } from '@/routes';
import { show as jobPostingShow } from '@/routes/job-posting-public';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Building2,
  Calendar,
  DollarSign,
  Filter,
  MapPin,
  Search,
} from 'lucide-react';
import { useState } from 'react';

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
}

interface Props extends SharedData {
  jobPostings: JobPosting[];
  filters: {
    search?: string;
  };
}

export default function JobPosting() {
  const { auth, jobPostings, filters } = usePage<Props>().props;
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/job-posting', { search: searchTerm }, { preserveState: true });
  };

  const filteredJobPostings = jobPostings.filter((job) => {
    const matchesType = !selectedType || job.type === selectedType;
    const matchesLocation =
      !selectedLocation ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesType && matchesLocation;
  });

  const uniqueTypes = Array.from(new Set(jobPostings.map((job) => job.type)));
  const uniqueLocations = Array.from(
    new Set(jobPostings.map((job) => job.location)),
  );

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

  const clearFilters = () => {
    setSelectedType('');
    setSelectedLocation('');
    setSearchTerm('');
  };

  return (
    <>
      <Head title="Job Opportunities - Trilogi University">
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
                  href="/job-posting"
                  className="font-medium text-blue-600 dark:text-blue-400"
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

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
                Find Your Perfect Career
              </h1>
              <p className="mb-8 text-xl text-blue-100">
                Join our team of passionate educators and innovators at Trilogi
                University
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
                <Card className="p-6 bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search job titles, departments, or keywords..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/80 dark:bg-gray-900/60 border-gray-300/60 dark:border-gray-700/60 placeholder-gray-500"
                        />
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                      Search Jobs
                    </Button>
                  </div>
                </Card>
              </form>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8 bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filter Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Job Type Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="job-type">Job Type</Label>
                      <Select
                        value={selectedType || 'all'}
                        onValueChange={(val) =>
                          setSelectedType(val === 'all' ? '' : val)
                        }
                      >
                        <SelectTrigger id="job-type">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {uniqueTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select
                        value={selectedLocation || 'all'}
                        onValueChange={(val) =>
                          setSelectedLocation(val === 'all' ? '' : val)
                        }
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {uniqueLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      className="w-full border-gray-300/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Job Listings */}
              <div className="lg:col-span-3">
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-300">
                    {filteredJobPostings.length} job
                    {filteredJobPostings.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="space-y-6">
                  {filteredJobPostings.length > 0 ? (
                    filteredJobPostings.map((job) => (
                      <Card
                        key={job.id}
                        className="transition-shadow hover:shadow-lg bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur"
                      >
                        <CardHeader>
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <CardTitle className="text-xl">
                                  {job.title}
                                </CardTitle>
                                <Badge variant="secondary">{job.type}</Badge>
                              </div>
                              <CardDescription className="line-clamp-2">
                                {job.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="mb-4 grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <Building2 className="h-4 w-4" />
                              {job.departments}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary)}
                            </div>
                          </div>

                          {job.requirements && job.requirements.length > 0 && (
                            <div className="mb-4">
                              <h4 className="mb-2 text-sm font-semibold">
                                Key Requirements:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {job.requirements
                                  .slice(0, 3)
                                  .map((req, index) => (
                                    <Badge key={index} variant="outline">
                                      {req.value}
                                    </Badge>
                                  ))}
                                {job.requirements.length > 3 && (
                                  <Badge variant="outline">
                                    +{job.requirements.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            Posted on {formatDate(job.created_at)}
                          </div>
                        </CardContent>

                        <CardFooter className="flex gap-3">
                          <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                            <Link href={jobPostingShow(job.id).url}>
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline" className="flex-1 border-gray-300/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50">
                            Save Job
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
                      <CardContent className="py-12 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <Search className="h-12 w-12 text-gray-400" />
                        </div>
                        <CardTitle className="mb-2 text-xl">
                          No jobs found
                        </CardTitle>
                        <CardDescription>
                          Try adjusting your search criteria or check back later
                          for new opportunities.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Don't see the perfect role?
            </h2>
            <p className="mb-8 text-xl text-blue-100">
              We're always looking for talented individuals. Submit your resume
              and we'll keep you in mind for future opportunities.
            </p>
            {!auth.user && (
              <Button asChild size="lg" variant="secondary" className="bg-white/90 text-blue-700 hover:bg-white">
                <Link href={register()}>Create Your Profile</Link>
              </Button>
            )}
          </div>
        </section>

        {/* Footer */}
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
                  Join our community of educators, researchers, and innovators
                  who are passionate about transforming the future of education.
                </p>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">Quick Links</h4>
                <div className="space-y-2">
                  <Link
                    href="/"
                    className="block text-gray-400 transition-colors hover:text-white"
                  >
                    Home
                  </Link>
                  <Link
                    href="/job-posting"
                    className="block text-gray-400 transition-colors hover:text-white"
                  >
                    Job Openings
                  </Link>
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
      </div>
    </>
  );
}
