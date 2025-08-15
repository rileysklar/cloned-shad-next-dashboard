import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TrafficIncidentListSkeleton() {
  return (
    <div className='min-h-[600px] space-y-6'>
      {/* Header Stats Skeleton */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header Skeleton */}
      <div className='mb-4'>
        <Skeleton className='mb-2 h-8 w-48' />
        <Skeleton className='h-4 w-32' />
      </div>

      {/* Incidents List Skeleton */}
      <div className='space-y-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className='@container/card transition-shadow hover:shadow-md'
            data-slot='card'
          >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <Skeleton className='mb-2 h-6 w-3/4' />
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-48' />
                  </div>
                </div>
                <Skeleton className='h-6 w-20' />
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Info Skeleton */}
      <div className='text-center'>
        <Skeleton className='mx-auto h-4 w-48' />
      </div>
    </div>
  );
}
