import { Button } from '@/components/ui/button';

export function PaginationFooter({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t p-3 text-sm">
      <div className="text-muted-foreground">Page {page} of {totalPages}</div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>Previous</Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>Next</Button>
      </div>
    </div>
  );
}


