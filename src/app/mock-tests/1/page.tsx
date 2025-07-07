
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
import { SubmitConfirmationDialog } from '@/components/exam/submit-confirmation-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// We combine the static question data with a dynamic 'status'
interface QuestionState extends ReadingQuestionData {
  status: 'unanswered' | 'answered' | 'reviewed';
}

// Initialize question state from static data
const initialQuestions: QuestionState[] = readingTestData[1].questions.map(q => ({
  ...q,
  status: 'unanswered',
}));

// Get the mock reading test for demonstration
const readingTest = readingTestData[1];


function ResultsCard({ score, total }: { score: number; total: number }) {
  return (
    <Card className="mb-8 bg-primary/5">
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
        <CardDescription>Here's how you did on the mock test.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          Your Score: <Badge variant="secondary" className="text-2xl">{score} / {total}</Badge>
        </p>
      </CardContent>
    </Card>
  );
}


// Component to render a single question based on its type
function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  isSubmitted,
}: {
  question: QuestionState;
  answer: any;
  onAnswerChange: (questionId: string, value: any) => void;
  isSubmitted: boolean;
}) {
  const isCorrect = isSubmitted && JSON.stringify(answer) === JSON.stringify(question.correctAnswer);

  switch (question.type) {
    case 'fill-in-the-blank':
      return (
        <div>
          <div className="flex items-center gap-2">
            <span>{question.questionText.split('___')[0]}</span>
            <ExamInput
              value={answer || ''}
              onChange={e => onAnswerChange(question.id, e.target.value)}
              disabled={isSubmitted}
            />
            <span>{question.questionText.split('___')[1]}</span>
          </div>
          {isSubmitted && (
             <div className="mt-3 p-3 text-sm bg-muted/50 rounded-lg">
                <p className={cn(isCorrect ? "text-green-700 font-bold" : "text-destructive font-bold")}>
                    Your answer: {answer || '(No answer)'}
                </p>
                {!isCorrect && <p><span className="font-bold">Correct Answer:</span> {question.correctAnswer}</p>}
                <p><span className="font-bold">Explanation:</span> {question.explanation}</p>
            </div>
          )}
        </div>
      );
    case 'multiple-choice':
      return (
         <div>
            <ExamRadioGroup
              value={answer}
              onValueChange={(value) => onAnswerChange(question.id, value)}
              disabled={isSubmitted}
              className="space-y-1"
            >
              {question.options.map(opt => {
                 const isSelected = answer === opt;
                 const isCorrectOption = question.correctAnswer === opt;
                 return (
                    <div key={opt} className={cn(
                        "flex items-center space-x-2 p-2 rounded-md",
                        isSubmitted && isCorrectOption && "bg-green-100 border-green-300 border",
                        isSubmitted && !isCorrectOption && isSelected && "bg-red-100 border-red-300 border"
                    )}>
                        <ExamRadioGroupItem value={opt} id={`${question.id}-${opt}`} label={opt} disabled={isSubmitted}/>
                    </div>
                )
              })}
            </ExamRadioGroup>
            {isSubmitted && (
                 <div className="mt-3 p-3 text-sm bg-muted/50 rounded-lg">
                    <p><span className="font-bold">Explanation:</span> {question.explanation}</p>
                </div>
            )}
        </div>
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
         <div>
            <div className="flex flex-col gap-1">
              {question.options.map(opt => {
                const isSelected = (answer || []).includes(opt);
                const isCorrectOption = (question.correctAnswer || []).includes(opt);
                 return (
                    <div key={opt} className={cn(
                        "flex items-center space-x-2 p-2 rounded-md",
                        isSubmitted && isCorrectOption && "bg-green-100 border-green-300 border",
                        isSubmitted && !isCorrectOption && isSelected && "bg-red-100 border-red-300 border"
                    )}>
                         <ExamCheckbox
                            checked={isSelected}
                            onCheckedChange={() => handleCheckboxChange(opt)}
                            label={opt}
                            disabled={isSubmitted}
                        />
                    </div>
                )
              })}
            </div>
            {isSubmitted && (
                 <div className="mt-3 p-3 text-sm bg-muted/50 rounded-lg">
                    <p><span className="font-bold">Correct Answers:</span> {(question.correctAnswer || []).join(', ')}</p>
                    <p><span className="font-bold">Explanation:</span> {question.explanation}</p>
                </div>
            )}
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
    onAnswerChange,
    isSubmitted
}: { 
    questions: QuestionState[], 
    answers: Record<string, any>,
    currentQuestionIndex: number, 
    onAnswerChange: (questionId: string, value: any) => void,
    isSubmitted: boolean
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
              isSubmitted={isSubmitted}
            />
        </div>
    </div>
  )
}

export default function MockTestPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [questions, setQuestions] = useState<QuestionState[]>(initialQuestions);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [score, setScore] = useState(0);
  
  const storageKey = `answers_${readingTest.id}`;
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }
    try {
      const savedAnswers = window.localStorage.getItem(storageKey);
      return savedAnswers ? JSON.parse(savedAnswers) : {};
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return {};
    }
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Effect to save answers to localStorage whenever they change
  useEffect(() => {
    if (!isSubmitted) {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(answers));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }
  }, [answers, storageKey, isSubmitted]);

  // Effect to update question status when an answer changes
  useEffect(() => {
    if (isSubmitted) return;
    const answeredQuestionIds = Object.keys(answers).filter(id => {
        const answer = answers[id];
        if (Array.isArray(answer)) return answer.length > 0;
        return !!answer;
    });
    
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (answeredQuestionIds.includes(q.id) && q.status === 'unanswered') {
          return { ...q, status: 'answered' };
        }
        if (!answeredQuestionIds.includes(q.id) && q.status === 'answered') {
            return { ...q, status: 'unanswered' };
        }
        return q;
      })
    );
  }, [answers, isSubmitted]);

  const handleAnswerChange = (questionId: string, value: any) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleTimeUp = () => {
    console.log('Time is up! Submitting test.');
    handleSubmit();
  };
  
  const handleSubmit = () => {
    setShowSubmitDialog(false);
    
    let calculatedScore = 0;
    for (const q of questions) {
        const userAnswer = answers[q.id];
        if (JSON.stringify(userAnswer) === JSON.stringify(q.correctAnswer)) {
            calculatedScore++;
        }
    }
    setScore(calculatedScore);
    setIsSubmitted(true);
    setIsLocked(true);
    window.localStorage.removeItem(storageKey);
  }

  const handleSelectQuestion = (index: number) => {
      setCurrentQuestionIndex(index);
  };

  const handleNextQuestion = () => {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevQuestion = () => {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleToggleReview = () => {
    if (isLocked) return;
    setQuestions((prev) => {
        const newQuestions = [...prev];
        const currentQuestion = newQuestions[currentQuestionIndex];
        
        if (currentQuestion.status === 'reviewed') {
          currentQuestion.status = answers[currentQuestion.id] ? 'answered' : 'unanswered';
        } else {
          currentQuestion.status = 'reviewed';
        }
        return newQuestions;
      });
  };

  return (
    <>
        <ExamShell
            onTimeUp={handleTimeUp}
            isLocked={isLocked}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onSelectQuestion={handleSelectQuestion}
            onNextQuestion={handleNextQuestion}
            onPrevQuestion={handlePrevQuestion}
            onToggleReview={onToggleReview}
            isSubmitted={isSubmitted}
            onSubmit={() => setShowSubmitDialog(true)}
        >
            <SplitScreenLayout
            leftPanel={<InteractivePassage text={readingTest.passage} />}
            rightPanel={
                <>
                    {isSubmitted && <ResultsCard score={score} total={questions.length} />}
                    <QuestionPanel
                        questions={questions}
                        answers={answers}
                        currentQuestionIndex={currentQuestionIndex}
                        onAnswerChange={handleAnswerChange}
                        isSubmitted={isSubmitted}
                    />
                </>
            }
            />
        </ExamShell>
        <SubmitConfirmationDialog 
            isOpen={showSubmitDialog}
            onOpenChange={setShowSubmitDialog}
            onConfirm={handleSubmit}
        />
    </>
  );
}
