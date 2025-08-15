import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true,
  className = ''
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className={`h-[calc(100dvh-52px)] ${className}`}>
          <div className='flex flex-1'>{children}</div>
        </ScrollArea>
      ) : (
        <div className={`flex flex-1 ${className}`}>{children}</div>
      )}
    </>
  );
}
