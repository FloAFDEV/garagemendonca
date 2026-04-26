function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <SkeletonBox className="h-52 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        <SkeletonBox className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBox className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function InboxRowSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-4">
      <SkeletonBox className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-4 w-20" />
        </div>
        <SkeletonBox className="h-4 w-48" />
        <SkeletonBox className="h-3 w-full" />
      </div>
    </div>
  );
}
