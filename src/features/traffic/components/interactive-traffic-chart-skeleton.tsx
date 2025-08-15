import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function InteractiveTrafficChartSkeleton() {
  return (
    <Card className='@container/card min-h-[400px] !pt-3' data-slot='card'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <Skeleton className='h-6 w-64' />
          <Skeleton className='h-4 w-80' />
        </div>
        <div className='flex'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
            >
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-8 w-20 sm:h-10' />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <div className='flex aspect-auto h-[250px] w-full items-end justify-around gap-2 pt-8'>
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
  );
}
