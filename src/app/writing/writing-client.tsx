
'use client';

import { useState, useMemo } from 'react';
import { getWritingFeedback, type GetWritingFeedbackOutput } from '@/ai/flows/get-writing-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { WordCounter } from '@/components/exam/word-counter';

const practiceQuestions = [
  { id: 't2_1', type: 'Task 2', question: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?' },
  { id: 't2_2', type: 'Task 2', question: 'In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this.' },
  { id: 't2_3', type: 'Task 2', question: 'Some people think that governments should ban dangerous sports, while others think people should have the freedom to do any sports or activity they choose. Discuss both these views and give your own opinion.' },
  { id: 't1_1', type: 'Task 1 (Academic)', question: 'The chart below shows the changes in the share of the population in different sectors of employment in country X between 1980 and 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.' },
];

type FeedbackCategoryProps = {
  title: string;
  score: number;
  feedback: string;
};

function FeedbackCategory({ title, score, feedback }: FeedbackCategoryProps) {
  return (
    <Card className="bg-white/50">
      <CardHeader className="pb-2">
         <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium text-primary">{title}</CardTitle>
          <span className="font-bold text-lg text-primary">{score.toFixed(1)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{feedback}</p>
      </CardContent>
    </Card>
  );
}

export default function WritingClient() {
  const [selectedQuestionId, setSelectedQuestionId] = useState(practiceQuestions[0].id);
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState<GetWritingFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectedQuestion = useMemo(
    () => practiceQuestions.find(q => q.id === selectedQuestionId)!,
    [selectedQuestionId]
  );
  
  const wordCount = useMemo(() => {
    if (!essay.trim()) return 0;
    return essay.trim().split(/\s+/).filter(Boolean).length;
  }, [essay]);
  
  const wordCountMin = selectedQuestion.type === 'Task 1 (Academic)' ? 150 : 250;

  const handleGetFeedback = async () => {
    if (wordCount < 50) {
      toast({
        variant: "destructive",
        title: "Essay is too short",
        description: "Please write a more complete essay (at least 50 words) to get accurate feedback.",
      });
      return;
    }
    
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await getWritingFeedback({ essay });
      setFeedback(result);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An error occurred while getting feedback. Please try again later.",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Writing Practice</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Select a question, write your essay, and get instant AI-powered feedback in simple Bangla.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Practice Question</CardTitle>
          <CardDescription>Choose an official IELTS practice question to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedQuestionId} defaultValue={selectedQuestionId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a practice question" />
            </SelectTrigger>
            <SelectContent>
              {practiceQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  ({q.type}) {q.question.substring(0, 80)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm text-foreground">{selectedQuestion.question}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Essay</CardTitle>
          <CardDescription>Write your response in the text area below. Aim for the recommended word count.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="আপনার রচনাটি এখানে লিখুন..."
            className="min-h-[300px] text-base bg-white"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={isLoading}
          />
           <div className="text-right mt-2">
            <WordCounter wordCount={wordCount} min={wordCountMin} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleGetFeedback} disabled={isLoading || !essay.trim()} size="lg" className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Get Feedback'
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="text-center p-8 space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/>
          <p className="text-muted-foreground">Our AI Mentor is analyzing your essay... This may take a moment.</p>
        </div>
      )}

      {feedback && (
        <Card className="w-full animate-in fade-in-50 duration-500">
          <CardHeader className="text-center bg-primary/5 rounded-t-lg">
            <CardTitle className="text-3xl font-bold font-headline">Your Feedback Report</CardTitle>
            <CardDescription>আপনার রচনার বিস্তারিত বিশ্লেষণ নিচে দেওয়া হলো।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 p-6 bg-muted/50 rounded-lg">
               <CircularProgress value={feedback.overallScore} />
               <div className="text-center sm:text-left">
                <p className="text-lg text-muted-foreground">Overall Band Score</p>
                <p className="text-5xl font-bold text-primary font-headline">{feedback.overallScore.toFixed(1)}</p>
               </div>
            </div>
            
            <Card className="bg-white/50">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Overall Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feedback.overallFeedback}</p>
              </CardContent>
            </Card>

            <Separator />
            <h3 className="text-xl font-headline font-semibold text-center text-primary">Detailed Breakdown</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <FeedbackCategory 
                title="Task Achievement" 
                score={feedback.taskAchievement.score} 
                feedback={feedback.taskAchievement.feedback}
              />
              <FeedbackCategory 
                title="Coherence and Cohesion" 
                score={feedback.coherenceAndCohesion.score} 
                feedback={feedback.coherenceAndCohesion.feedback}
              />
              <FeedbackCategory 
                title="Lexical Resource" 
                score={feedback.lexicalResource.score} 
                feedback={feedback.lexicalResource.feedback}
              />
              <FeedbackCategory 
                title="Grammatical Range & Accuracy" 
                score={feedback.grammaticalRangeAndAccuracy.score} 
                feedback={feedback.grammaticalRangeAndAccuracy.feedback}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
