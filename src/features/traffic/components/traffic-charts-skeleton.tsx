import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TrafficChartsSkeleton() {
  return (
    <div className='min-h-[800px] space-y-6'>
      {/* Summary Stats Skeleton */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='@container/card' data-slot='card'>
            <CardHeader>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-16' />
            </CardHeader>
            <CardContent className='text-muted-foreground text-sm'>
              <Skeleton className='h-4 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Status Distribution - Pie Chart Skeleton */}
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[300px] items-center justify-center'>
              <div className='relative'>
                <Skeleton className='h-48 w-48 rounded-full' />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Skeleton className='h-8 w-16' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agency Distribution - Bar Chart Skeleton */}
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-56' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[300px] items-end justify-around gap-2 pt-8'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='w-full'
                  style={{
                    height: `${Math.max(20, Math.random() * 100)}%`
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issue Type Distribution - Bar Chart Skeleton */}
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-52' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[300px] flex-col justify-around gap-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='flex items-center gap-4'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton
                    className='flex-1'
                    style={{
                      height: `${Math.max(16, Math.random() * 60)}px`
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Chart - Area Chart Skeleton */}
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <Skeleton className='h-6 w-44' />
            <Skeleton className='h-4 w-60' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[300px] items-end justify-around gap-2 pt-8'>
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='w-full'
                  style={{
                    height: `${Math.max(20, Math.random() * 100)}%`
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution Skeleton */}
      <Card className='@container/card' data-slot='card'>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </CardHeader>
        <CardContent>
          <div className='relative h-64 rounded-lg bg-gray-100 p-4'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='space-y-2 text-center'>
                <Skeleton className='mx-auto h-6 w-48' />
                <Skeleton className='mx-auto h-4 w-64' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
