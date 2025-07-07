
'use client';

import { useState } from 'react';
import { ExamShell } from '@/components/exam/exam-shell';

interface QuestionState {
  id: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

const initialQuestions: QuestionState[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  status: 'unanswered',
}));

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
        
        // This is a simple toggle. A more advanced version might remember the pre-review state.
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
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">IELTS Mock Test - Question {currentQuestionIndex + 1}</h1>
        <p>This is the main content area where the test passage and questions will be rendered.</p>
        <div className="mt-6 space-y-4">
          <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          <div className="h-24 w-3/4 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
        </div>
        <div className="mt-8">
          <Button onClick={handleAnswerCurrentQuestion} disabled={isLocked}>
            Mark as Answered (Demo)
          </Button>
        </div>
      </div>
    </ExamShell>
  );
}
