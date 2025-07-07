
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Flag, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

interface QuestionState {
  id: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

interface ExamFooterProps {
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onToggleReview: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function ExamFooter({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  onNextQuestion,
  onPrevQuestion,
  onToggleReview,
  isMinimized,
  onToggleMinimize,
}: ExamFooterProps) {

  if (isMinimized) {
    return (
       <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-[30px] items-center justify-end border-t-2 border-exam-border-light bg-[#e8e8e8] px-6 font-exam">
        <Button
          style={{ width: 'auto', height: '100%' }}
          className="rounded-[4px] border-none bg-exam-yellow text-black hover:bg-exam-yellow/90"
          onClick={onToggleMinimize}
        >
          <ArrowUp className="mr-2" />
          Show
        </Button>
      </footer>
    )
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-t-2 border-exam-border-light bg-[#e8e8e8] px-6 text-exam-text font-exam">
      {/* Left Side: Review Button */}
      <Button
        style={{ width: '80px', height: '40px' }}
        className="rounded-[4px] border-none bg-exam-orange text-white hover:bg-exam-orange/90"
        onClick={onToggleReview}
      >
        <Flag className="mr-2" />
        Review
      </Button>

      {/* Center: Navigation */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
        <Button
          style={{ width: '50px', height: '40px' }}
          className="rounded-[4px] border-none bg-exam-blue p-0 text-white hover:bg-exam-blue/90 disabled:bg-[#cccccc] disabled:opacity-100"
          onClick={onPrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft />
        </Button>

        {/* Question Numbers Grid */}
        <div className="flex h-10 max-w-sm items-center gap-1 overflow-x-auto rounded border border-gray-400 bg-white p-1">
          {questions.map((q, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isReviewed = q.status === 'reviewed';
            const isAnswered = q.status === 'answered';

            const buttonClasses = cn(
              'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-xs font-bold transition-colors hover:bg-gray-200 relative',
              {
                'rounded-[2px]': !isReviewed,
                'rounded-full': isReviewed,
                'bg-white border border-gray-300 text-black': q.status === 'unanswered',
                'bg-exam-green text-white': isAnswered,
                'bg-exam-yellow border-2 border-exam-orange text-black': isCurrent,
              }
            );

            return (
              <button key={q.id} className={buttonClasses} onClick={() => onSelectQuestion(index)}>
                {q.id}
                {isAnswered && <div className="absolute bottom-0 h-0.5 w-4/5 bg-white" />}
              </button>
            );
          })}
        </div>

        <Button
          style={{ width: '50px', height: '40px' }}
          className="rounded-[4px] border-none bg-exam-blue p-0 text-white hover:bg-exam-blue/90 disabled:bg-[#cccccc] disabled:opacity-100"
          onClick={onNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Right Side: Minimize */}
      <Button
        style={{ width: '40px', height: '40px' }}
        variant="outline"
        className="rounded-[4px] border-none bg-exam-yellow p-0 text-black hover:bg-exam-yellow/90"
        onClick={onToggleMinimize}
      >
        <ChevronDown />
      </Button>
    </footer>
  );
}
