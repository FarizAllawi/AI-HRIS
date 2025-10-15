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
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <IconAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-left">
                Delete Job Posting
              </DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Job Title:
                </span>
                <p className="text-sm text-gray-900">{jobPosting.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    jobPosting.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : jobPosting.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : jobPosting.status === 'unpublish'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
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
                    <span className="text-sm font-medium text-gray-700">
                      Applicants:
                    </span>
                    <p className="text-sm text-gray-900">
                      {jobPosting.totalApplicants} applications
                    </p>
                  </div>
                )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this job posting? This will
              permanently remove:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
              <li>The job posting and all its details</li>
              <li>All associated questions and requirements</li>
              {jobPosting.totalApplicants && jobPosting.totalApplicants > 0 && (
                <li className="font-medium text-red-600">
                  All {jobPosting.totalApplicants} job applications
                </li>
              )}
            </ul>
          </div>

          {jobPosting.totalApplicants && jobPosting.totalApplicants > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start">
                <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-amber-800">
                    Warning: This job has active applications
                  </p>
                  <p className="text-sm text-amber-700">
                    Deleting this job posting will also remove all applicant
                    data. Consider archiving instead of deleting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <IconTrash className="mr-2 h-4 w-4" />
                Delete Job Posting
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
