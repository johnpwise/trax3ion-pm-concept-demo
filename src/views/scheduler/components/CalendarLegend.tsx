export default function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
        Trax3ion Project Booking
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm border-2 border-muted-foreground bg-transparent" />
        Existing Calendar Commitment
      </span>
    </div>
  );
}
