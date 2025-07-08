'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface QuestionState {
  id: string;
  passage: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

interface BottomPanelProps {
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  isSubmitted: boolean;
}

// Sub-component for the expanded view of a passage navigator
function PassageExpandedView({
  partNumber,
  questions,
  currentQuestionIndex,
  onSelectQuestion,
}: {
  partNumber: number;
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}) {
  return (
    <div className="border border-green-400 rounded-lg p-2 flex items-center gap-2 transition-all duration-300 bg-green-50/50 shadow-sm">
      <span className="font-bold text-gray-800 px-2">Part {partNumber}</span>
      <div className="flex items-center gap-1.5">
        {questions.map((q) => {
          const questionIndex = parseInt(q.id, 10) - 1;
          const isCurrent = questionIndex === currentQuestionIndex;
          const status = q.status;

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(questionIndex)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors border',
                {
                  'bg-white border-gray-300 text-gray-600 hover:bg-gray-100': status === 'unanswered',
                  'bg-green-600 border-green-700 text-white': status === 'answered',
                  'bg-orange-400 border-orange-500 text-white': status === 'reviewed',
                  'ring-2 ring-offset-1 ring-blue-500': isCurrent,
                }
              )}
              aria-current={isCurrent}
              aria-label={`Question ${q.id}, status: ${status}`}
            >
              {q.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Sub-component for the collapsed view of a passage navigator
function PassageCollapsedView({
  partNumber,
  answeredCount,
  totalCount,
  onSelectPart,
}: {
  partNumber: number;
  answeredCount: number;
  totalCount: number;
  onSelectPart: () => void;
}) {
  return (
    <button
      onClick={onSelectPart}
      className="border border-gray-300 rounded-lg p-2 flex items-center gap-2 hover:bg-gray-100/80 transition-all duration-300 h-full min-w-[220px] justify-center shadow-sm bg-white"
    >
      <span className="font-bold text-gray-800">Part {partNumber}:</span>
      <span className="text-sm text-gray-600">
        {answeredCount} of {totalCount} questions
      </span>
    </button>
  );
}

export function BottomPanel({ questions, currentQuestionIndex, onSelectQuestion, isSubmitted }: BottomPanelProps) {
  const passage1Questions = useMemo(() => questions.filter((q) => q.passage === 1), [questions]);
  const passage2Questions = useMemo(() => questions.filter((q) => q.passage === 2), [questions]);
  const passage3Questions = useMemo(() => questions.filter((q) => q.passage === 3), [questions]);

  const answeredInPassage1 = useMemo(() => passage1Questions.filter((q) => q.status === 'answered' || q.status === 'reviewed').length, [passage1Questions, questions]);
  const answeredInPassage2 = useMemo(() => passage2Questions.filter((q) => q.status === 'answered' || q.status === 'reviewed').length, [passage2Questions, questions]);
  const answeredInPassage3 = useMemo(() => passage3Questions.filter((q) => q.status === 'answered' || q.status === 'reviewed').length, [passage3Questions, questions]);

  const currentPassage = questions[currentQuestionIndex]?.passage;

  const handleSelectPart = (partNumber: number) => {
    if (isSubmitted) return;
    const firstQuestionOfPartIndex = questions.findIndex((q) => q.passage === partNumber);
    if (firstQuestionOfPartIndex !== -1) {
      onSelectQuestion(firstQuestionOfPartIndex);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-gray-50 font-exam p-2 flex justify-center shadow-top">
      <div className="flex items-stretch justify-center gap-3">
        {/* Part 1 Navigator */}
        <div>
          {currentPassage === 1 ? (
            <PassageExpandedView
              partNumber={1}
              questions={passage1Questions}
              currentQuestionIndex={currentQuestionIndex}
              onSelectQuestion={onSelectQuestion}
            />
          ) : (
            <PassageCollapsedView
              partNumber={1}
              answeredCount={answeredInPassage1}
              totalCount={passage1Questions.length}
              onSelectPart={() => handleSelectPart(1)}
            />
          )}
        </div>

        {/* Part 2 Navigator */}
        <div>
          {currentPassage === 2 ? (
            <PassageExpandedView
              partNumber={2}
              questions={passage2Questions}
              currentQuestionIndex={currentQuestionIndex}
              onSelectQuestion={onSelectQuestion}
            />
          ) : (
            <PassageCollapsedView
              partNumber={2}
              answeredCount={answeredInPassage2}
              totalCount={passage2Questions.length}
              onSelectPart={() => handleSelectPart(2)}
            />
          )}
        </div>

        {/* Part 3 Navigator */}
        <div>
          {currentPassage === 3 ? (
            <PassageExpandedView
              partNumber={3}
              questions={passage3Questions}
              currentQuestionIndex={currentQuestionIndex}
              onSelectQuestion={onSelectQuestion}
            />
          ) : (
            <PassageCollapsedView
              partNumber={3}
              answeredCount={answeredInPassage3}
              totalCount={passage3Questions.length}
              onSelectPart={() => handleSelectPart(3)}
            />
          )}
        </div>
      </div>
    </footer>
  );
}
