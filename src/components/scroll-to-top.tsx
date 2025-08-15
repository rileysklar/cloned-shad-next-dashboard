'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  className?: string;
  threshold?: number;
}

export function ScrollToTop({ className, threshold = 400 }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size='sm'
      variant='outline'
      className={cn(
        'fixed right-6 bottom-6 z-50 rounded-full shadow-lg transition-all duration-200 hover:scale-105',
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur',
        'border-border/50 hover:border-border',
        className
      )}
      aria-label='Scroll to top'
    >
      <ChevronUp className='h-4 w-4' />
    </Button>
  );
}
