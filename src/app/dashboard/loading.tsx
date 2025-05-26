import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-background container mx-auto min-h-screen w-full">
      <div className="border-b lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="hidden border-b lg:block">
        <div className="flex h-16 items-center px-4">
          <Skeleton className="h-7 w-52" />
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="bg-muted/50 border-b p-4 lg:hidden">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="bg-muted/50 hidden w-64 rounded-md border-r p-4 lg:block lg:h-fit">
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="border-b px-4">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
          <div className="p-2 lg:p-4">
            <div className="mb-4 flex flex-col space-y-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex-shrink-0">
                <Skeleton className="h-10 w-64 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-20 w-full rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
