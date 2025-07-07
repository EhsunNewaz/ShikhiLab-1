
'use client';

import { useState } from 'react';
import { ExamShell } from '@/components/exam/exam-shell';
import { SplitScreenLayout } from '@/components/exam/split-screen-layout';
import { InteractivePassage } from '@/components/exam/interactive-passage';
import { readingTestData } from '@/lib/course-data';
import { Button } from '@/components/ui/button';

interface QuestionState {
  id: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

const initialQuestions: QuestionState[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  status: 'unanswered',
}));

// Get the first reading test for demonstration
const readingTest = readingTestData[0];

export default function MockTestPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [questions, setQuestions] = useState<QuestionState[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleTimeUp = () => {
    console.log('Time is up! Interface is now locked.');
    setIsLocked(true);
  };

  const handleSelectQuestion = (index: number) => {
    if (!isLocked) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNextQuestion = () => {
    if (!isLocked) {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  };

  const handlePrevQuestion = () => {
    if (!isLocked) {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleToggleReview = () => {
    if (!isLocked) {
      setQuestions((prev) => {
        const newQuestions = [...prev];
        const currentQuestion = newQuestions[currentQuestionIndex];
        
        // A more advanced version might remember the pre-review state.
        // For now, we revert to unanswered.
        if (currentQuestion.status === 'reviewed') {
          currentQuestion.status = 'unanswered'; 
        } else {
          currentQuestion.status = 'reviewed';
        }
        return newQuestions;
      });
    }
  };

  // Helper to demonstrate answering a question, which updates the grid
  const handleAnswerCurrentQuestion = () => {
    if (questions[currentQuestionIndex].status === 'unanswered') {
      setQuestions((prev) => {
        const newQuestions = [...prev];
        newQuestions[currentQuestionIndex].status = 'answered';
        return newQuestions;
      });
    }
  };

  // Placeholder for the right panel content
  const RightPanelContent = () => (
    <div>
      <h2 className="mb-4 text-xl font-bold">Questions {currentQuestionIndex + 1} - {currentQuestionIndex + 5}</h2>
      <p className="mb-4">Choose the correct letter, A, B, C or D.</p>
      <div className="space-y-6">
        <div className="space-y-2">
            <p className="font-semibold">{currentQuestionIndex + 1}. This is a placeholder for the first question based on the passage.</p>
            {/* Options would be rendered here */}
        </div>
        <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
        <div className="h-24 w-3/4 animate-pulse rounded-lg bg-gray-100"></div>
        <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
      </div>
      <div className="mt-8">
        <Button onClick={handleAnswerCurrentQuestion} disabled={isLocked} className="bg-exam-blue text-white hover:bg-exam-blue/90 rounded-sm">
          Mark as Answered (Demo)
        </Button>
      </div>
    </div>
  );

  return (
    <ExamShell
      onTimeUp={handleTimeUp}
      isLocked={isLocked}
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      onSelectQuestion={handleSelectQuestion}
      onNextQuestion={handleNextQuestion}
      onPrevQuestion={handlePrevQuestion}
      onToggleReview={handleToggleReview}
    >
      <SplitScreenLayout
        leftPanel={<InteractivePassage text={readingTest.passage} />}
        rightPanel={<RightPanelContent />}
      />
    </ExamShell>
  );
}
