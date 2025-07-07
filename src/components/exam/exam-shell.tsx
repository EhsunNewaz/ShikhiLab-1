
import type { ReactNode } from 'react';
import { ExamHeader } from './exam-header';
import { cn } from '@/lib/utils';

interface ExamShellProps {
  children: ReactNode;
  onTimeUp: () => void;
  isLocked: boolean;
}

export function ExamShell({ children, onTimeUp, isLocked }: ExamShellProps) {
  return (
    <div className={cn("h-screen w-screen bg-[#f5f5f5] font-sans text-gray-800", { 'pointer-events-none opacity-75': isLocked })}>
      <ExamHeader onTimeUp={onTimeUp} />

      {/* Main Content Area */}
      <main className="h-full overflow-y-auto bg-white pt-[60px] pb-[60px]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-t border-gray-300 bg-[#f5f5f5] px-6">
        {/* Left Side: Review Placeholder */}
        <div className="rounded border border-gray-400 p-2 text-sm">
            [Review]
        </div>

        {/* Center: Navigation */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <div className="rounded border border-gray-400 p-2 text-sm">
                [← Back]
            </div>
            
            {/* Question Numbers Placeholder */}
            <div className="flex h-10 max-w-sm items-center gap-1 overflow-x-auto rounded border border-gray-400 bg-white p-1">
                {Array.from({ length: 40 }, (_, i) => (
                    <div key={i + 1} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-gray-300 text-xs">
                        {i + 1}
                    </div>
                ))}
            </div>

            <div className="rounded border border-gray-400 p-2 text-sm">
                [Next →]
            </div>
        </div>
        
        {/* Right Side: Minimize Placeholder */}
        <div className="rounded border border-gray-400 p-2 text-sm">
            [▼ Minimize]
        </div>
      </footer>
    </div>
  );
}
