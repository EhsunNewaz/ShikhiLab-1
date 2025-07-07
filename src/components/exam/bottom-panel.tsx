
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useMemo } from 'react';
import { ScrollArea } from '../ui/scroll-area';

interface QuestionState {
  id: string;
  passage: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

interface BottomPanelProps {
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleReview: () => void;
  isSubmitted: boolean;
}

function QuestionGrid({ questions, currentQuestionIndex, onSelectQuestion }: { questions: QuestionState[], currentQuestionIndex: number, onSelectQuestion: (index: number) => void }) {
    return (
        <div className="grid grid-cols-10 gap-2 p-1">
            {questions.map((q) => {
                const questionIndex = parseInt(q.id, 10) - 1;
                const isCurrent = questionIndex === currentQuestionIndex;
                const status = q.status;

                return (
                    <button
                        key={q.id}
                        onClick={() => onSelectQuestion(questionIndex)}
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-colors',
                            {
                                'bg-[#E5E5E5] text-black hover:bg-gray-300': status === 'unanswered',
                                'bg-[#28B463] text-white hover:bg-green-600': status === 'answered',
                                'bg-[#F39C12] text-white hover:bg-orange-500': status === 'reviewed', // Flagged
                                'ring-2 ring-offset-1 ring-[#3498DB]': isCurrent,
                            }
                        )}
                        aria-current={isCurrent}
                        aria-label={`Question ${q.id}, status: ${status}`}
                    >
                        {q.id}
                    </button>
                )
            })}
        </div>
    )
}

export function BottomPanel({ questions, currentQuestionIndex, onSelectQuestion, onPrev, onNext, onToggleReview, isSubmitted }: BottomPanelProps) {
  const passage1Questions = useMemo(() => questions.filter(q => q.passage === 1), [questions]);
  const passage2Questions = useMemo(() => questions.filter(q => q.passage === 2), [questions]);
  const passage3Questions = useMemo(() => questions.filter(q => q.passage === 3), [questions]);

  const answeredCount = useMemo(() => questions.filter(q => q.status === 'answered' || q.status === 'reviewed').length, [questions]);

  const currentPassage = questions[currentQuestionIndex].passage;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.05)] font-exam p-2">
      <div className="container mx-auto flex items-start justify-between gap-4">
        {/* Left Actions & Info */}
        <div className="flex flex-col items-center gap-2 pt-2">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={onPrev} disabled={currentQuestionIndex === 0} aria-label="Previous Question">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={onNext} disabled={currentQuestionIndex === questions.length - 1} aria-label="Next Question">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
             <Button variant="outline" onClick={onToggleReview} disabled={isSubmitted} className="gap-2 w-full">
                <Flag className="h-4 w-4"/>
                Review
            </Button>
        </div>
        
        {/* Center Question Palette */}
        <div className="flex-1">
             <Tabs defaultValue={`passage${currentPassage}`} value={`passage${currentPassage}`} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="passage1">Questions 1-13</TabsTrigger>
                    <TabsTrigger value="passage2">Questions 14-26</TabsTrigger>
                    <TabsTrigger value="passage3">Questions 27-40</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[120px] mt-2">
                  <TabsContent value="passage1">
                    <QuestionGrid questions={passage1Questions} currentQuestionIndex={currentQuestionIndex} onSelectQuestion={onSelectQuestion} />
                  </TabsContent>
                  <TabsContent value="passage2">
                      <QuestionGrid questions={passage2Questions} currentQuestionIndex={currentQuestionIndex} onSelectQuestion={onSelectQuestion} />
                  </TabsContent>
                  <TabsContent value="passage3">
                      <QuestionGrid questions={passage3Questions} currentQuestionIndex={currentQuestionIndex} onSelectQuestion={onSelectQuestion} />
                  </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>

        {/* Right Info */}
        <div className="w-48 text-right pt-2">
            <p className="font-semibold">Progress:</p>
            <p>{answeredCount} of {questions.length} answered</p>
        </div>
      </div>
    </footer>
  );
}
