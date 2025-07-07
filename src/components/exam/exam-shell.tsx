
import type { ReactNode } from 'react';
import { ExamHeader } from './exam-header';
import { ExamFooter } from './exam-footer';
import { cn } from '@/lib/utils';

interface QuestionState {
  id: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

interface ExamShellProps {
  children: ReactNode;
  onTimeUp: () => void;
  isLocked: boolean;
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onToggleReview: () => void;
}

export function ExamShell({
  children,
  onTimeUp,
  isLocked,
  ...footerProps
}: ExamShellProps) {
  return (
    <div
      className={cn('h-screen w-screen bg-[#f5f5f5] font-sans text-gray-800', {
        'pointer-events-none opacity-75': isLocked,
      })}
    >
      <ExamHeader onTimeUp={onTimeUp} />

      {/* Main Content Area */}
      <main className="h-full overflow-y-auto bg-white pt-[60px] pb-[60px]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <ExamFooter {...footerProps} />
    </div>
  );
}
