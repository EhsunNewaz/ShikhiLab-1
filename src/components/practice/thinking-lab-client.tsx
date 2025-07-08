'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getThinkingPrompt, type GetThinkingPromptOutput, type GetThinkingPromptInput } from '@/ai/flows/get-thinking-prompt';
import { getThinkingFeedback, type GetThinkingFeedbackOutput } from '@/ai/flows/get-thinking-feedback';
import { Loader2, Wand2, Lightbulb, ListChecks, CheckSquare, Mic, Square, Sparkles, AlertCircle, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { blobToDataURI } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ThinkingFeedbackCard = ({ feedback, prompt }: { feedback: GetThinkingFeedbackOutput, prompt: GetThinkingPromptOutput }) => {
    const { toast } = useToast();

    const handleCopy = () => {
        const guideText = prompt.structureGuide.map(step => `- ${step.step}: ${step.description}`).join('\n');

        const formattedText = [
            '**Thinking Lab Feedback**\n',
            `**Question:**\n${prompt.question}\n`,
            `**Structure Guide (Bengali):**\n${guideText}\n`,
            '--------------------\n',
            `**My Answer (Transcript):**\n${feedback.transcript}\n`,
            '--------------------\n',
            `**AI Structural Feedback (English):**\n${feedback.structuralFeedback}\n`,
            `**AI Language Feedback (Bengali):**\n${feedback.languageFeedback}`
        ].join('\n');

        navigator.clipboard.writeText(formattedText).then(() => {
            toast({
                title: "Copied to Clipboard!",
                description: "Your feedback report is ready to be pasted.",
            });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({
                variant: 'destructive',
                title: "Copy Failed",
                description: "Could not copy feedback to your clipboard.",
            });
        });
    };
    
    return (
    <Card className="shadow-lg mt-6 animate-in fade-in-50 duration-500">
        <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
            <CardDescription>Here's a breakdown of your response.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="transcript" className="font-semibold">Your Answer (Transcript)</Label>
                <Textarea id="transcript" readOnly value={feedback.transcript} className="mt-2 h-32 bg-muted/50"/>
            </div>
            
            <div className="space-y-2">
                <h4 className="font-semibold">Structural Feedback (in English)</h4>
                <div className="p-4 bg-muted/50 rounded-lg prose prose-sm max-w-none dark:prose-invert">
                    <p>{feedback.structuralFeedback}</p>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold">Language Feedback (in Bengali)</h4>
                <div className="p-4 bg-muted/50 rounded-lg prose prose-sm max-w-none dark:prose-invert">
                    <p>{feedback.languageFeedback}</p>
                </div>
            </div>
        </CardContent>
         <CardFooter>
            <Button onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Feedback
            </Button>
        </CardFooter>
    </Card>
);
}


export default function ThinkingLabClient() {
    const [promptData, setPromptData] = useState<GetThinkingPromptOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);
    const { toast } = useToast();

    // New state for recording and feedback
    const [hasPermission, setHasPermission] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState<GetThinkingFeedbackOutput | null>(null);
    const userAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const getPermission = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    setHasPermission(true);
                    stream.getTracks().forEach(track => track.stop());
                } else {
                     setHasPermission(false);
                }
            } catch (err) {
                setHasPermission(false);
            }
        };
        getPermission();
    }, []);

    const fetchNewPrompt = async () => {
        setIsLoading(true);
        setPromptData(null);
        setAudioBlob(null);
        setFeedbackData(null);

        let difficulty: GetThinkingPromptInput['difficulty'];
        if (sessionCount === 0) {
            difficulty = 'easy';
        } else if (sessionCount <= 2) {
            difficulty = 'medium';
        } else {
            difficulty = 'hard';
        }

        try {
            const result = await getThinkingPrompt({ difficulty });
            setPromptData(result);
            setSessionCount(prev => prev + 1);
        } catch (error) {
            console.error("Failed to get thinking prompt:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not generate a new prompt. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const startRecording = async () => {
        if (!hasPermission) {
            toast({ variant: 'destructive', title: 'Microphone access is required.' });
            return;
        }
        setAudioBlob(null);
        setFeedbackData(null);
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        const audioChunks: Blob[] = [];
        recorder.ondataavailable = (event) => audioChunks.push(event.data);
        recorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            setAudioBlob(blob);
            stream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setIsRecording(false);
    };

    const handleGetFeedback = async () => {
        if (!audioBlob || !promptData) return;
        
        setIsGettingFeedback(true);
        setFeedbackData(null);
        try {
            const audioDataUri = await blobToDataURI(audioBlob);
            const result = await getThinkingFeedback({
                question: promptData.question,
                structureGuide: promptData.structureGuide,
                userAudioDataUri: audioDataUri,
            });
            setFeedbackData(result);
        } catch (error) {
            console.error("Failed to get thinking feedback:", error);
            toast({
                variant: 'destructive',
                title: 'Feedback Error',
                description: 'Could not generate AI feedback. Please try again.'
            });
        } finally {
            setIsGettingFeedback(false);
        }
    };

    const isBusy = isLoading || isRecording || isGettingFeedback;

    return (
        <div className="space-y-6">
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>How to Use the Thinking Lab</AlertTitle>
                <AlertDescription>
                   1. Get a topic and a Bengali guide. 2. Record your answer in English. 3. Get AI feedback on your structure (in English) and language (in Bengali).
                </AlertDescription>
            </Alert>

            <div className="text-center">
                <Button onClick={fetchNewPrompt} disabled={isBusy} size="lg">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    {sessionCount === 0 ? 'Generate First Topic' : 'Generate Next Topic'}
                </Button>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}

            {promptData && (
                <div className="animate-in fade-in-50 duration-500">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ListChecks className="text-primary"/>
                                    The Question
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-semibold">{promptData.question}</p>
                            </CardContent>
                        </Card>
                         <Card className="shadow-lg">
                            <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="text-primary"/>
                                    Structural Guide (in Bengali)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {promptData.structureGuide.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                        <CheckSquare className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold">{step.step}</h4>
                                            <p className="text-muted-foreground text-sm">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-lg mt-6">
                        <CardHeader>
                            <CardTitle>Practice Your Answer</CardTitle>
                             <CardDescription>Use the guide above to structure your thoughts, then record your answer in English.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                             {!hasPermission && (
                                <Alert variant="destructive" className="w-full">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Microphone Permission Required</AlertTitle>
                                    <AlertDescription>
                                        Please grant microphone access in your browser to record your answer.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {isRecording ? (
                                <Button onClick={stopRecording} variant="destructive" className="w-64"><Square className="mr-2"/> Stop Recording</Button>
                            ) : (
                                <Button onClick={startRecording} disabled={isBusy || !hasPermission} className="w-64"><Mic className="mr-2"/> Record Answer</Button>
                            )}
                             {audioBlob && (
                                <>
                                    <audio ref={userAudioRef} src={URL.createObjectURL(audioBlob)} className="w-full" controls/>
                                    <Button onClick={handleGetFeedback} disabled={isBusy} className="w-64">
                                        {isGettingFeedback ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2" />}
                                        Get AI Feedback
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    
                    {isGettingFeedback && (
                        <Card className="max-w-2xl mx-auto text-center shadow-lg mt-6">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <h3 className="text-lg font-semibold">Our AI coach is analyzing your response...</h3>
                                    <p className="text-muted-foreground">Thinking on your feet is a skill. You're building it right now.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {feedbackData && promptData && <ThinkingFeedbackCard feedback={feedbackData} prompt={promptData}/>}

                </div>
            )}
        </div>
    );
}
