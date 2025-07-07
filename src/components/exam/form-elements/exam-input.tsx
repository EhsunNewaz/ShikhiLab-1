
'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const ExamInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        style={{
          width: '200px',
          height: '32px',
        }}
        className={cn(
          'font-exam text-sm rounded-[4px] border border-exam-border-light bg-white px-2 py-1',
          'focus:border-exam-green focus:outline-none focus:shadow-[0_0_3px_rgba(76,175,80,0.3)]',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ExamInput.displayName = 'ExamInput';

export { ExamInput };
