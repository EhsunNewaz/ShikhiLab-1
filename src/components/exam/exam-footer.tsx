
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionState {
  id: string;
  status: 'unanswered' | 'answered' | 'reviewed';
}

interface ExamFooterProps {
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

export function ExamFooter({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
}: ExamFooterProps) {
  
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 grid h-[60px] grid-cols-3 items-center border-t-2 border-exam-border-light bg-[#e8e8e8] px-6 text-exam-text font-exam"
      role="navigation"
      aria-label="Test Navigation"
    >
      {/* Left Side: Question Navigation */}
      <div className="flex items-center gap-4">
        <span className="font-bold">Part 1</span>
        <div className="flex items-center gap-1 overflow-x-auto rounded border border-gray-400 bg-white p-1">
          {questions.slice(0, 13).map((q, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isReviewed = q.status === 'reviewed';
            const isAnswered = q.status === 'answered';

            const buttonClasses = cn(
              'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-xs font-bold transition-colors hover:bg-gray-200',
              {
                'bg-white text-black': q.status === 'unanswered',
                'bg-gray-500 text-white': isAnswered,
                'border-2 border-exam-green': isCurrent,
                'rounded-full !bg-exam-yellow': isReviewed,
              }
            );

            return (
              <button
                key={q.id}
                className={buttonClasses}
                onClick={() => onSelectQuestion(index)}
                aria-selected={isCurrent}
              >
                {q.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center & Right: Other Parts Info */}
      <div className="col-span-2 flex justify-end gap-4">
        <Button variant="outline" className="rounded-md bg-white text-black cursor-default">Part 2: 0 of 13 questions</Button>
        <Button variant="outline" className="rounded-md bg-white text-black cursor-default">Part 3: 0 of 14 questions</Button>
      </div>
    </footer>
  );
}
