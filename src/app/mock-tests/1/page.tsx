
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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
  answers,
  onAnswerChange,
  isSubmitted,
  ...passageProps
}: {
  question: ReadingQuestionData;
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, subQuestionId: string, value: any) => void;
  isSubmitted: boolean;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  scrollToAnnotationId: string | null;
  onScrollComplete: () => void;
}) {

    const handleSingleChange = (value: any) => {
        onAnswerChange(question.id, question.id, value);
    };

    const handleSubQuestionChange = (subId: string, value: any) => {
        onAnswerChange(question.id, subId, value);
    };

    const renderFeedback = (subQuestionId: string, subIsCorrect: boolean, subCorrectAnswer: string, explanation: string | undefined) => {
        if (!isSubmitted) return null;
        
        return (
          <div className={cn("mt-2 p-3 text-sm rounded-lg border", subIsCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
            {!subIsCorrect && (
              <p className="font-semibold text-destructive">
                Correct Answer: <span className="font-normal">
                  {subCorrectAnswer}
                </span>
              </p>
            )}
            {explanation && <>
                <p className="font-semibold mt-2">Explanation:</p>
                <p>{explanation}</p>
            </>}
          </div>
        );
    };


  switch (question.type) {
    case 'fill-in-the-blank':
        return (
            <div className="space-y-4">
                {question.subQuestions?.map(subQ => {
                    const userAnswer = answers[question.id]?.[subQ.id] || '';
                    const correctAnswer = question.correctAnswer[subQ.id];
                    const isCorrect = isSubmitted && userAnswer.toLowerCase() === correctAnswer.toLowerCase();
                    return (
                        <div key={subQ.id}>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Label htmlFor={subQ.id} className="leading-snug">
                                    <span className="font-bold mr-2">{subQ.id}.</span>
                                    <InteractivePassage id={`q-${subQ.id}-pre`} text={subQ.preText || ''} as="span" {...passageProps} />
                                </Label>
                                <ExamInput
                                    id={subQ.id}
                                    value={userAnswer}
                                    onChange={e => handleSubQuestionChange(subQ.id, e.target.value)}
                                    disabled={isSubmitted}
                                    className={cn(isSubmitted && (isCorrect ? 'border-green-500' : 'border-destructive'))}
                                />
                                {subQ.postText && <Label htmlFor={subQ.id} className="leading-snug">
                                    <InteractivePassage id={`q-${subQ.id}-post`} text={subQ.postText} as="span" {...passageProps} />
                                </Label>}
                            </div>
                             {isSubmitted && renderFeedback(subQ.id, isCorrect, correctAnswer, question.explanation)}
                        </div>
                    )
                })}
            </div>
        )
    case 'multiple-choice':
        const userAnswerMC = answers[question.id]?.[question.id] || '';
        const isCorrectMC = isSubmitted && userAnswerMC === question.correctAnswer;
        return (
            <div className="space-y-4">
                <div className="font-semibold">
                    <InteractivePassage id={`q-${question.id}`} text={question.questionText!} {...passageProps} />
                </div>
                <ExamRadioGroup
                value={userAnswerMC}
                onValueChange={handleSingleChange}
                disabled={isSubmitted}
                className="space-y-2"
                >
                {question.options!.map(opt => {
                    const isSelected = userAnswerMC === opt;
                    const isCorrectOption = question.correctAnswer === opt;
                    return (
                        <div key={opt} className={cn(
                            "flex items-center space-x-2 rounded-lg p-3 border",
                            isSubmitted && isCorrectOption && "bg-green-100 border-green-500",
                            isSubmitted && !isCorrectOption && isSelected && "bg-red-100 border-red-500",
                            !isSubmitted && "bg-background"
                        )}>
                            <ExamRadioGroupItem 
                                value={opt} 
                                id={`${question.id}-${opt}`} 
                                label={opt} 
                                disabled={isSubmitted} 
                                passageProps={passageProps}
                                variant={'default'}
                                isCorrect={isSubmitted && isCorrectOption}
                                isSelected={isSelected}
                            />
                        </div>
                    )
                })}
                </ExamRadioGroup>
                {isSubmitted && renderFeedback(question.id, isCorrectMC, question.correctAnswer, question.explanation)}
            </div>
        );
    case 'true-false-not-given':
    case 'yes-no-not-given':
        return (
             <div className="space-y-4">
                 {question.subQuestions?.map(subQ => {
                     const userAnswer = answers[question.id]?.[subQ.id] || '';
                     const correctAnswer = question.correctAnswer[subQ.id];
                     const isCorrect = isSubmitted && userAnswer === correctAnswer;
                     return (
                         <div key={subQ.id} className="space-y-2 border-b pb-4 last:border-b-0">
                             <div className="font-semibold">
                                 <span className="font-bold mr-2">{subQ.id}.</span>
                                 <InteractivePassage id={`q-${subQ.id}`} text={subQ.text} {...passageProps} />
                             </div>
                             <ExamRadioGroup
                                 value={userAnswer}
                                 onValueChange={(value) => handleSubQuestionChange(subQ.id, value)}
                                 disabled={isSubmitted}
                                 className="flex items-center gap-2"
                             >
                                {question.options!.map(opt => (
                                     <ExamRadioGroupItem 
                                         key={opt}
                                         value={opt} 
                                         id={`${subQ.id}-${opt}`} 
                                         label={opt} 
                                         disabled={isSubmitted} 
                                         passageProps={passageProps}
                                         variant='button'
                                         isCorrect={isSubmitted && correctAnswer === opt}
                                         isSelected={userAnswer === opt}
                                     />
                                ))}
                             </ExamRadioGroup>
                              {isSubmitted && renderFeedback(subQ.id, isCorrect, correctAnswer, question.explanation)}
                         </div>
                     )
                 })}
             </div>
        );
    case 'multiple-answer':
        const userAnswerMA = answers[question.id]?.[question.id] || [];
        const selectedCount = userAnswerMA.length;
        const requiredCount = question.requiredAnswers || 0;
        const correctAnswerMA = question.correctAnswer as string[];
        const isCorrectMA = isSubmitted && JSON.stringify([...userAnswerMA].sort()) === JSON.stringify([...correctAnswerMA].sort());

        const handleCheckboxChange = (option: string) => {
            const currentAnswers = new Set(userAnswerMA);
            if (currentAnswers.has(option)) {
            currentAnswers.delete(option);
            } else {
            currentAnswers.add(option);
            }
            handleSingleChange(Array.from(currentAnswers));
        };
      
        return (
            <div className="space-y-4">
                <div className="font-semibold flex items-center justify-between">
                <InteractivePassage id={`q-${question.id}`} text={question.instruction!} {...passageProps} />
                {requiredCount > 0 && <Badge variant={selectedCount === requiredCount ? "default" : "secondary"}>{selectedCount} of {requiredCount} selected</Badge>}
                </div>
                <div className="flex flex-col gap-2">
                {question.options!.map(opt => {
                    const isSelected = (userAnswerMA).includes(opt);
                    const isCorrectOption = (correctAnswerMA).includes(opt);
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
                 {isSubmitted && renderFeedback(question.id, isCorrectMA, correctAnswerMA.join(', '), question.explanation)}
            </div>
        );
    case 'matching-headings':
        return (
            <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-2">List of Headings</h4>
                    <ul className="list-roman list-inside space-y-1">
                        {question.matchingOptions?.map((opt, idx) => <li key={idx}><InteractivePassage id={`opt-${idx}`} as="span" text={opt} {...passageProps} /></li>)}
                    </ul>
                </div>
                <div className="space-y-6">
                    {question.subQuestions?.map(subQ => {
                        const userAnswer = answers[question.id]?.[subQ.id] || '';
                        const correctAnswer = question.correctAnswer[subQ.id];
                        const subIsCorrect = isSubmitted && userAnswer === correctAnswer;
                        return (
                            <div key={subQ.id}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
                                    <div className="flex-1">
                                        <span className="font-bold mr-2">{subQ.id}.</span>
                                        <InteractivePassage id={`q-${subQ.id}`} text={subQ.text} as="span" {...passageProps} />
                                    </div>
                                    <ExamSelect
                                        value={userAnswer}
                                        onValueChange={(val) => handleSubQuestionChange(subQ.id, val)}
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
                                {isSubmitted && renderFeedback(subQ.id, subIsCorrect, correctAnswer, question.explanation)}
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

function QuestionPanel({
  questions,
  answers,
  onAnswerChange,
  isSubmitted,
  ...passageProps
}: {
  questions: ReadingQuestionData[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, subQuestionId: string, value: any) => void;
  isSubmitted: boolean;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  scrollToAnnotationId: string | null;
  onScrollComplete: () => void;
}) {

  return (
    <div className="font-exam bg-gray-50/50">
        <Accordion type="single" collapsible defaultValue={questions[0]?.id} className="w-full">
            {questions.map((question) => {
                const firstSubId = question.subQuestions ? question.subQuestions[0].id : question.id;
                const lastSubId = question.subQuestions ? question.subQuestions[question.subQuestions.length -1].id : question.id;
                const questionRangeText = firstSubId === lastSubId ? `Question ${firstSubId}` : `Questions ${firstSubId}-${lastSubId}`;
                
                return (
                     <AccordionItem value={question.id} key={question.id} className="border-b">
                        <AccordionTrigger className="p-4 text-left hover:bg-gray-100 disabled:cursor-not-allowed text-base font-semibold text-gray-800">
                           {questionRangeText}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t border-gray-200">
                             <div className="text-sm text-gray-600 mb-4">
                               <InteractivePassage id={`instruction-${question.id}`} text={question.instruction} {...passageProps} as="div" />
                             </div>
                             <QuestionRenderer
                                question={question}
                                answers={answers}
                                onAnswerChange={onAnswerChange}
                                isSubmitted={isSubmitted}
                                {...passageProps}
                             />
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
    </div>
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

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [scrollToAnnotationId, setScrollToAnnotationId] = useState<string | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  useEffect(() => {
    try {
      const savedAnswers = window.localStorage.getItem(answerStorageKey);
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      
      const savedAnnotations = window.localStorage.getItem(annotationStorageKey);
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }

    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
  }, [answerStorageKey, annotationStorageKey]);
  
  useEffect(() => {
    if (!isSubmitted) {
        try {
            window.localStorage.setItem(answerStorageKey, JSON.stringify(answers));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }
  }, [answers, answerStorageKey, isSubmitted]);

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
        if (q.subQuestions) {
            return acc + q.subQuestions.length;
        }
        return acc + 1;
    }, 0);
  }, []);

  const questionsWithStatus = useMemo((): QuestionState[] => {
    return initialQuestions.map(q => {
        let isAnswered = false;
        const groupAnswer = answers[q.id];
        if (groupAnswer) {
             if (q.subQuestions) {
                const answeredCount = q.subQuestions.filter(subQ => !!groupAnswer[subQ.id]).length;
                isAnswered = answeredCount > 0;
            } else if (q.type === 'multiple-answer') {
                 isAnswered = Array.isArray(groupAnswer[q.id]) && groupAnswer[q.id].length > 0;
            } else {
                 isAnswered = !!groupAnswer[q.id];
            }
        }
        return {
            ...q,
            status: isAnswered ? 'answered' : 'unanswered',
            isReviewed: reviewedQuestions.has(q.id)
        }
    })
  }, [answers, reviewedQuestions]);

  const handleAnswerChange = (questionId: string, subQuestionId: string, value: any) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ 
        ...prev, 
        [questionId]: {
            ...prev[questionId],
            [subQuestionId]: value
        } 
    }));
  };
  
  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    if (isSubmitted) return;
    
    let calculatedScore = 0;
    for (const q of initialQuestions) {
        const userAnswerGroup = answers[q.id];
        if (!userAnswerGroup) continue;

        if (q.subQuestions) {
            for (const subQ of q.subQuestions) {
                const userAnswer = userAnswerGroup[subQ.id];
                if (userAnswer && q.correctAnswer[subQ.id] && userAnswer.toLowerCase() === q.correctAnswer[subQ.id].toLowerCase()) {
                    calculatedScore++;
                }
            }
        } else if (q.type === 'multiple-answer') {
            const userAnswer = userAnswerGroup[q.id];
            const userAnswerSorted = [...(userAnswer || [])].sort();
            const correctAnswerSorted = [...(q.correctAnswer || [])].sort();
            if (JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted)) {
                calculatedScore++;
            }
        } else {
            const userAnswer = userAnswerGroup[q.id];
            if (userAnswer && q.correctAnswer && JSON.stringify(userAnswer).toLowerCase() === JSON.stringify(q.correctAnswer).toLowerCase()) {
                calculatedScore++;
            }
        }
    }
    setScore(calculatedScore);
    setIsSubmitted(true);
    window.localStorage.removeItem(answerStorageKey);
  
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

  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) {
        console.log('Time is up! Submitting test.');
        handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);
  
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
  
  const passageQuestions = useMemo(() => {
      return initialQuestions.filter(q => q.passage === currentPassageIndex + 1);
  }, [currentPassageIndex]);

  const getQuestionRangeForPassage = (passageIndex: number) => {
    const passageQuestions = initialQuestions.filter(q => q.passage === passageIndex + 1);
    if (passageQuestions.length === 0) return '';
    
    const allSubQuestionIds = passageQuestions.flatMap(q => q.subQuestions ? q.subQuestions.map(sq => parseInt(sq.id)) : [parseInt(q.id.split('-')[0])]);
    const minId = Math.min(...allSubQuestionIds);
    const maxId = Math.max(...allSubQuestionIds);

    return `${minId}-${maxId}`;
  }


  if (currentPassageIndex === undefined) {
    return <div>Loading test...</div>
  }

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
                    <div className="pb-48"> {/* Padding at bottom for floating buttons */}
                        {isSubmitted && <ResultsCard score={score} total={totalQuestions} />}
                        <QuestionPanel
                            questions={passageQuestions}
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
