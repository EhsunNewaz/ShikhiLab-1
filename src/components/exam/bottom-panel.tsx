
'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


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

const getPartFromQuestionIndex = (index: number) => {
    if (index < 13) return 1;
    if (index < 26) return 2;
    return 3;
}

const getQuestionsForPart = (questions: QuestionState[], part: number) => {
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

  const currentPart = getPartFromQuestionIndex(currentQuestionIndex);
  
  const answeredCount = (part: number) => getQuestionsForPart(questions, part).filter(q => q.status === 'answered').length;
  const totalInPart = (part: number) => getQuestionsForPart(questions, part).length;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-100 font-exam p-3 flex flex-col gap-3 shadow-top">
        <div className="flex justify-between items-stretch">
            {/* Question Palette */}
            <div className="flex-grow">
                 <Accordion type="single" collapsible className="w-full" value={`part-${currentPart}`}>
                    {[1, 2, 3].map(partNumber => {
                        const isCurrentPart = partNumber === currentPart;
                        const partQuestions = getQuestionsForPart(questions, partNumber);
                        
                        return (
                            <AccordionItem value={`part-${partNumber}`} key={partNumber} className="border-b-0">
                                <AccordionTrigger className="p-2 hover:no-underline data-[state=closed]:flex-grow-0 data-[state=open]:bg-white data-[state=open]:shadow-md rounded-t-md">
                                    <div className="flex justify-between w-full items-center">
                                        <span className="font-semibold">Part {partNumber}</span>
                                        {!isCurrentPart && <span className="text-sm text-muted-foreground font-normal">{answeredCount(partNumber)} / {totalInPart(partNumber)} questions answered</span>}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-white p-3 rounded-b-md shadow-md">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {partQuestions.map((q) => {
                                        const globalIndex = questions.findIndex(ques => ques.id === q.id);
                                        const isCurrent = globalIndex === currentQuestionIndex;
                                        return (
                                            <button
                                            key={q.id}
                                            onClick={() => onSelectQuestion(globalIndex)}
                                            className={cn(
                                                'flex h-7 w-7 items-center justify-center text-sm font-semibold transition-colors border border-gray-400 bg-gray-200',
                                                {
                                                'underline': q.status === 'answered',
                                                'bg-blue-600 text-white border-blue-700': isCurrent,
                                                'rounded-full !border-orange-500 border-2': q.isReviewed,
                                                'bg-green-600 text-white': q.status === 'answered' && !isCurrent,
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
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 pl-4">
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
        </div>
    </footer>
  );
}
