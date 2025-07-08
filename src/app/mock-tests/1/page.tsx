
'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth-hook';
import { useToast } from '@/hooks/use-toast';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { BottomPanel } from '@/components/exam/bottom-panel';
import { Separator } from '@/components/ui/separator';

// Get the mock reading test for demonstration
const readingTest = readingTestData[0];

// We combine the static question data with a dynamic 'status'
interface QuestionState extends ReadingQuestionData {
  status: 'unanswered' | 'answered' | 'reviewed';
}

// Initialize question state from static data
const initialQuestions: QuestionState[] = readingTest.questions.map(q => ({
  ...q,
  status: 'unanswered',
}));


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
  let isCorrect = false;
  if (isSubmitted) {
    if (question.type === 'multiple-answer') {
      const userAnswerSorted = [...(answer || [])].sort();
      const correctAnswerSorted = [...(question.correctAnswer || [])].sort();
      isCorrect = JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted);
    } else {
      isCorrect = JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
    }
  }

  const renderFeedback = () => {
    if (!isSubmitted) return null;
    return (
      <div className="mt-4 p-3 text-sm bg-muted/50 rounded-lg border">
        {!isCorrect && (
          <p className="font-semibold text-destructive">
            Correct Answer: <span className="font-normal">
              {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
            </span>
          </p>
        )}
        <p className="font-semibold mt-2">Explanation:</p>
        <p>{question.explanation}</p>
      </div>
    );
  };


  switch (question.type) {
    case 'fill-in-the-blank':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Label htmlFor={question.id}>
              <InteractivePassage text={question.questionText.split('___')[0]} as="span" />
            </Label>
            <ExamInput
              id={question.id}
              value={answer || ''}
              onChange={e => onAnswerChange(question.id, e.target.value)}
              disabled={isSubmitted}
              className={cn(isSubmitted && (isCorrect ? 'border-green-500' : 'border-destructive'))}
            />
            <Label htmlFor={question.id}>
              <InteractivePassage text={question.questionText.split('___')[1]} as="span" />
            </Label>
          </div>
          {renderFeedback()}
        </div>
      );
    case 'multiple-choice':
      return (
         <div className="space-y-4">
            <div className="font-semibold">
              <InteractivePassage text={question.questionText} />
            </div>
            <ExamRadioGroup
              value={answer}
              onValueChange={(value) => onAnswerChange(question.id, value)}
              disabled={isSubmitted}
              className="space-y-2"
            >
              {question.options.map(opt => {
                 const isSelected = answer === opt;
                 const isCorrectOption = question.correctAnswer === opt;
                 return (
                    <div key={opt} className={cn(
                        "flex items-center space-x-2 p-3 rounded-lg border",
                        isSubmitted && isCorrectOption && "bg-green-100 border-green-500",
                        isSubmitted && !isCorrectOption && isSelected && "bg-red-100 border-red-500",
                        !isSubmitted && "bg-background"
                    )}>
                        <ExamRadioGroupItem value={opt} id={`${question.id}-${opt}`} label={opt} disabled={isSubmitted}/>
                    </div>
                )
              })}
            </ExamRadioGroup>
            {renderFeedback()}
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
        onAnswerChange(question.id, Array.from(currentAnswers).sort());
      };
      return (
         <div className="space-y-4">
            <div className="font-semibold">
              <InteractivePassage text={question.questionText} />
            </div>
            <div className="flex flex-col gap-2">
              {question.options.map(opt => {
                const isSelected = (answer || []).includes(opt);
                const isCorrectOption = (question.correctAnswer || []).includes(opt);
                 return (
                    <div key={opt} className={cn(
                        "flex items-center space-x-2 p-3 rounded-lg border",
                        isSubmitted && isCorrectOption && "bg-green-100 border-green-500",
                        isSubmitted && !isCorrectOption && isSelected && "bg-red-100 border-red-500",
                        !isSubmitted && "bg-background"
                    )}>
                         <ExamCheckbox
                            id={`${question.id}-${opt}`}
                            checked={isSelected}
                            onCheckedChange={() => handleCheckboxChange(opt)}
                            label={opt}
                            disabled={isSubmitted}
                        />
                    </div>
                )
              })}
            </div>
            {renderFeedback()}
        </div>
      );
    default:
      return <p>Unsupported question type</p>;
  }
}

// The right-hand panel containing the questions
function QuestionPanel({
  questionGroup,
  answers,
  onAnswerChange,
  isSubmitted,
}: {
  questionGroup: QuestionState[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, value: any) => void;
  isSubmitted: boolean;
}) {
  if (!questionGroup || questionGroup.length === 0) {
    return null;
  }
  const firstQuestion = questionGroup[0];
  const lastQuestion = questionGroup[questionGroup.length - 1];
  const questionRange =
    questionGroup.length > 1
      ? `Questions ${firstQuestion.id} - ${lastQuestion.id}`
      : `Question ${firstQuestion.id}`;

  return (
    <Card className="font-exam">
      <CardHeader>
        <CardTitle>{questionRange}</CardTitle>
        <CardDescription>
          <InteractivePassage text={firstQuestion.instruction} />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questionGroup.map((question, index) => (
          <div key={question.id}>
            <QuestionRenderer
              question={question}
              answer={answers[question.id]}
              onAnswerChange={onAnswerChange}
              isSubmitted={isSubmitted}
            />
            {index < questionGroup.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function MockTestPage() {
  const [questions, setQuestions] = useState<QuestionState[]>(initialQuestions);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [score, setScore] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
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
    
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        const answer = answers[q.id];
        const isAnswered = Array.isArray(answer) ? answer.length > 0 : !!answer;
        
        if (isAnswered && q.status !== 'reviewed') {
          return { ...q, status: 'answered' };
        }
        if (!isAnswered && q.status === 'answered') {
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
  
  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    
    let calculatedScore = 0;
    for (const q of questions) {
        const userAnswer = answers[q.id];
        if (q.type === 'multiple-answer') {
            const userAnswerSorted = [...(userAnswer || [])].sort();
            const correctAnswerSorted = [...(q.correctAnswer || [])].sort();
            if (JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted)) {
                calculatedScore++;
            }
        } else if (JSON.stringify(userAnswer) === JSON.stringify(q.correctAnswer)) {
            calculatedScore++;
        }
    }
    setScore(calculatedScore);
    setIsSubmitted(true);
    window.localStorage.removeItem(storageKey);

    // If user is logged in, save the result to Firestore
    if (user && db?.app) {
      const userRef = doc(db, 'users', user.uid);
      const newResult = {
        testId: readingTest.id,
        score: calculatedScore,
        total: questions.length,
        completedAt: serverTimestamp(),
      };
      try {
        await updateDoc(userRef, {
          mockTestHistory: arrayUnion(newResult),
        });
        toast({
          title: 'Result Saved',
          description: 'Your mock test result has been saved to your profile.',
        });
      } catch (error) {
        console.error('Failed to save test result:', error);
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'Could not save your result. Please try again later.',
        });
      }
    }
  }

  const handleSelectQuestion = (index: number) => {
      setCurrentQuestionIndex(index);
  };

  const currentPassageIndex = questions[currentQuestionIndex]?.passage - 1;

  if (currentPassageIndex === undefined) {
    return <div>Loading test...</div>
  }
  
  // --- Group questions for display ---
  const currentQuestion = questions[currentQuestionIndex];
  // Find the start of the consecutive group of questions with the same instruction
  let groupStartIndex = currentQuestionIndex;
  while (
    groupStartIndex > 0 &&
    questions[groupStartIndex - 1].instruction === currentQuestion.instruction &&
    questions[groupStartIndex - 1].passage === currentQuestion.passage
  ) {
    groupStartIndex--;
  }
  // Find the end of the group
  let groupEndIndex = currentQuestionIndex;
  while (
    groupEndIndex < questions.length - 1 &&
    questions[groupEndIndex + 1].instruction === currentQuestion.instruction &&
    questions[groupEndIndex + 1].passage === currentQuestion.passage
  ) {
    groupEndIndex++;
  }
  const currentQuestionGroup = questions.slice(groupStartIndex, groupEndIndex + 1);


  return (
    <>
        <ExamShell
            onTimeUp={handleTimeUp}
            isSubmitted={isSubmitted}
            onSubmit={() => setShowSubmitDialog(true)}
        >
            <SplitScreenLayout
            leftPanel={
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800">Reading Passage {currentPassageIndex + 1}</h1>
                    <p className="text-sm text-gray-600">You should spend about 20 minutes on Questions {readingTest.questions.find(q => q.passage === currentPassageIndex + 1)?.id}-{readingTest.questions.filter(q => q.passage === currentPassageIndex + 1).at(-1)?.id}, which are based on the passage below.</p>
                    <InteractivePassage text={readingTest.passages[currentPassageIndex]} className="max-w-none font-body text-base leading-relaxed" />
                </div>
            }
            rightPanel={
              <>
                <ScrollArea className="h-full">
                    <div className="space-y-6 p-5 pb-24"> {/* Padding at bottom for floating buttons */}
                        {isSubmitted && <ResultsCard score={score} total={questions.length} />}
                        <QuestionPanel
                            questionGroup={currentQuestionGroup}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            isSubmitted={isSubmitted}
                        />
                    </div>
                </ScrollArea>
              </>
            }
            />
             <BottomPanel
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={handleSelectQuestion}
                isSubmitted={isSubmitted}
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
