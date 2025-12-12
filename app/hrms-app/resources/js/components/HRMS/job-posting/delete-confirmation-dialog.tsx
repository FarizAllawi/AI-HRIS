// delete-confirmation-dialog.tsx
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JobPosting } from '@/types/job-posting';
import { IconAlertTriangle, IconTrash, IconArchive } from '@tabler/icons-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobPosting: JobPosting | null;
  isDeleting?: boolean;
}

export function DeleteConfirmationDialog({
                                           isOpen,
                                           onClose,
                                           onConfirm,
                                           jobPosting,
                                           isDeleting = false,
                                         }: DeleteConfirmationDialogProps) {
  if (!jobPosting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/50 dark:from-gray-900 dark:to-red-900/20">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
              <IconAlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-left text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Delete Job Posting
              </DialogTitle>
              <DialogDescription className="text-left text-sm">
                This action cannot be undone and will permanently remove all data.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-4 shadow-sm border border-red-100 dark:border-red-900/50">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Job Title:
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{jobPosting.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status:
                </span>
                <span
                  className={`capitalize inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    jobPosting.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : jobPosting.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : jobPosting.status === 'unpublish'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {jobPosting.status === 'unpublish'
                    ? 'Unpublished'
                    : jobPosting.status}
                </span>
              </div>
              {jobPosting.totalApplicants !== undefined &&
                jobPosting.totalApplicants > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Active Applications:
                    </span>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                      {jobPosting.totalApplicants} applications will be lost
                    </p>
                  </div>
                )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This will permanently remove:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                The job posting and all its details
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                All associated questions and screening data
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                All applicant responses and scoring data
              </li>
              {jobPosting.totalApplicants !== undefined && jobPosting.totalApplicants > 0 && (
                <li className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  All {jobPosting.totalApplicants} job applications and candidate data
                </li>
              )}
            </ul>
          </div>

          {jobPosting.totalApplicants !== undefined && jobPosting.totalApplicants > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-700 dark:bg-amber-900/20 p-4">
              <div className="flex items-start gap-3">
                <IconArchive className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Consider Archiving Instead
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Archiving preserves applicant data while hiding the job from active listings.
                    Delete only if you're certain you want to permanently remove all records.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <IconTrash className="mr-2 h-4 w-4" />
                Delete Permanently
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
