
'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface QuestionState {
  id: string;
  passage: number;
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
  isSubmitted: boolean;
}


const getQuestionsForPart = (questions: QuestionState[], part: number) => {
    if (!questions) return [];
    if (part === 1) return questions.slice(0, 13);
    if (part === 2) return questions.slice(13, 26);
    return questions.slice(26, 40);
}


export function BottomPanel({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  onPrev,
  onNext,
  onReview,
  isSubmitted
}: BottomPanelProps) {

  // Guard against rendering before questions are available
  if (!questions || questions.length === 0) {
    return null;
  }
  
  const renderPart = (partNumber: number) => {
    const partQuestions = getQuestionsForPart(questions, partNumber);
    
    return (
        <div className="flex items-center gap-2 whitespace-nowrap">
            <h3 className="font-semibold text-gray-800 text-sm pl-2 pr-1">Part {partNumber}</h3>
            <div className="flex items-center gap-1.5">
                {partQuestions.map((q) => {
                    const globalIndex = questions.findIndex(ques => ques.id === q.id);
                    const isCurrent = globalIndex === currentQuestionIndex;
                    return (
                        <button
                            key={q.id}
                            onClick={() => onSelectQuestion(globalIndex)}
                            disabled={isSubmitted}
                            className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-sm text-sm font-semibold transition-colors border border-gray-400',
                                {
                                    'bg-gray-700 text-white': q.status === 'unanswered',
                                    'bg-white text-gray-700 underline': q.status === 'answered',
                                    'bg-blue-600 text-white border-blue-700': isCurrent,
                                    'rounded-full !border-orange-500 border-2 !bg-gray-700 text-white': q.isReviewed && q.status === 'unanswered',
                                    'rounded-full !border-orange-500 border-2 !bg-white text-gray-700 underline': q.isReviewed && q.status === 'answered',
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
        </div>
    )
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-100 font-exam p-2 flex items-center gap-4 shadow-top">
        {/* Question Palette */}
        <div className="flex-grow bg-white p-2 rounded-md shadow-inner border border-gray-200 flex items-center relative">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-3">
              {renderPart(1)}
              <div className="h-6 w-px bg-gray-300" />
              {renderPart(2)}
              <div className="h-6 w-px bg-gray-300" />
              {renderPart(3)}
            </div>
          </ScrollArea>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 pl-2">
            <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-gray-400 bg-gray-200" onClick={onReview} disabled={isSubmitted}>
                <Flag className="h-5 w-5 text-yellow-600" />
            </Button>
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-2 border-gray-400 bg-gray-200" onClick={onPrev} disabled={currentQuestionIndex === 0 || isSubmitted}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-2 border-gray-400 bg-gray-200" onClick={onNext} disabled={currentQuestionIndex === questions.length - 1 || isSubmitted}>
                <ArrowRight className="h-6 w-6" />
            </Button>
        </div>
    </footer>
  );
}
