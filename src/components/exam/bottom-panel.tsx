
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

const partConfig = [
    { number: 1, size: 13 },
    { number: 2, size: 13 },
    { number: 3, size: 14 },
];

const COMPACT_THRESHOLD_PX = 450;

export function BottomPanel({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  onPrev,
  onNext,
  onReview,
  isSubmitted,
}: BottomPanelProps) {
    
  const partBoundaries = useMemo(() => {
    const boundaries: { part: number, start: number, end: number }[] = [];
    let cumulativeSize = 0;
    partConfig.forEach(p => {
        boundaries.push({
            part: p.number,
            start: cumulativeSize,
            end: cumulativeSize + p.size,
        });
        cumulativeSize += p.size;
    });
    return boundaries;
  }, []);

  const getPartFromIndex = (index: number) => {
    const boundary = partBoundaries.find(p => index >= p.start && index < p.end);
    return boundary ? boundary.part : 1;
  };

  const getQuestionsForPart = (part: number) => {
    if (!questions) return [];
    const boundary = partBoundaries.find(p => p.part === part);
    if (!boundary) return [];
    return questions.slice(boundary.start, boundary.end);
  };

  const getStartIndexForPart = (part: number) => {
    const boundary = partBoundaries.find(p => p.part === part);
    return boundary ? boundary.start : 0;
  }

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
    const partQuestions = getQuestionsForPart(partNumber);
    const startIndex = getStartIndexForPart(partNumber);
    return (
        <div className="flex items-center gap-2 whitespace-nowrap p-2 rounded-md bg-white shadow-inner border border-gray-300">
            <h3 className="font-semibold text-gray-800 text-sm pl-2 pr-1">Part {partNumber}</h3>
            <div className="flex items-center gap-1.5">
            {partQuestions.map((q, i) => {
                const globalIndex = startIndex + i;
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
    const partQuestions = getQuestionsForPart(partNumber);
    const answeredCount = partQuestions.filter(q => q.status === 'answered').length;
    return (
        <Button 
            variant="outline" 
            className="bg-gray-200 border-gray-400 whitespace-nowrap" 
            onClick={() => onSelectQuestion(getStartIndexForPart(partNumber))}
            disabled={isSubmitted}
        >
            Part {partNumber}: {answeredCount} of {partQuestions.length}
        </Button>
    )
  }

  const otherParts = partConfig.map(p => p.number).filter(p => p !== activePart);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-100 font-exam p-2 flex items-center gap-4 shadow-top">
        {/* Question Palette Container (Flexible) */}
        <div className="flex-1 min-w-0 overflow-hidden" ref={containerRef}>
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
                                const partQuestions = getQuestionsForPart(partNumber);
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
