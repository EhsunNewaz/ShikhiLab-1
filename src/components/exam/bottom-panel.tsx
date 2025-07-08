
'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Flag, CheckCircle } from 'lucide-react';

interface QuestionState {
  id: string;
  status: 'unanswered' | 'answered';
  isReviewed: boolean;
}

interface BottomPanelProps {
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onReview: () => void;
  onSubmit: () => void;
  isSubmitted: boolean;
}

export function BottomPanel({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  onPrev,
  onNext,
  onReview,
  onSubmit,
  isSubmitted
}: BottomPanelProps) {
  
  const answeredCount = useMemo(() => {
    return questions.filter(q => q.status === 'answered').length;
  }, [questions]);
  
  const currentQuestionId = questions[currentQuestionIndex].id;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-100 font-exam p-3 flex flex-col gap-3 shadow-top">
        <div className="flex justify-between items-center">
             {/* Question Palette */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, index) => {
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => onSelectQuestion(index)}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center text-sm font-semibold transition-colors border border-gray-400 bg-gray-200',
                        {
                          'underline': q.status === 'answered',
                          'bg-blue-600 text-white border-blue-700': isCurrent,
                          'rounded-full !border-orange-500 border-2': q.isReviewed,
                        }
                      )}
                      aria-current={isCurrent}
                      aria-label={`Question ${q.id}, status: ${q.status}`}
                    >
                      {q.id}
                    </button>
                  );
                })}
            </div>
            <Button className="h-9 rounded-md" onClick={onSubmit} disabled={isSubmitted}>
                <CheckCircle className="mr-2" />
                Submit
            </Button>
        </div>
       
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <Button className="h-9 rounded-md" variant="outline" onClick={onReview}>
                    <Flag className="mr-2" />
                    Review
                </Button>
                 <p className="text-sm font-semibold text-gray-700">Question {currentQuestionId} of {questions.length}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button className="h-9 rounded-md" variant="outline" onClick={onPrev} disabled={currentQuestionIndex === 0}>
                    <ArrowLeft className="mr-2" />
                    Previous
                </Button>
                <Button className="h-9 rounded-md" variant="outline" onClick={onNext} disabled={currentQuestionIndex === questions.length - 1}>
                    Next
                    <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    </footer>
  );
}
