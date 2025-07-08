
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth-hook';
import { useToast } from '@/hooks/use-toast';
import { ExamShell } from '@/components/exam/exam-shell';
import { SplitScreenLayout } from '@/components/exam/split-screen-layout';
import { InteractivePassage, type Annotation } from '@/components/exam/interactive-passage';
import { readingTestData, type ReadingQuestion as ReadingQuestionData, type SubQuestion } from '@/lib/course-data';
import { ExamInput } from '@/components/exam/form-elements/exam-input';
import { ExamRadioGroup, ExamRadioGroupItem } from '@/components/exam/form-elements/exam-radio-group';
import { ExamCheckbox } from '@/components/exam/form-elements/exam-checkbox';
import { ExamSelect, ExamSelectTrigger, ExamSelectContent, ExamSelectItem, ExamSelectValue } from '@/components/exam/form-elements/exam-select';
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

  const passageProps = {
    annotations,
    setAnnotations,
    scrollToAnnotationId,
    onScrollComplete,
  };

  const isCorrect = useMemo(() => {
    if (!isSubmitted) return false;
    
    if (question.type === 'multiple-answer') {
        const userAnswerSorted = [...(answer || [])].sort();
        const correctAnswerSorted = [...(question.correctAnswer || [])].sort();
        return JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted);
    }
    if (question.type === 'matching-headings') {
        if (typeof answer !== 'object' || answer === null) return false;
        // For matching, we check if all sub-questions are correct. This is complex.
        // A simpler approach for the "isCorrect" flag is to not show it at the group level.
        // Feedback is shown per item.
        return false;
    }
    return JSON.stringify(answer).toLowerCase() === JSON.stringify(question.correctAnswer).toLowerCase();
  }, [isSubmitted, answer, question.correctAnswer, question.type]);

  
  const renderFeedback = (subQuestionId?: string) => {
    if (!isSubmitted) return null;

    let subIsCorrect: boolean;
    let subCorrectAnswer: string;
    let subExplanation: string | undefined;

    if (subQuestionId && question.type === 'matching-headings') {
        subCorrectAnswer = question.correctAnswer[subQuestionId];
        subIsCorrect = answer?.[subQuestionId] === subCorrectAnswer;
        subExplanation = question.explanation; // Main explanation applies to all
    } else {
        subIsCorrect = isCorrect;
        subCorrectAnswer = Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer;
        subExplanation = question.explanation
    }
    
    return (
      <div className={cn("mt-4 p-3 text-sm rounded-lg border", subIsCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
        {!subIsCorrect && (
          <p className="font-semibold text-destructive">
            Correct Answer: <span className="font-normal">
              {subCorrectAnswer}
            </span>
          </p>
        )}
        <p className="font-semibold mt-2">Explanation:</p>
        <p>{subExplanation}</p>
      </div>
    );
  };


  switch (question.type) {
    case 'fill-in-the-blank':
        const parts = question.questionText?.split('___') || ['',''];
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Label htmlFor={question.id} className="leading-snug">
              <InteractivePassage id={`q-${question.id}-pre`} text={parts[0]} as="span" {...passageProps} />
            </Label>
            <ExamInput
              id={question.id}
              value={answer || ''}
              onChange={e => onAnswerChange(question.id, e.target.value)}
              disabled={isSubmitted}
              className={cn(isSubmitted && (isCorrect ? 'border-green-500' : 'border-destructive'))}
            />
            {parts[1] && <Label htmlFor={question.id} className="leading-snug">
                <InteractivePassage id={`q-${question.id}-post`} text={parts[1]} as="span" {...passageProps} />
            </Label>}
          </div>
          {renderFeedback()}
        </div>
      );
    case 'multiple-choice':
    case 'true-false-not-given':
    case 'yes-no-not-given':
      return (
         <div className="space-y-4">
            <div className="font-semibold">
              <InteractivePassage id={`q-${question.id}`} text={question.questionText!} {...passageProps} />
            </div>
            <ExamRadioGroup
              value={answer}
              onValueChange={(value) => onAnswerChange(question.id, value)}
              disabled={isSubmitted}
              className={cn("space-y-2", question.type !== 'multiple-choice' && "flex items-center gap-2")}
            >
              {question.options!.map(opt => {
                 const isSelected = answer === opt;
                 const isCorrectOption = question.correctAnswer === opt;
                 return (
                    <div key={opt} className={cn(
                        "flex items-center space-x-2 rounded-lg",
                        question.type === 'multiple-choice' && "p-3 border",
                        isSubmitted && isCorrectOption && question.type === 'multiple-choice' && "bg-green-100 border-green-500",
                        isSubmitted && !isCorrectOption && isSelected && question.type === 'multiple-choice' && "bg-red-100 border-red-500",
                        !isSubmitted && question.type === 'multiple-choice' && "bg-background"
                    )}>
                        <ExamRadioGroupItem 
                            value={opt} 
                            id={`${question.id}-${opt}`} 
                            label={opt} 
                            disabled={isSubmitted} 
                            passageProps={passageProps}
                            variant={question.type !== 'multiple-choice' ? 'button' : 'default'}
                            isCorrect={isSubmitted && isCorrectOption}
                            isSelected={isSelected}
                        />
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
      const selectedCount = (answer || []).length;
      const requiredCount = question.requiredAnswers || 0;
      return (
         <div className="space-y-4">
            <div className="font-semibold flex items-center justify-between">
              <InteractivePassage id={`q-${question.id}`} text={question.questionText!} {...passageProps} />
              {requiredCount > 0 && <Badge variant={selectedCount === requiredCount ? "default" : "secondary"}>{selectedCount} of {requiredCount} selected</Badge>}
            </div>
            <div className="flex flex-col gap-2">
              {question.options!.map(opt => {
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
    case 'matching-headings':
        const handleMatchingChange = (subQuestionId: string, value: string) => {
            const currentGroupAnswers = answer || {};
            onAnswerChange(question.id, {
                ...currentGroupAnswers,
                [subQuestionId]: value
            });
        };
        return (
            <div className="space-y-4">
                <div className="font-semibold">
                    <InteractivePassage id={`q-${question.id}`} text={question.instruction} {...passageProps} />
                </div>
                <div className="space-y-6">
                    {question.subQuestions?.map(subQ => {
                        const subIsCorrect = isSubmitted && answer?.[subQ.id] === question.correctAnswer[subQ.id];
                        return (
                            <div key={subQ.id}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
                                    <div className="flex-1">
                                        <span className="font-bold mr-2">{subQ.id}</span>
                                        <InteractivePassage id={`q-${subQ.id}`} text={subQ.text} as="span" {...passageProps} />
                                    </div>
                                    <ExamSelect
                                        value={answer?.[subQ.id] || ''}
                                        onValueChange={(val) => handleMatchingChange(subQ.id, val)}
                                        disabled={isSubmitted}
                                    >
                                        <ExamSelectTrigger className={cn(
                                            isSubmitted && (subIsCorrect ? 'border-green-500' : 'border-destructive')
                                        )}>
                                            <ExamSelectValue placeholder="Choose..." />
                                        </ExamSelectTrigger>
                                        <ExamSelectContent>
                                            {question.matchingOptions?.map((opt, idx) => (
                                                <ExamSelectItem key={idx} value={opt}>{opt}</ExamSelectItem>
                                            ))}
                                        </ExamSelectContent>
                                    </ExamSelect>
                                </div>
                                {isSubmitted && renderFeedback(subQ.id)}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
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

  let questionRangeText = '';

    if (questionGroup.length > 1) {
        const firstId = parseInt(firstQuestion.id.split('-')[0]);
        let lastIdNum = parseInt(lastQuestion.id.split('-')[0]);

        if (lastQuestion.subQuestions && lastQuestion.subQuestions.length > 0) {
           lastIdNum = parseInt(lastQuestion.subQuestions[lastQuestion.subQuestions.length -1].id);
        } else if (lastQuestion.id.includes('-')) {
            lastIdNum = parseInt(lastQuestion.id.split('-')[1]);
        }
        
        questionRangeText = `Questions ${firstId}-${lastIdNum}`;

    } else if (firstQuestion.subQuestions) {
        const subQs = firstQuestion.subQuestions;
        questionRangeText = `Questions ${subQs[0].id}-${subQs[subQs.length-1].id}`
    } else {
        questionRangeText = `Question ${firstQuestion.id}`;
    }


  return (
    <Card className="font-exam">
      <CardHeader>
        <CardTitle>{questionRangeText}</CardTitle>
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

  const totalQuestions = useMemo(() => {
    return initialQuestions.reduce((acc, q) => {
        return acc + (q.subQuestions?.length || 1);
    }, 0);
  }, []);

  const questionsWithStatus = useMemo((): QuestionState[] => {
    return initialQuestions.map(q => {
        let isAnswered = false;
        if (q.subQuestions) {
            const answeredCount = q.subQuestions.filter(subQ => !!answers[q.id]?.[subQ.id]).length;
            isAnswered = answeredCount > 0; // Consider answered if at least one sub-question is answered
        } else {
             isAnswered = (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : !!answers[q.id]);
        }
        return {
            ...q,
            status: isAnswered ? 'answered' : 'unanswered',
            isReviewed: reviewedQuestions.has(q.id)
        }
    })
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
        } else if (q.type === 'matching-headings') {
            if (typeof userAnswer === 'object' && userAnswer !== null) {
                for(const subQ of q.subQuestions!) {
                    if (userAnswer[subQ.id] === q.correctAnswer[subQ.id]) {
                        calculatedScore++;
                    }
                }
            }
        } else if (userAnswer && q.correctAnswer && JSON.stringify(userAnswer).toLowerCase() === JSON.stringify(q.correctAnswer).toLowerCase()) {
            calculatedScore++;
        }
    }
    setScore(calculatedScore);
    setIsSubmitted(true);
    window.localStorage.removeItem(answerStorageKey);
    // Keep annotations after submission for review
    // window.localStorage.removeItem(annotationStorageKey);

    // If user is logged in, save the result to Firestore
    if (user && db?.app) {
      const userRef = doc(db, 'users', user.uid);
      const newResult = {
        testId: readingTest.id,
        score: calculatedScore,
        total: totalQuestions,
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

  const getQuestionRangeForPassage = (passageIndex: number) => {
    const passageQuestions = initialQuestions.filter(q => q.passage === passageIndex + 1);
    if (passageQuestions.length === 0) return '';
    
    const firstQ = passageQuestions[0];
    const lastQ = passageQuestions[passageQuestions.length - 1];
    
    const firstId = firstQ.subQuestions ? firstQ.subQuestions[0].id : firstQ.id.split('-')[0];
    const lastId = lastQ.subQuestions ? lastQ.subQuestions[lastQ.subQuestions.length - 1].id : lastQ.id.split('-').pop();

    return `${firstId}-${lastId}`;
  }


  if (currentPassageIndex === undefined) {
    return <div>Loading test...</div>
  }
  
  // --- Group questions for display ---
  const currentQuestion = initialQuestions[currentQuestionIndex];
  // This logic now supports grouping by type as well as instruction
  let groupStartIndex = currentQuestionIndex;
  while (
    groupStartIndex > 0 &&
    initialQuestions[groupStartIndex - 1].type === currentQuestion.type &&
    initialQuestions[groupStartIndex - 1].instruction === currentQuestion.instruction &&
    initialQuestions[groupStartIndex - 1].passage === currentQuestion.passage
  ) {
    groupStartIndex--;
  }
  // Find the end of the group
  let groupEndIndex = currentQuestionIndex;
  while (
    groupEndIndex < initialQuestions.length - 1 &&
    initialQuestions[groupEndIndex + 1].type === currentQuestion.type &&
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
                    <p className="text-sm text-gray-600">You should spend about 20 minutes on Questions {getQuestionRangeForPassage(currentPassageIndex)}, which are based on the passage below.</p>
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
                        {isSubmitted && <ResultsCard score={score} total={totalQuestions} />}
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

    