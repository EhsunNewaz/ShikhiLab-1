
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
}

export function ExamFooter({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  onNextQuestion,
  onPrevQuestion,
  onToggleReview,
}: ExamFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-t border-gray-300 bg-[#f5f5f5] px-6 text-gray-800">
      {/* Left Side: Review Button */}
      <Button variant="outline" className="border-gray-400 bg-white" onClick={onToggleReview}>
        Review
      </Button>

      {/* Center: Navigation */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
        <Button
          variant="outline"
          className="border-gray-400 bg-white"
          onClick={onPrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          ← Back
        </Button>

        {/* Question Numbers Grid */}
        <div className="flex h-10 max-w-sm items-center gap-1 overflow-x-auto rounded border border-gray-400 bg-white p-1">
          {questions.map((q, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isReviewed = q.status === 'reviewed';

            const buttonClasses = cn(
              'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-gray-300 text-xs transition-colors hover:bg-gray-200',
              {
                'bg-gray-800 text-white font-bold hover:bg-gray-700': isCurrent,
                'bg-gray-200': q.status === 'answered' && !isCurrent,
                'rounded-full border-2 border-gray-800 font-bold': isReviewed,
              }
            );

            return (
              <button key={q.id} className={buttonClasses} onClick={() => onSelectQuestion(index)}>
                {q.id}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="border-gray-400 bg-white"
          onClick={onNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next →
        </Button>
      </div>

      {/* Right Side: Minimize Placeholder */}
      <Button variant="outline" className="border-gray-400 bg-white">
        ▼ Minimize
      </Button>
    </footer>
  );
}
