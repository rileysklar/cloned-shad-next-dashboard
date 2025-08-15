'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const GameBoard = dynamic(
  () => import('@/features/farkle/components/GameBoard'),
  { ssr: false }
) as React.FC;

export default function FarklePage() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center'>
      <GameBoard />
    </div>
  );
}
