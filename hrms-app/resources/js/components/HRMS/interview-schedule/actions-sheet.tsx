import { IconCalendar, IconCheck, IconEye, IconMessage, IconPlayerPlay, IconRefresh, IconX, IconDotsVertical } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { InterviewScheduleItem, InterviewScheduleTableProps } from './types';

export function ActionsSheet({
  item,
  handlers,
  title,
}: {
  item: InterviewScheduleItem;
  handlers: Omit<InterviewScheduleTableProps, 'items'>;
  title: string;
}) {
  const {
    onView,
    onReschedule,
    onCancel,
    onJoin,
    onAddFeedback,
    onReviewProposal,
    onApproveProposal,
    onSuggestAnotherTime,
    onResendInvitation,
    onEditInvitation,
    onMarkCompleted,
    onReinitiate,
  } = handlers;

  const ActionRow = ({ title, onClick, icon, className, variant = 'outline' }: { title: string; onClick?: () => void; icon: React.ReactNode; className?: string; variant?: 'outline' | 'default' | 'destructive' | 'secondary' | 'ghost' | 'link' }) => (
    <Button
      variant={variant}
      onClick={onClick}
      className={`justify-start gap-2 w-full ${className ?? ''}`}
    >
      {icon}
      {title}
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="p-4 flex flex-col gap-2">
          {item.status === 'invited' && (
            <>
              <ActionRow title="Resend Invitation" icon={<IconRefresh className="size-4" />} className="text-blue-700" onClick={() => onResendInvitation?.(item)} />
              <ActionRow title="Edit Invitation" icon={<IconCalendar className="size-4" />} className="text-amber-700" onClick={() => onEditInvitation?.(item)} />
              <ActionRow title="View Details" icon={<IconEye className="size-4" />} variant="ghost" onClick={() => onView?.(item)} />
            </>
          )}
          {item.status === 'candidate_proposed' && (
            <>
              <ActionRow title="Review Proposal" icon={<IconEye className="size-4" />} variant="ghost" onClick={() => onReviewProposal?.(item)} />
              <ActionRow title="Approve" icon={<IconCheck className="size-4" />} variant="default" className="bg-green-600 text-white hover:bg-green-700" onClick={() => onApproveProposal?.(item)} />
              <ActionRow title="Suggest Another Time" icon={<IconCalendar className="size-4" />} className="text-indigo-700" onClick={() => onSuggestAnotherTime?.(item)} />
            </>
          )}
          {item.status === 'scheduled' && (
            <>
              <ActionRow title="Reschedule" icon={<IconRefresh className="size-4" />} className="text-amber-700" onClick={() => onReschedule?.(item)} />
              <ActionRow title="Cancel Interview" icon={<IconX className="size-4" />} variant="destructive" onClick={() => onCancel?.(item)} />
              <ActionRow title="View Details" icon={<IconEye className="size-4" />} variant="ghost" onClick={() => onView?.(item)} />
            </>
          )}
          {item.status === 'today' && (
            <>
              <ActionRow title="Join Interview" icon={<IconPlayerPlay className="size-4" />} variant="default" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => onJoin?.(item)} />
              <ActionRow title="View Details" icon={<IconEye className="size-4" />} variant="ghost" onClick={() => onView?.(item)} />
            </>
          )}
          {item.status === 'completed' && (
            <>
              <ActionRow title="Add Feedback" icon={<IconMessage className="size-4" />} className="text-purple-700" onClick={() => onAddFeedback?.(item)} />
              <ActionRow title="View Details" icon={<IconEye className="size-4" />} variant="ghost" onClick={() => onView?.(item)} />
            </>
          )}
          {item.status === 'no_show' && (
            <>
              <ActionRow title="Mark as Completed" icon={<IconCheck className="size-4" />} variant="default" className="bg-green-600 text-white hover:bg-green-700" onClick={() => onMarkCompleted?.(item)} />
              <ActionRow title="Reschedule" icon={<IconRefresh className="size-4" />} className="text-amber-700" onClick={() => onReschedule?.(item)} />
            </>
          )}
          {item.status === 'cancelled' && (
            <>
              <ActionRow title="Reinitiate Interview" icon={<IconRefresh className="size-4" />} className="text-blue-700" onClick={() => onReinitiate?.(item)} />
              <ActionRow title="View Details" icon={<IconEye className="size-4" />} variant="ghost" onClick={() => onView?.(item)} />
            </>
          )}
          {item.status === 'reschedule_requested' && (
            <>
              <ActionRow title="Review Request" icon={<IconEye className="size-4" />} variant="ghost" onClick={() => onReviewProposal?.(item)} />
              <ActionRow title="Suggest Time" icon={<IconCalendar className="size-4" />} className="text-indigo-700" onClick={() => onSuggestAnotherTime?.(item)} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


