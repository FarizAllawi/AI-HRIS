import AppliedJobFilter from '@/components/HRMS/applicant/AppliedJobFilter';
import type { ApplicantRecord } from '@/components/HRMS/applicant/types';
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Mail,
  Phone,
  FileText,
  User,
  Video,
  MessageSquare,
  Star,
  UserCheck,
  Clock,
  ExternalLink,
  MapPin,
  Award,
  Download
} from 'lucide-react';
import { useState } from 'react';

type Props = {
  applicant: ApplicantRecord;
};

export default function ApplicantDetail({ applicant }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Applicant', href: '/HRMS/applicant' },
    { title: applicant.fullName, href: '#' },
  ];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
    const statusLower = status?.toLowerCase() || 'new';
    if (statusLower.includes('approved') || statusLower.includes('hired') || statusLower.includes('completed')) return 'success';
    if (statusLower.includes('pending') || statusLower.includes('scheduled') || statusLower.includes('review')) return 'secondary';
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) return 'destructive';
    return 'outline';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
  };

  // Mobile responsive tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'application', label: 'Application', icon: FileText },
    { id: 'interview', label: 'Interview', icon: Video },
    { id: 'documents', label: 'Documents', icon: Download },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Applicant — ${applicant.fullName}`} />

      {/* Header Section with Profile */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-950/20 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {applicant.fullName?.charAt(0) || 'A'}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {applicant.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{applicant.positionTitle}</span>
                </div>
                {applicant.positionCode && (
                  <Badge variant="outline" className="text-xs">
                    #{applicant.positionCode}
                  </Badge>
                )}
                {applicant.resumeScore && (
                  <div className={`flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getScoreColor(applicant.resumeScore)}`}>
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Score: {applicant.resumeScore}/100
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                <Phone className="h-4 w-4 inline mr-2" />
                Call
              </button>
              <button className="flex-1 sm:flex-none bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="border-b bg-white dark:bg-gray-800 sticky top-0 z-10 lg:hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <HRMSContentLayout
        title={null} // We moved the title to the header
        description={null}
      >
        {/* Status Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Application</div>
            <Badge variant={getStatusVariant(applicant.applicationStatus || 'new')} className="text-xs">
              {applicant.applicationStatus || 'New'}
            </Badge>
          </div>
          {applicant.interviewStatus && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Interview</div>
              <Badge variant={getStatusVariant(applicant.interviewStatus)} className="text-xs">
                {applicant.interviewStatus}
              </Badge>
            </div>
          )}
          {applicant.feedbackStatus && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Feedback</div>
              <Badge variant={getStatusVariant(applicant.feedbackStatus)} className="text-xs">
                {applicant.feedbackStatus}
              </Badge>
            </div>
          )}
          {applicant.resumeScore && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Resume Score</div>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{applicant.resumeScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Application Details Card */}
          <div className={`${activeTab !== 'overview' && activeTab !== 'application' ? 'hidden lg:block' : 'block'} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Details</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Candidate application information</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Calendar className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Date</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {new Date(applicant.applicationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <UserCheck className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
                  <div className="mt-2">
                    <Badge variant={getStatusVariant(applicant.applicationStatus || 'new')} className="text-sm py-1">
                      {applicant.applicationStatus || 'New Application'}
                    </Badge>
                  </div>
                </div>
              </div>

              {applicant.referralSource && (
                <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <User className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Referral Source</div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-sm">
                        <Award className="h-3 w-3 mr-1" />
                        {applicant.referralSource}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interview Details Card */}
          <div className={`${activeTab !== 'overview' && activeTab !== 'interview' ? 'hidden lg:block' : 'block'} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-purple-100 dark:bg-purple-900/30 p-3">
                <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interview Information</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Meeting schedule & details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <UserCheck className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
                  <div className="mt-2">
                    <Badge variant={getStatusVariant(applicant.interviewStatus || 'not scheduled')} className="text-sm py-1">
                      {applicant.interviewStatus || 'Not Scheduled'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Clock className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled Time</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {applicant.interviewDateTime
                      ? new Date(applicant.interviewDateTime).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Not scheduled'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Video className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Interview Type</div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm py-1">
                      {applicant.interviewType || 'TBD'}
                    </Badge>
                  </div>
                </div>
              </div>

              {applicant.interviewers && applicant.interviewers.length > 0 && (
                <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <User className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Interviewers</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {applicant.interviewers.map((interviewer, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {interviewer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information Card */}
          <div className={`${activeTab !== 'overview' && activeTab !== 'documents' ? 'hidden lg:block' : 'block'} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-3">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Get in touch with candidate</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Mail className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</div>
                  {applicant.contactEmail ? (
                    <a
                      href={`mailto:${applicant.contactEmail}`}
                      className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors block py-1"
                    >
                      {applicant.contactEmail}
                    </a>
                  ) : (
                    <Badge variant="outline" className="mt-1 text-sm">Not provided</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Phone className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</div>
                  {applicant.contactPhone ? (
                    <a
                      href={`tel:${applicant.contactPhone}`}
                      className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors block py-1"
                    >
                      {applicant.contactPhone}
                    </a>
                  ) : (
                    <Badge variant="outline" className="mt-1 text-sm">Not provided</Badge>
                  )}
                </div>
              </div>

              {applicant.profileUrl && (
                <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <User className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile</div>
                    <a
                      className="mt-2 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      href={applicant.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Badge variant="outline" className="gap-2 text-sm py-1">
                        View Profile <ExternalLink className="h-3 w-3" />
                      </Badge>
                    </a>
                  </div>
                </div>
              )}

              {applicant.resumeUrl && (
                <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FileText className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume</div>
                    <a
                      className="mt-2 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      href={applicant.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Badge variant="outline" className="gap-2 text-sm py-1">
                        View Resume <ExternalLink className="h-3 w-3" />
                      </Badge>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Card */}
          <div className={`${activeTab !== 'overview' ? 'hidden lg:block' : 'block'} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-orange-100 dark:bg-orange-900/30 p-3">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Additional Information</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Feedback & evaluation</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MessageSquare className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Feedback Status</div>
                  <div className="mt-2">
                    <Badge variant={getStatusVariant(applicant.feedbackStatus || 'n/a')} className="text-sm py-1">
                      {applicant.feedbackStatus || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              {applicant.resumeScore && (
                <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Star className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume Score</div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="gap-2 text-sm">
                          <Star className="h-3 w-3" />
                          {applicant.resumeScore}/100
                        </Badge>
                        <span className={`text-sm font-semibold ${getScoreColor(applicant.resumeScore).split(' ')[0]}`}>
                          {applicant.resumeScore >= 80 ? 'Excellent' : applicant.resumeScore >= 60 ? 'Good' : applicant.resumeScore >= 40 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            applicant.resumeScore >= 80 ? 'bg-green-500 dark:bg-green-600' :
                              applicant.resumeScore >= 60 ? 'bg-blue-500 dark:bg-blue-600' :
                                applicant.resumeScore >= 40 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-red-500 dark:bg-red-600'
                          }`}
                          style={{ width: `${Math.min(Number(applicant.resumeScore) || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications & Answers Section */}
        {Array.isArray(applicant.appliedJobsWithAnswers) && applicant.appliedJobsWithAnswers.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900/30 p-3">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Applications & Answers</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Candidate's job applications</p>
              </div>
            </div>
            <AppliedJobFilter appliedJobsWithAnswers={applicant.appliedJobsWithAnswers} />
          </div>
        )}
      </HRMSContentLayout>
    </AppLayout>
  );
}
