
'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';

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
    // IELTS Reading has 40 questions.
    // Part 1: Q1-13
    // Part 2: Q14-26
    // Part 3: Q27-40
    if (index < 13) return 1;
    if (index < 26) return 2;
    return 3;
}

const getQuestionsForPart = (questions: QuestionState[], part: number) => {
    if (part === 1) return questions.slice(0, 13);
    if (part === 2) return questions.slice(13, 26);
    return questions.slice(26, 40);
}

const getPartStartIndex = (part: number) => {
    if (part === 1) return 0;
    if (part === 2) return 13;
    return 26;
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
  
  const currentPart = getPartFromQuestionIndex(currentQuestionIndex);
  
  const answeredCount = (part: number) => {
    const partQuestions = getQuestionsForPart(questions, part);
    return partQuestions.filter(q => q.status === 'answered').length;
  }
  const totalInPart = (part: number) => getQuestionsForPart(questions, part).length;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-100 font-exam p-3 flex items-stretch gap-4 shadow-top">
        {/* Question Palette */}
        <div className="flex-grow flex items-stretch gap-2">
             {[1, 2, 3].map(partNumber => {
                const isCurrentPart = partNumber === currentPart;
                
                if (isCurrentPart) {
                    const partQuestions = getQuestionsForPart(questions, partNumber);
                    return (
                        <div key={partNumber} className="flex-1 bg-white p-3 rounded-md shadow-md border border-gray-200 flex flex-col gap-3">
                            <h3 className="font-semibold text-gray-800">Part {partNumber}</h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
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

                // Render collapsed summary tab
                return (
                    <button 
                        key={partNumber}
                        onClick={() => onSelectQuestion(getPartStartIndex(partNumber))}
                        disabled={isSubmitted}
                        className="bg-white p-3 rounded-md shadow-md border border-gray-200 hover:bg-gray-50 flex flex-col justify-center text-left"
                    >
                       <h3 className="font-semibold text-gray-800">Part {partNumber}</h3>
                       <p className="text-sm text-muted-foreground">{answeredCount(partNumber)} / {totalInPart(partNumber)} questions answered</p>
                    </button>
                )
            })}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
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
