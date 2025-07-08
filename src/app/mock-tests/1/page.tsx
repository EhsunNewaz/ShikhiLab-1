
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth-hook';
import { useToast } from '@/hooks/use-toast';
import { ExamShell } from '@/components/exam/exam-shell';
import { SplitScreenLayout } from '@/components/exam/split-screen-layout';
import { InteractivePassage, type Annotation } from '@/components/exam/interactive-passage';
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
import { Separator } from '@/components/ui/separator';

// Get the mock reading test for demonstration
const readingTest = readingTestData[0];

// We combine the static question data with a dynamic 'status'
interface QuestionState extends ReadingQuestionData {
  status: 'unanswered' | 'answered';
  isReviewed: boolean;
}

// Initialize question state from static data
const initialQuestions: QuestionState[] = readingTest.questions.map(q => ({
  ...q,
  status: 'unanswered',
  isReviewed: false,
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
  annotations,
  setAnnotations,
  scrollToAnnotationId,
  onScrollComplete
}: {
  question: ReadingQuestionData;
  answer: any;
  onAnswerChange: (questionId: string, value: any) => void;
  isSubmitted: boolean;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  scrollToAnnotationId: string | null;
  onScrollComplete: () => void;
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
  
  const passageProps = {
    annotations,
    setAnnotations,
    scrollToAnnotationId,
    onScrollComplete,
  };

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
              <InteractivePassage id={`q-${question.id}-pre`} text={question.questionText.split('___')[0]} as="span" {...passageProps} />
            </Label>
            <ExamInput
              id={question.id}
              value={answer || ''}
              onChange={e => onAnswerChange(question.id, e.target.value)}
              disabled={isSubmitted}
              className={cn(isSubmitted && (isCorrect ? 'border-green-500' : 'border-destructive'))}
            />
            <Label htmlFor={question.id}>
              <InteractivePassage id={`q-${question.id}-post`} text={question.questionText.split('___')[1]} as="span" {...passageProps} />
            </Label>
          </div>
          {renderFeedback()}
        </div>
      );
    case 'multiple-choice':
      return (
         <div className="space-y-4">
            <div className="font-semibold">
              <InteractivePassage id={`q-${question.id}`} text={question.questionText} {...passageProps} />
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
                        <ExamRadioGroupItem value={opt} id={`${question.id}-${opt}`} label={opt} disabled={isSubmitted} passageProps={passageProps}/>
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
              <InteractivePassage id={`q-${question.id}`} text={question.questionText} {...passageProps} />
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
                            passageProps={passageProps}
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
  ...passageProps
}: {
  questionGroup: ReadingQuestionData[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, value: any) => void;
  isSubmitted: boolean;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  scrollToAnnotationId: string | null;
  onScrollComplete: () => void;
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
          <InteractivePassage id={`instruction-${firstQuestion.id}`} text={firstQuestion.instruction} {...passageProps} />
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
              {...passageProps}
            />
            {index < questionGroup.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function MockTestPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewedQuestions, setReviewedQuestions] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const answerStorageKey = `answers_${readingTest.id}`;
  const annotationStorageKey = `annotations_${readingTest.id}`;

  // State for the exam answers
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // State for annotations (highlights and notes)
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [scrollToAnnotationId, setScrollToAnnotationId] = useState<string | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);


  // On the client, after the initial render, load answers and annotations from localStorage
  useEffect(() => {
    try {
      const savedAnswers = window.localStorage.getItem(answerStorageKey);
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      
      const savedAnnotations = window.localStorage.getItem(annotationStorageKey);
      if (savedAnnotations) setAnnotations(JSON.parse(savedAnnotations));

    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
  }, [answerStorageKey, annotationStorageKey]);
  
  // Effect to save answers to localStorage whenever they change
  useEffect(() => {
    if (!isSubmitted) {
        try {
            window.localStorage.setItem(answerStorageKey, JSON.stringify(answers));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }
  }, [answers, answerStorageKey, isSubmitted]);

  // Effect to save annotations to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem(annotationStorageKey, JSON.stringify(annotations));
    } catch (error) {
      console.error("Failed to save annotations to localStorage", error);
    }
  }, [annotations, annotationStorageKey]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questionsWithStatus = useMemo((): QuestionState[] => {
    return initialQuestions.map(q => ({
        ...q,
        status: (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : !!answers[q.id]) ? 'answered' : 'unanswered',
        isReviewed: reviewedQuestions.has(q.id)
    }))
  }, [answers, reviewedQuestions]);

  const handleAnswerChange = (questionId: string, value: any) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) {
        console.log('Time is up! Submitting test.');
        handleSubmit();
    }
  }, [isSubmitted]);
  
  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    if (isSubmitted) return;
    
    let calculatedScore = 0;
    for (const q of initialQuestions) {
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
    window.localStorage.removeItem(answerStorageKey);
    window.localStorage.removeItem(annotationStorageKey);

    // If user is logged in, save the result to Firestore
    if (user && db?.app) {
      const userRef = doc(db, 'users', user.uid);
      const newResult = {
        testId: readingTest.id,
        score: calculatedScore,
        total: initialQuestions.length,
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
  
  const handleNext = () => {
      setCurrentQuestionIndex(prev => Math.min(prev + 1, initialQuestions.length - 1));
  }
  
  const handlePrev = () => {
      setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }
  
  const handleToggleReview = () => {
      const currentId = initialQuestions[currentQuestionIndex].id;
      setReviewedQuestions(prev => {
          const newSet = new Set(prev);
          if (newSet.has(currentId)) {
              newSet.delete(currentId);
          } else {
              newSet.add(currentId);
          }
          return newSet;
      })
  }

  const currentPassageIndex = initialQuestions[currentQuestionIndex]?.passage - 1;
  const onScrollComplete = useCallback(() => setScrollToAnnotationId(null), []);

  const passageProps = {
    annotations,
    setAnnotations,
    scrollToAnnotationId,
    onScrollComplete
  };


  if (currentPassageIndex === undefined) {
    return <div>Loading test...</div>
  }
  
  // --- Group questions for display ---
  const currentQuestion = initialQuestions[currentQuestionIndex];
  // Find the start of the consecutive group of questions with the same instruction
  let groupStartIndex = currentQuestionIndex;
  while (
    groupStartIndex > 0 &&
    initialQuestions[groupStartIndex - 1].instruction === currentQuestion.instruction &&
    initialQuestions[groupStartIndex - 1].passage === currentQuestion.passage
  ) {
    groupStartIndex--;
  }
  // Find the end of the group
  let groupEndIndex = currentQuestionIndex;
  while (
    groupEndIndex < initialQuestions.length - 1 &&
    initialQuestions[groupEndIndex + 1].instruction === currentQuestion.instruction &&
    initialQuestions[groupEndIndex + 1].passage === currentQuestion.passage
  ) {
    groupEndIndex++;
  }
  const currentQuestionGroup = initialQuestions.slice(groupStartIndex, groupEndIndex + 1);


  return (
    <>
        <ExamShell
            onTimeUp={handleTimeUp}
            onSubmit={() => setShowSubmitDialog(true)}
            isSubmitted={isSubmitted}
            questions={questionsWithStatus}
            currentQuestionIndex={currentQuestionIndex}
            onSelectQuestion={handleSelectQuestion}
            onPrev={handlePrev}
            onNext={handleNext}
            onToggleReview={handleToggleReview}
            // Props for the Notes Panel
            isNotesOpen={isNotesOpen}
            onToggleNotes={() => setIsNotesOpen(prev => !prev)}
            annotations={annotations}
            onNoteSelect={setScrollToAnnotationId}
        >
            <SplitScreenLayout
            leftPanel={
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800">Reading Passage {currentPassageIndex + 1}</h1>
                    <p className="text-sm text-gray-600">You should spend about 20 minutes on Questions {readingTest.questions.find(q => q.passage === currentPassageIndex + 1)?.id}-{readingTest.questions.filter(q => q.passage === currentPassageIndex + 1).at(-1)?.id}, which are based on the passage below.</p>
                    <InteractivePassage
                      id={`passage-${readingTest.id}-${currentPassageIndex}`}
                      text={readingTest.passages[currentPassageIndex]}
                      className="max-w-none font-body text-base leading-relaxed"
                      {...passageProps}
                    />
                </div>
            }
            rightPanel={
              <>
                <ScrollArea className="h-full">
                    <div className="space-y-6 p-5 pb-48"> {/* Padding at bottom for floating buttons */}
                        {isSubmitted && <ResultsCard score={score} total={initialQuestions.length} />}
                        <QuestionPanel
                            questionGroup={currentQuestionGroup}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            isSubmitted={isSubmitted}
                            {...passageProps}
                        />
                    </div>
                </ScrollArea>
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
