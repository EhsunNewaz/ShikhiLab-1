
'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { readingTestData, type ReadingQuestion } from '@/lib/course-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InteractivePassage } from '@/components/exam/interactive-passage';


export default function ReadingPracticePage() {
  const params = useParams();
  const testId = params.testId as string;

  const testData = readingTestData.find(t => t.id === testId);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  if (!testData) {
    notFound();
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    window.scrollTo(0, 0); // Scroll to top to see results
  };
  
  const score = testData.questions.reduce((acc, q) => {
      return answers[q.id] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Reading Practice</h1>
        <p className="text-xl text-muted-foreground">{testData.title}</p>
      </header>

      {isSubmitted && (
         <Card className="mb-8 bg-primary/5">
            <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Here's how you did on the practice test.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">Your Score: <Badge variant="secondary" className="text-2xl">{score} / {testData.questions.length}</Badge></p>
            </CardContent>
         </Card>
      )}

      <div className="grid md:grid-cols-2 md:gap-8 space-y-8 md:space-y-0">
        <Card className="h-fit sticky top-20">
          <CardHeader>
            <CardTitle>Reading Passage</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
              <InteractivePassage text={testData.passages[0]} className="max-w-none font-body text-base leading-relaxed" />
            </ScrollArea>
          </CardContent>
        </Card>

        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {testData.questions.map((q, index) => (
                        <div key={q.id}>
                            <div className="flex justify-between items-start">
                                <p className="font-semibold mb-2">{index + 1}. {q.questionText}</p>
                                {isSubmitted && (
                                     answers[q.id] === q.correctAnswer ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive" />
                                )}
                            </div>
                            <RadioGroup
                                value={answers[q.id]}
                                onValueChange={(value) => handleAnswerChange(q.id, value)}
                                disabled={isSubmitted}
                            >
                                {q.options.map((option) => {
                                    const isCorrect = option === q.correctAnswer;
                                    const isSelected = answers[q.id] === option;
                                    return (
                                        <div key={option} className={cn(
                                            "flex items-center space-x-2 p-2 rounded-md",
                                            isSubmitted && isCorrect && "bg-green-100 border-green-300 border",
                                            isSubmitted && !isCorrect && isSelected && "bg-red-100 border-red-300 border"
                                        )}>
                                            <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                                            <Label htmlFor={`${q.id}-${option}`}>{option}</Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                            {isSubmitted && (
                                <div className="mt-3 p-3 text-sm bg-muted/50 rounded-lg">
                                    <p><span className="font-bold">Correct Answer:</span> {q.correctAnswer}</p>
                                    <p><span className="font-bold">Explanation:</span> {q.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {!isSubmitted && (
                        <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== testData.questions.length}>
                            Submit Answers
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
