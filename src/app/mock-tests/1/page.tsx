
'use client';

import { useState, useEffect } from 'react';
import { ExamShell } from '@/components/exam/exam-shell';
import { SplitScreenLayout } from '@/components/exam/split-screen-layout';
import { InteractivePassage } from '@/components/exam/interactive-passage';
import { readingTestData, type ReadingQuestion as ReadingQuestionData } from '@/lib/course-data';
import { ExamInput } from '@/components/exam/form-elements/exam-input';
import { ExamRadioGroup, ExamRadioGroupItem } from '@/components/exam/form-elements/exam-radio-group';
import { ExamCheckbox } from '@/components/exam/form-elements/exam-checkbox';
import { cn } from '@/lib/utils';

// We combine the static question data with a dynamic 'status'
interface QuestionState extends ReadingQuestionData {
  status: 'unanswered' | 'answered' | 'reviewed';
}

// Initialize question state from static data
const initialQuestions: QuestionState[] = readingTestData[0].questions.map(q => ({
  ...q,
  status: 'unanswered',
}));

// Get the first reading test for demonstration
const readingTest = readingTestData[0];


// Component to render a single question based on its type
function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
}: {
  question: QuestionState;
  answer: any;
  onAnswerChange: (questionId: string, value: any) => void;
}) {
  switch (question.type) {
    case 'fill-in-the-blank':
      return (
        <div className="flex items-center gap-2">
          <span>{question.questionText.split('___')[0]}</span>
          <ExamInput
            value={answer || ''}
            onChange={e => onAnswerChange(question.id, e.target.value)}
          />
          <span>{question.questionText.split('___')[1]}</span>
        </div>
      );
    case 'multiple-choice':
      return (
        <ExamRadioGroup
          value={answer}
          onValueChange={(value) => onAnswerChange(question.id, value)}
          className="space-y-1"
        >
          {question.options.map(opt => (
            <ExamRadioGroupItem key={opt} value={opt} id={`${question.id}-${opt}`} label={opt} />
          ))}
        </ExamRadioGroup>
      );
    case 'multiple-answer':
      const handleCheckboxChange = (option: string) => {
        const currentAnswers = new Set(answer || []);
        if (currentAnswers.has(option)) {
          currentAnswers.delete(option);
        } else {
          currentAnswers.add(option);
        }
        onAnswerChange(question.id, Array.from(currentAnswers));
      };
      return (
        <div className="flex flex-col gap-1">
          {question.options.map(opt => (
            <ExamCheckbox
              key={opt}
              checked={(answer || []).includes(opt)}
              onCheckedChange={() => handleCheckboxChange(opt)}
              label={opt}
            />
          ))}
        </div>
      );
    default:
      return <p>Unsupported question type</p>;
  }
}

// The right-hand panel containing the questions
function QuestionPanel({ 
    questions, 
    answers,
    currentQuestionIndex, 
    onAnswerChange 
}: { 
    questions: QuestionState[], 
    answers: Record<string, any>,
    currentQuestionIndex: number, 
    onAnswerChange: (questionId: string, value: any) => void 
}) {
  // A real implementation would group questions (e.g., 1-5, 6-10)
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="space-y-8 font-exam">
        <div>
            <h3 className={cn("font-bold", `q-${currentQuestion.id}`)}>Question {currentQuestion.id}</h3>
            <p className="text-sm mb-4">{currentQuestion.instruction}</p>
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswerChange={onAnswerChange}
            />
        </div>
    </div>
  )
}

export default function MockTestPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [questions, setQuestions] = useState<QuestionState[]>(initialQuestions);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Effect to update question status when an answer changes
  useEffect(() => {
    // When answers change, update the status of the corresponding questions
    const answeredQuestionIds = Object.keys(answers).filter(id => {
        const answer = answers[id];
        if (Array.isArray(answer)) return answer.length > 0; // for checkboxes
        return !!answer; // for radio/input
    });
    
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (answeredQuestionIds.includes(q.id) && q.status === 'unanswered') {
          return { ...q, status: 'answered' };
        }
        return q;
      })
    );
  }, [answers]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

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
        
        if (currentQuestion.status === 'reviewed') {
          // Revert to answered if an answer exists, otherwise unanswered
          currentQuestion.status = answers[currentQuestion.id] ? 'answered' : 'unanswered';
        } else {
          currentQuestion.status = 'reviewed';
        }
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
      onToggleReview={onToggleReview}
    >
      <SplitScreenLayout
        leftPanel={<InteractivePassage text={readingTest.passage} />}
        rightPanel={
            <QuestionPanel
                questions={questions}
                answers={answers}
                currentQuestionIndex={currentQuestionIndex}
                onAnswerChange={handleAnswerChange}
            />
        }
      />
    </ExamShell>
  );
}
