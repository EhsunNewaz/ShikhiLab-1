
'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Flag, ArrowUp, ChevronDown, Send } from 'lucide-react';

interface QuestionState {
  id: string;
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
  onSubmit: () => void;
  isSubmitted: boolean;
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
  onSubmit,
  isSubmitted,
}: ExamFooterProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Ensure the questionButtonRefs array is the correct size
  useEffect(() => {
    questionButtonRefs.current = questionButtonRefs.current.slice(0, questions.length);
  }, [questions]);

  // Effect to focus the current question button when the index changes, if the grid has focus
  useEffect(() => {
    if (gridRef.current && document.activeElement && gridRef.current.contains(document.activeElement)) {
      questionButtonRefs.current[currentQuestionIndex]?.focus();
    }
  }, [currentQuestionIndex]);

  const handleGridFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    // If focus moves to the container, immediately focus the selected button
    if (e.target === gridRef.current) {
        questionButtonRefs.current[currentQuestionIndex]?.focus();
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newIndex = currentQuestionIndex;
    let keyHandled = true;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = Math.min(currentQuestionIndex + 1, questions.length - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentQuestionIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = questions.length - 1;
        break;
      default:
        keyHandled = false;
        break;
    }

    if (keyHandled) {
      e.preventDefault(); // Prevent page scroll on arrow keys
      if (newIndex !== currentQuestionIndex) {
        onSelectQuestion(newIndex);
      }
    }
  };

  if (isMinimized) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-[30px] items-center justify-end border-t-2 border-exam-border-light bg-[#e8e8e8] px-6 font-exam">
        <Button
          style={{ width: 'auto', height: '100%' }}
          className="rounded-4px border-none bg-exam-yellow text-black hover:bg-exam-yellow/90"
          onClick={onToggleMinimize}
          aria-label="Show navigation"
        >
          <ArrowUp className="mr-2" />
          Show
        </Button>
      </footer>
    );
  }

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-t-2 border-exam-border-light bg-[#e8e8e8] px-6 text-exam-text font-exam"
      role="navigation"
      aria-label="Test Navigation"
    >
      {/* Left Side: Review Button */}
      <Button
        style={{ width: 'auto', height: '40px' }}
        className="rounded-4px border-none bg-exam-orange px-4 text-white hover:bg-exam-orange-hover"
        onClick={onToggleReview}
        disabled={isSubmitted}
      >
        <Flag className="mr-2" />
        Review
      </Button>

      {/* Center: Navigation */}
      <div className="flex items-center gap-2">
        <Button
          style={{ width: '50px', height: '40px' }}
          className="rounded-4px border-none bg-exam-blue p-0 text-white hover:bg-exam-blue-hover disabled:bg-[#cccccc] disabled:opacity-100"
          onClick={onPrevQuestion}
          disabled={currentQuestionIndex === 0}
          aria-label="Previous question"
        >
          <ChevronLeft />
        </Button>

        {/* Question Numbers Grid */}
        <div
          ref={gridRef}
          onFocus={handleGridFocus}
          onKeyDown={handleGridKeyDown}
          tabIndex={0}
          role="grid"
          aria-label="Question selector"
          className="flex h-10 max-w-sm items-center gap-1 overflow-x-auto rounded border border-gray-400 bg-white p-1"
        >
          {questions.map((q, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isReviewed = q.status === 'reviewed';
            const isAnswered = q.status === 'answered';

            const buttonClasses = cn(
              'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-xs font-bold transition-colors hover:bg-gray-200 relative',
              {
                'rounded-4px': !isReviewed,
                'rounded-full': isReviewed,
                'bg-white border border-gray-300 text-black': q.status === 'unanswered',
                'bg-exam-green text-white': isAnswered,
                'bg-exam-yellow border-2 border-exam-orange text-black': isCurrent,
              }
            );

            return (
              <button
                key={q.id}
                ref={(el) => (questionButtonRefs.current[index] = el)}
                className={buttonClasses}
                onClick={() => onSelectQuestion(index)}
                tabIndex={-1}
                role="gridcell"
                aria-selected={isCurrent}
              >
                {q.id}
                {isAnswered && <div className="absolute bottom-0 h-0.5 w-4/5 bg-white" />}
              </button>
            );
          })}
        </div>

        <Button
          style={{ width: '50px', height: '40px' }}
          className="rounded-4px border-none bg-exam-blue p-0 text-white hover:bg-exam-blue-hover disabled:bg-[#cccccc] disabled:opacity-100"
          onClick={onNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          aria-label="Next question"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Right Side: Minimize & Submit */}
      <div className="flex items-center gap-2">
         <Button
            style={{ width: 'auto', height: '40px' }}
            className="rounded-4px border-none bg-exam-green px-4 text-white hover:bg-exam-green-hover"
            onClick={onSubmit}
            disabled={isSubmitted}
          >
            <Send className="mr-2" />
            Submit Test
          </Button>
          <Button
            style={{ width: '40px', height: '40px' }}
            variant="outline"
            className="rounded-4px border-none bg-exam-yellow p-0 text-black hover:bg-exam-yellow/90"
            onClick={onToggleMinimize}
            aria-label="Minimize navigation"
          >
            <ChevronDown />
          </Button>
      </div>
    </footer>
  );
}
