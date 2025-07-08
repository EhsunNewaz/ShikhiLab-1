
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getPronunciationFeedback, type PronunciationAnalysis } from '@/ai/flows/get-pronunciation-feedback';
import { Loader2, Mic, Square, Sparkles, AlertCircle, Microscope } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { blobToDataURI } from '@/lib/utils';
import PronunciationVisualizer from '@/components/practice/pronunciation-visualizer';

// Hardcoded sentence for the lab
const PRACTICE_SENTENCE = "It's an interesting idea and I'd like to think about it for a bit.";

export default function PronunciationLabPage() {
    const [hasPermission, setHasPermission] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState<PronunciationAnalysis | null>(null);
    const userAudioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

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
        if (!audioBlob) return;
        
        setIsGettingFeedback(true);
        setFeedbackData(null);
        try {
            const audioDataUri = await blobToDataURI(audioBlob);
            const result = await getPronunciationFeedback({
                modelText: PRACTICE_SENTENCE,
                userAudioDataUri: audioDataUri,
            });
            setFeedbackData(result);
        } catch (error) {
            console.error("Failed to get pronunciation feedback:", error);
            toast({
                variant: 'destructive',
                title: 'Feedback Error',
                description: 'Could not generate AI feedback. Please try again.'
            });
        } finally {
            setIsGettingFeedback(false);
        }
    };

    const isBusy = isRecording || isGettingFeedback;

    return (
        <div className="container mx-auto py-6 sm:py-10 max-w-3xl">
            <header className="mb-8 flex items-start gap-4">
                 <div className="p-3 bg-primary/10 rounded-lg">
                    <Microscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Pronunciation Lab</h1>
                    <p className="text-muted-foreground mt-2">Get detailed feedback on your rhythm, linking, and pronunciation.</p>
                </div>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Practice Sentence</CardTitle>
                    <CardDescription>Read the sentence below, record your voice, and then click "Analyze" for feedback.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg border text-xl font-semibold">
                        <p>{PRACTICE_SENTENCE}</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
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
                                    Analyze My Pronunciation
                                </Button>
                            </>
                        )}
                    </div>
                    
                    {isGettingFeedback && (
                        <div className="text-center p-8 space-y-4">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/>
                            <p className="text-muted-foreground">Our AI coach is analyzing your speech...</p>
                        </div>
                    )}

                    {feedbackData && (
                        <div className="space-y-4 animate-in fade-in-50">
                             <Card>
                                <CardHeader><CardTitle>Visual Feedback</CardTitle></CardHeader>
                                <CardContent>
                                    <PronunciationVisualizer text={PRACTICE_SENTENCE} analysis={feedbackData} />
                                </CardContent>
                             </Card>
                              <Card className="bg-blue-50 border-blue-200">
                                <CardHeader><CardTitle className="text-blue-800">Overall Feedback (বাংলা)</CardTitle></CardHeader>
                                <CardContent className="text-blue-900">
                                    <p>{feedbackData.overallFeedback}</p>
                                </CardContent>
                             </Card>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
