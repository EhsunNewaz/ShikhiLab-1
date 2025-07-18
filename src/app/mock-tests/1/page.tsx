
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
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';


// Get the mock reading test for demonstration
const readingTest = readingTestData[0];

// We combine the static question data with a dynamic 'status'
export interface QuestionState {
  id: string; // The question number, e.g., '1', '14'
  status: 'unanswered' | 'answered';
  isReviewed: boolean;
  // Metadata for navigation
  passage: number;
  originalQuestionIndex: number; // The index of the question *group* in initialQuestions
}

// Initialize question state from static data
const initialQuestions: ReadingQuestionData[] = readingTest.questions.map(q => ({
  ...q,
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


function QuestionPanel({ questionGroup, answers, onAnswerChange, isSubmitted, ...passageProps }: {
    questionGroup: ReadingQuestionData,
    answers: Record<string, any>,
    onAnswerChange: (questionId: string, subQuestionId: string, value: any) => void;
    isSubmitted: boolean;
    annotations: Annotation[];
    setAnnotations: (annotations: Annotation[]) => void;
    scrollToAnnotationId: string | null;
    onScrollComplete: () => void;
}) {
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(questionGroup.subQuestions?.[0]?.id ?? questionGroup.id);

    const questionRangeText = useMemo(() => {
        if (!questionGroup.subQuestions || questionGroup.subQuestions.length === 0) {
            return `Question ${questionGroup.id}`;
        }
        const firstId = questionGroup.subQuestions[0].id;
        const lastId = questionGroup.subQuestions[questionGroup.subQuestions.length - 1].id;
        return `Questions ${firstId}-${lastId}`;
    }, [questionGroup]);

    const handleAnswerForSharedOptions = (value: any) => {
        if (activeQuestionId) {
            onAnswerChange(questionGroup.id, activeQuestionId, value);
        }
    };

    const renderFeedback = (subQuestionId: string, subIsCorrect: boolean, subCorrectAnswer: string, explanation: string | undefined) => {
        if (!isSubmitted) return null;
        
        return (
          <div className={cn("mt-2 p-3 text-sm rounded-lg border", subIsCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
            {!subIsCorrect && (
              <p className="font-semibold text-destructive">
                Correct Answer: <span className="font-normal">
                  {Array.isArray(subCorrectAnswer) ? subCorrectAnswer.join(', ') : subCorrectAnswer}
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

    const QuestionContent = () => {
        switch (questionGroup.type) {
            case 'fill-in-the-blank':
                return (
                    <div className="space-y-4">
                        {questionGroup.subQuestions?.map(subQ => {
                            const userAnswer = answers[questionGroup.id]?.[subQ.id] || '';
                            const correctAnswer = questionGroup.correctAnswer[subQ.id];
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
                                            onChange={e => onAnswerChange(questionGroup.id, subQ.id, e.target.value)}
                                            disabled={isSubmitted}
                                            className={cn(isSubmitted && (isCorrect ? 'border-green-500' : 'border-destructive'))}
                                        />
                                        {subQ.postText && <Label htmlFor={subQ.id} className="leading-snug">
                                            <InteractivePassage id={`q-${subQ.id}-post`} text={subQ.postText} as="span" {...passageProps} />
                                        </Label>}
                                    </div>
                                    {isSubmitted && renderFeedback(subQ.id, isCorrect, correctAnswer, questionGroup.explanation)}
                                </div>
                            )
                        })}
                    </div>
                )
             case 'multiple-choice':
                const userAnswerMC = answers[questionGroup.id]?.[questionGroup.id] || '';
                const isCorrectMC = isSubmitted && userAnswerMC === questionGroup.correctAnswer;
                return (
                    <div className="space-y-4">
                        <div className="font-semibold">
                            <InteractivePassage id={`q-${questionGroup.id}`} text={questionGroup.questionText!} {...passageProps} />
                        </div>
                        <ExamRadioGroup
                            value={userAnswerMC}
                            onValueChange={(value) => onAnswerChange(questionGroup.id, questionGroup.id, value)}
                            disabled={isSubmitted}
                            className="space-y-2"
                        >
                        {questionGroup.options!.map(opt => {
                            const isSelected = userAnswerMC === opt;
                            const isCorrectOption = questionGroup.correctAnswer === opt;
                            return (
                                <div key={opt} className={cn(
                                    "flex items-center space-x-2 rounded-lg p-3 border",
                                    isSubmitted && isCorrectOption && "bg-green-100 border-green-500",
                                    isSubmitted && !isCorrectOption && isSelected && "bg-red-100 border-red-500",
                                    !isSubmitted && "bg-background"
                                )}>
                                    <ExamRadioGroupItem 
                                        value={opt} 
                                        id={`${questionGroup.id}-${opt}`} 
                                        label={opt} 
                                        disabled={isSubmitted} 
                                        passageProps={passageProps}
                                    />
                                </div>
                            )
                        })}
                        </ExamRadioGroup>
                        {isSubmitted && renderFeedback(questionGroup.id, isCorrectMC, questionGroup.correctAnswer as string, questionGroup.explanation)}
                    </div>
                );
             case 'true-false-not-given':
             case 'yes-no-not-given':
                return (
                    <div className="space-y-6">
                        {questionGroup.subQuestions!.map(subQ => {
                            const userAnswer = answers[questionGroup.id]?.[subQ.id] || '';
                            const isCorrect = isSubmitted && userAnswer === questionGroup.correctAnswer[subQ.id];

                            return (
                                <div key={subQ.id}>
                                    <div className="flex items-start gap-3">
                                        <span className={cn(
                                            "flex h-7 w-7 items-center justify-center rounded border-2 font-bold flex-shrink-0 mt-0.5",
                                            activeQuestionId === subQ.id ? "border-blue-600 text-blue-800" : "border-gray-500 text-gray-800"
                                        )}>{subQ.id}</span>
                                        <button 
                                            onClick={() => setActiveQuestionId(subQ.id)}
                                            disabled={isSubmitted}
                                            className={cn(
                                                "flex-1 text-left p-2 rounded",
                                                activeQuestionId === subQ.id && "bg-blue-50"
                                            )}
                                        >
                                            <InteractivePassage id={`q-${subQ.id}`} text={subQ.text} as="p" {...passageProps} />
                                        </button>
                                        <span className="font-semibold text-gray-600 w-24 text-right">
                                            {answers[questionGroup.id]?.[subQ.id] || '...'}
                                        </span>
                                    </div>
                                    {isSubmitted && (
                                        <div className="pl-10">
                                            {renderFeedback(subQ.id, isCorrect, questionGroup.correctAnswer[subQ.id], questionGroup.explanation)}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        <div className="pl-10 mt-4 pt-4 border-t">
                             <ExamRadioGroup
                                value={activeQuestionId ? answers[questionGroup.id]?.[activeQuestionId] || '' : ''}
                                onValueChange={handleAnswerForSharedOptions}
                                disabled={isSubmitted || !activeQuestionId}
                                className="flex items-center justify-center gap-4"
                            >
                                {questionGroup.options!.map(opt => (
                                    <ExamRadioGroupItem 
                                        key={opt}
                                        value={opt} 
                                        id={`${activeQuestionId}-${opt}`}
                                        label={opt}
                                        disabled={isSubmitted || !activeQuestionId}
                                        passageProps={passageProps}
                                        variant="button"
                                        isSelected={activeQuestionId ? answers[questionGroup.id]?.[activeQuestionId] === opt : false}
                                        isCorrect={isSubmitted && activeQuestionId ? questionGroup.correctAnswer[activeQuestionId] === opt : false}
                                    />
                                ))}
                            </ExamRadioGroup>
                        </div>
                    </div>
                );
            case 'multiple-answer':
                const userAnswerMA = answers[questionGroup.id]?.[questionGroup.id] || [];
                const selectedCount = userAnswerMA.length;
                const requiredCount = questionGroup.requiredAnswers || 0;
                const correctAnswerMA = questionGroup.correctAnswer as string[];
                const isCorrectMA = isSubmitted && JSON.stringify([...userAnswerMA].sort()) === JSON.stringify([...correctAnswerMA].sort());

                const handleCheckboxChange = (option: string) => {
                    const currentAnswers = new Set(userAnswerMA);
                    if (currentAnswers.has(option)) {
                        currentAnswers.delete(option);
                    } else {
                        currentAnswers.add(option);
                    }
                    onAnswerChange(questionGroup.id, questionGroup.id, Array.from(currentAnswers));
                };
            
                return (
                    <div className="space-y-4">
                        <div className="font-semibold flex items-center justify-between">
                            <InteractivePassage id={`q-${questionGroup.id}`} text={questionGroup.instruction!} {...passageProps} />
                            {requiredCount > 0 && <Badge variant={selectedCount === requiredCount ? "default" : "secondary"}>{selectedCount} of {requiredCount} selected</Badge>}
                        </div>
                        <div className="flex flex-col gap-2">
                        {questionGroup.options!.map(opt => {
                            const isSelected = (userAnswerMA).includes(opt);
                            const isCorrectOption = (correctAnswerMA).includes(opt);
                            return (
                                <div key={opt} className={cn(
                                    "flex items-center space-x-2 p-3 rounded-lg border",
                                    !isSubmitted && "bg-background",
                                    isSubmitted && isCorrectOption && "bg-green-100 border-green-500",
                                    isSubmitted && !isCorrectOption && isSelected && "bg-red-100 border-red-500"
                                )}>
                                    <ExamCheckbox
                                        id={`${questionGroup.id}-${opt}`}
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
                        {isSubmitted && renderFeedback(questionGroup.id, isCorrectMA, correctAnswerMA, questionGroup.explanation)}
                    </div>
                );
            case 'matching-headings':
                return (
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-semibold mb-2">List of Headings</h4>
                            <ul className="list-roman list-inside space-y-1">
                                {questionGroup.matchingOptions?.map((opt, idx) => <li key={idx}><InteractivePassage id={`opt-${idx}`} as="span" text={opt} {...passageProps} /></li>)}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            {questionGroup.subQuestions?.map(subQ => {
                                const userAnswer = answers[questionGroup.id]?.[subQ.id] || '';
                                const correctAnswer = questionGroup.correctAnswer[subQ.id];
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
                                                onValueChange={(val) => onAnswerChange(questionGroup.id, subQ.id, val)}
                                                disabled={isSubmitted}
                                            >
                                                <ExamSelectTrigger className={cn(
                                                    isSubmitted && (subIsCorrect ? 'border-green-500' : 'border-destructive')
                                                )}>
                                                    <ExamSelectValue placeholder="Choose..." />
                                                </ExamSelectTrigger>
                                                <ExamSelectContent>
                                                    {questionGroup.matchingOptions?.map((opt, idx) => (
                                                        <ExamSelectItem key={idx} value={opt}>{opt}</ExamSelectItem>
                                                    ))}
                                                </ExamSelectContent>
                                            </ExamSelect>
                                        </div>
                                        {isSubmitted && renderFeedback(subQ.id, subIsCorrect, correctAnswer, questionGroup.explanation)}
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

    return (
        <div className="font-exam text-base text-exam-text">
            <div className="p-4 border-b">
                 <h2 className="font-bold">{questionRangeText}</h2>
                 <div className="text-sm text-gray-600 mt-1">
                    <InteractivePassage id={`instruction-${questionGroup.id}`} text={questionGroup.instruction} {...passageProps} as="div" />
                 </div>
            </div>
            <div className="p-4">
                 <QuestionContent />
            </div>
        </div>
    )
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
        if (q.type === 'multiple-answer') {
            return acc + 1; // Count as one scorable item
        }
        return acc + 1;
    }, 0);
  }, []);
  
  const handleSubmit = useCallback(async () => {
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
            const correctAnswerSorted = [...(q.correctAnswer as string[] || [])].sort();
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
  }, [answers, isSubmitted, readingTest.id, totalQuestions, user, toast]);

  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) {
        console.log('Time is up! Submitting test.');
        handleSubmit();
    }
  }, [isSubmitted, handleSubmit]);


  const questionsWithStatus = useMemo((): QuestionState[] => {
      const flatQuestions: QuestionState[] = [];
      initialQuestions.forEach((group, groupIndex) => {
          const isGroupReviewed = reviewedQuestions.has(group.id);
          if (group.subQuestions) {
              group.subQuestions.forEach(subQ => {
                  const isAnswered = !!(answers[group.id]?.[subQ.id]);
                  flatQuestions.push({
                      id: subQ.id,
                      status: isAnswered ? 'answered' : 'unanswered',
                      isReviewed: isGroupReviewed,
                      passage: group.passage,
                      originalQuestionIndex: groupIndex,
                  });
              });
          } else {
               const isAnswered = !!(answers[group.id]?.[group.id]);
               flatQuestions.push({
                  id: group.id,
                  status: isAnswered ? 'answered' : 'unanswered',
                  isReviewed: isGroupReviewed,
                  passage: group.passage,
                  originalQuestionIndex: groupIndex,
              });
          }
      });
      // Ensure sorting by numeric ID
      return flatQuestions.sort((a,b) => parseInt(a.id) - parseInt(b.id));
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


  if (currentPassageIndex === undefined || currentPassageIndex < 0) {
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
            totalQuestionGroups={initialQuestions.length}
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
                    <div className="pb-48">
                      {isSubmitted && <div className="p-4"><ResultsCard score={score} total={totalQuestions} /></div>}
                      {passageQuestions.map((question, index) => (
                          <QuestionPanel
                              key={question.id}
                              questionGroup={question}
                              answers={answers}
                              onAnswerChange={handleAnswerChange}
                              isSubmitted={isSubmitted}
                              {...passageProps}
                          />
                      ))}
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
