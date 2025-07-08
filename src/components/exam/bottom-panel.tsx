
'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Flag, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const getPartFromIndex = (index: number): number => {
  if (index < 13) return 1;
  if (index < 26) return 2;
  return 3;
};

const getQuestionsForPart = (questions: QuestionState[], part: number): QuestionState[] => {
    if (!questions || questions.length === 0) return [];
    if (part === 1) return questions.slice(0, 13);
    if (part === 2) return questions.slice(13, 26);
    return questions.slice(26, 40);
};

const getStartIndexForPart = (part: number): number => {
    if (part === 1) return 0;
    if (part === 2) return 13;
    return 26;
}

const COMPACT_THRESHOLD_PX = 600;

export function BottomPanel({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  onPrev,
  onNext,
  onReview,
  isSubmitted,
}: BottomPanelProps) {

  const [activePart, setActivePart] = useState(getPartFromIndex(currentQuestionIndex));
  const [isCompact, setIsCompact] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActivePart(getPartFromIndex(currentQuestionIndex));
  }, [currentQuestionIndex]);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        setIsCompact(newWidth < COMPACT_THRESHOLD_PX);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  if (!questions || questions.length === 0) {
    return null;
  }

  const renderExpandedPart = (partNumber: number) => {
    const partQuestions = getQuestionsForPart(questions, partNumber);
    return (
        <div className="flex items-center gap-2 whitespace-nowrap p-2 rounded-md bg-white shadow-inner border border-gray-300">
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

  const renderCollapsedPart = (partNumber: number) => {
    const partQuestions = getQuestionsForPart(questions, partNumber);
    const answeredCount = partQuestions.filter(q => q.status === 'answered').length;
    return (
        <Button 
            variant="outline" 
            className="bg-gray-200 border-gray-400 whitespace-nowrap" 
            onClick={() => onSelectQuestion(getStartIndexForPart(partNumber))}
            disabled={isSubmitted}
        >
            Part {partNumber}: {answeredCount} of {partQuestions.length} questions
        </Button>
    )
  }

  const otherParts = [1, 2, 3].filter(p => p !== activePart);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-100 font-exam p-2 flex items-center gap-4 shadow-top">
        {/* Question Palette Container (Flexible) */}
        <div className="flex-1 min-w-0" ref={containerRef}>
             <div className="flex items-center gap-3">
                {isCompact ? (
                    <>
                        {renderExpandedPart(activePart)}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-gray-200 border-gray-400 whitespace-nowrap">
                                Switch Part <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            {otherParts.map(partNumber => {
                                const partQuestions = getQuestionsForPart(questions, partNumber);
                                const answeredCount = partQuestions.filter(q => q.status === 'answered').length;
                                return (
                                <DropdownMenuItem key={partNumber} onSelect={() => onSelectQuestion(getStartIndexForPart(partNumber))} disabled={isSubmitted}>
                                    Part {partNumber}: {answeredCount} of {partQuestions.length} questions
                                </DropdownMenuItem>
                                )
                            })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        {[1, 2, 3].map(partNumber => (
                            <div key={partNumber}>
                                {partNumber === activePart ? renderExpandedPart(partNumber) : renderCollapsedPart(partNumber)}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>

        {/* Action Button Container (Fixed) */}
        <div className="flex-shrink-0 flex items-center gap-3 pr-2">
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
