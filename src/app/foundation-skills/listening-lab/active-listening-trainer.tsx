'use client';

import { useState, useMemo } from 'react';
import { getListeningFeedback, type GetListeningFeedbackOutput } from '@/ai/flows/get-listening-feedback';
import type { ActiveListeningExercise } from '@/lib/course-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Volume2, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


function HighlightedTranscript({ text }: { text: string }) {
    const parts = text.split(/(\*.*?\*)/g).filter(part => part.length > 0);

    return (
        <p className="whitespace-pre-wrap font-body text-base leading-relaxed bg-muted p-4 rounded-lg border">
        {parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
            return (
                <span key={index} className="bg-destructive/20 text-destructive font-semibold rounded-md px-1">
                {part.substring(1, part.length - 1)}
                </span>
            );
            }
            return part;
        })}
        </p>
    );
}


export function ActiveListeningTrainer({ exercises }: { exercises: ActiveListeningExercise[] }) {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<GetListeningFeedbackOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const currentExercise = exercises[currentExerciseIndex];

    const playAudio = () => {
        const audio = new Audio(currentExercise.audioUrl);
        audio.play().catch(e => console.error("Error playing audio:", e));
    };

    const handleCheckAnswer = async () => {
        if (!userInput.trim()) {
            toast({
                variant: 'destructive',
                title: 'No Input',
                description: 'Please type what you heard before checking.',
            });
            return;
        }

        setIsLoading(true);
        setFeedback(null);

        try {
            const result = await getListeningFeedback({
                originalTranscript: currentExercise.transcript,
                userTranscript: userInput,
            });
            setFeedback(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not get feedback from the AI. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        const nextIndex = (currentExerciseIndex + 1) % exercises.length;
        setCurrentExerciseIndex(nextIndex);
        setUserInput('');
        setFeedback(null);
    }
    
    const isSubmitted = feedback !== null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Active Listening Trainer</CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">New</Badge>
                </div>
                <CardDescription>
                    Listen to the clip, type what you hear, and get instant AI feedback.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 bg-secondary/30">
                    <h3 className="font-semibold text-lg">{currentExercise.title}</h3>
                    <Button onClick={playAudio} variant="outline" size="icon" aria-label="Play audio clip">
                        <Volume2 className="h-5 w-5" />
                    </Button>
                </div>

                <Textarea
                    placeholder="Type what you heard here..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isLoading || isSubmitted}
                    rows={4}
                />
                
                {!isSubmitted && (
                    <Button onClick={handleCheckAnswer} disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Check My Answer
                    </Button>
                )}

                {isSubmitted && (
                    <div className="space-y-4 animate-in fade-in-50">
                        <Card className={cn("border-2", feedback.isCorrect ? "border-green-500 bg-green-50" : "border-destructive bg-red-50")}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    {feedback.isCorrect ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-destructive" />}
                                    <div>
                                        <CardTitle className={cn(feedback.isCorrect ? "text-green-700" : "text-destructive")}>
                                            {feedback.isCorrect ? "Perfect!" : "Almost There!"}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        <div>
                            <h4 className="font-semibold mb-2">Your Submission:</h4>
                            <HighlightedTranscript text={feedback.highlightedTranscript} />
                        </div>
                        
                         {!feedback.isCorrect && (
                             <div>
                                <h4 className="font-semibold mb-2">Correct Version:</h4>
                                <p className="whitespace-pre-wrap font-body text-base leading-relaxed bg-muted p-4 rounded-lg border">
                                    {currentExercise.transcript}
                                </p>
                             </div>
                        )}

                        <Button onClick={handleNext}>
                            Next Clip <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
