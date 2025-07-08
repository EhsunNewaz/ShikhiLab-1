
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Flag, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { QuestionState } from '@/app/mock-tests/1/page';


interface BottomPanelProps {
  questions: QuestionState[];
  currentQuestionIndex: number; // The index of the *question group*
  totalQuestionGroups: number;
  onSelectQuestion: (questionNumber: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onReview: () => void;
  isSubmitted: boolean;
}

const partConfig = [
    { number: 1, start: 1, end: 13 },
    { number: 2, start: 14, end: 26 },
    { number: 3, start: 27, end: 40 },
];

const COMPACT_THRESHOLD_PX = 600;

export function BottomPanel({
  questions,
  currentQuestionIndex,
  totalQuestionGroups,
  onSelectQuestion,
  onPrev,
  onNext,
  onReview,
  isSubmitted,
}: BottomPanelProps) {
    
  const getPartFromIndex = (index: number) => {
    // This logic needs to be more robust based on actual question numbers, not index
    const currentQuestionNumber = questions.find(q => q.originalQuestionIndex === index)?.id;
    if (!currentQuestionNumber) return 1;
    const num = parseInt(currentQuestionNumber);
    const boundary = partConfig.find(p => num >= p.start && num <= p.end);
    return boundary ? boundary.number : 1;
  };

  const getQuestionsForPart = (partNumber: number) => {
    const boundary = partConfig.find(p => p.number === partNumber);
    if (!boundary) return [];
    return questions.filter(q => {
        const num = parseInt(q.id);
        return num >= boundary.start && num <= boundary.end;
    });
  };

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

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);
  
  if (!questions || questions.length === 0) {
    return null;
  }
  
  const currentQuestionGroupId = questions.find(q => q.originalQuestionIndex === currentQuestionIndex)?.id;
  const currentQuestionGroupIndex = questions.findIndex(q => q.id === currentQuestionGroupId);


  const renderExpandedPart = (partNumber: number) => {
    const partQuestions = getQuestionsForPart(partNumber);
    return (
        <div className="flex items-center gap-2 whitespace-nowrap p-2 rounded-md bg-white shadow-inner border border-gray-300">
            <h3 className="font-semibold text-gray-800 text-sm pl-2 pr-1">Part {partNumber}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
            {partQuestions.map((q) => {
                const isCurrent = q.originalQuestionIndex === currentQuestionIndex;
                return (
                <button
                    key={q.id}
                    onClick={() => onSelectQuestion(parseInt(q.id))}
                    disabled={isSubmitted}
                    className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-sm text-sm font-semibold transition-colors border-2',
                        {
                            'bg-white border-gray-400 text-gray-700': q.status === 'unanswered',
                            'bg-gray-700 border-gray-800 text-white': q.status === 'answered',
                            'border-blue-600': isCurrent,
                            'rounded-full !border-orange-500': q.isReviewed,
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
    const partQuestions = getQuestionsForPart(partNumber);
    const answeredCount = partQuestions.filter(q => q.status === 'answered').length;
    return (
        <Button 
            variant="outline" 
            className="bg-gray-200 border-gray-400 whitespace-nowrap h-auto py-2" 
            onClick={() => onSelectQuestion(partConfig.find(p => p.number === partNumber)?.start || 1)}
            disabled={isSubmitted}
        >
            Part {partNumber}: {answeredCount} of {partQuestions.length}
        </Button>
    )
  }

  const otherParts = partConfig.map(p => p.number).filter(p => p !== activePart);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-100 font-exam p-2 flex items-center gap-4 shadow-top h-[95px]">
        {/* Question Palette Container (Flexible) */}
        <div className="flex-1 min-w-0 overflow-x-auto" ref={containerRef}>
             <div className="flex items-center gap-3">
                {isCompact ? (
                    <>
                        {renderExpandedPart(activePart)}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-gray-200 border-gray-400 whitespace-nowrap h-auto py-2">
                                Switch Part <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            {otherParts.map(partNumber => {
                                const partQuestions = getQuestionsForPart(partNumber);
                                const answeredCount = partQuestions.filter(q => q.status === 'answered').length;
                                return (
                                <DropdownMenuItem key={partNumber} onSelect={() => onSelectQuestion(partConfig.find(p => p.number === partNumber)?.start || 1)} disabled={isSubmitted}>
                                    Part {partNumber}: {answeredCount} of {partQuestions.length} questions
                                </DropdownMenuItem>
                                )
                            })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        {partConfig.map(({ number: partNumber }) => (
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
            <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-gray-400 bg-gray-200 rounded-md" onClick={onReview} disabled={isSubmitted}>
                <Flag className="h-5 w-5 text-yellow-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn("h-10 w-10 rounded-md border-2", 
                (currentQuestionIndex === 0 || isSubmitted) ? "bg-gray-200 border-gray-400" : "bg-gray-800 border-gray-900 text-white hover:bg-gray-700"
              )} 
              onClick={onPrev} 
              disabled={currentQuestionIndex === 0 || isSubmitted}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn("h-10 w-10 rounded-md border-2",
                (currentQuestionIndex === totalQuestionGroups - 1 || isSubmitted) ? "bg-gray-200 border-gray-400" : "bg-gray-800 border-gray-900 text-white hover:bg-gray-700"
              )} 
              onClick={onNext} 
              disabled={currentQuestionIndex === totalQuestionGroups - 1 || isSubmitted}>
                <ArrowRight className="h-6 w-6" />
            </Button>
        </div>
    </footer>
  );
}
