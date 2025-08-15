import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TrafficMapSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Map Controls Skeleton */}
      <div className='flex flex-wrap gap-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-24' />
        ))}
      </div>

      {/* Map Container Skeleton */}
      <Card className='overflow-hidden'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2'>
            <Skeleton className='h-5 w-5' />
            <Skeleton className='h-6 w-40' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-32' />
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <Skeleton className='h-[600px] w-full' />
        </CardContent>
      </Card>

      {/* Legend Skeleton */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>
            <Skeleton className='h-4 w-20' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='h-4 w-4 rounded-full' />
                <Skeleton className='h-4 w-16' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
