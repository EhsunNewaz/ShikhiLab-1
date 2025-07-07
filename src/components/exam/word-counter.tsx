
'use client';

import { cn } from '@/lib/utils';

interface WordCounterProps {
  wordCount: number;
  min: number;
}

export function WordCounter({ wordCount, min }: WordCounterProps) {
  const isBelowMin = wordCount > 0 && wordCount < min;
  const isAtTarget = wordCount >= min;

  const colorClass = cn({
    'text-red-500': isBelowMin,
    'text-green-600': isAtTarget,
    'text-muted-foreground': wordCount === 0,
  });

  return (
    <div className={cn('text-sm font-medium', colorClass)}>
      Words: {wordCount}
    </div>
  );
}
