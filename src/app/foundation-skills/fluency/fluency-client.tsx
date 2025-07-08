'use client';

import { useState, useRef, useEffect } from 'react';
import type { FluencyExercise } from '@/lib/course-data';
import type { SpeakingFeedback } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Mic, Square, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { getSpeakingFeedback } from '@/ai/flows/get-speaking-feedback';
import { blobToDataURI } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Session cache for model answer audio to avoid re-generating
const audioCache: Record<string, string> = {};

const SegmentPlayer = ({ segment, hasPermission }: { segment: FluencyExercise['segments'][0], hasPermission: boolean }) => {
    const [isModelAudioLoading, setIsModelAudioLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
    
    const modelAudioRef = useRef<HTMLAudioElement>(null);
    const userAudioRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const { toast } = useToast();

    const playModelAudio = async () => {
        if (audioCache[segment.id]) {
            if (modelAudioRef.current) {
                modelAudioRef.current.src = audioCache[segment.id];
                modelAudioRef.current.play();
            }
            return;
        }

        setIsModelAudioLoading(true);
        try {
            const result = await textToSpeech(segment.text);
            audioCache[segment.id] = result.audio;
            if (modelAudioRef.current) {
                modelAudioRef.current.src = result.audio;
                modelAudioRef.current.play();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Could not load audio.' });
        } finally {
            setIsModelAudioLoading(false);
        }
    };
    
    const startRecording = async () => {
        if (!hasPermission) {
            toast({ variant: 'destructive', title: 'Microphone permission required.' });
            return;
        }
        setUserAudioBlob(null);
        setFeedback(null);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => chunks.push(event.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setUserAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            recorder.start();
            setIsRecording(true);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Could not start recording.' });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const handleGetFeedback = async () => {
        if (!userAudioBlob) return;
        setIsGettingFeedback(true);
        setFeedback(null);
        try {
            const audioDataUri = await blobToDataURI(userAudioBlob);
            const result = await getSpeakingFeedback({
                modelAnswerText: segment.text,
                userAudioDataUri: audioDataUri,
            });
            setFeedback(result);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error getting feedback.' });
        } finally {
            setIsGettingFeedback(false);
        }
    };

    const isBusy = isModelAudioLoading || isRecording || isGettingFeedback;

    return (
        <div className="space-y-4 p-4">
            <p className="text-muted-foreground">{segment.text}</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={playModelAudio} disabled={isBusy} variant="outline" className="w-full sm:w-auto">
                    {isModelAudioLoading ? <Loader2 className="mr-2 animate-spin" /> : <Volume2 className="mr-2" />}
                    Listen
                </Button>
                <Button onClick={isRecording ? stopRecording : startRecording} disabled={isBusy && !isRecording} className="w-full sm:w-auto">
                    {isRecording ? <><Square className="mr-2"/> Stop</> : <><Mic className="mr-2"/> Record</>}
                </Button>
            </div>
            {userAudioBlob && (
                 <div className="space-y-4">
                    <audio ref={userAudioRef} src={URL.createObjectURL(userAudioBlob)} controls className="w-full" />
                    <Button onClick={handleGetFeedback} disabled={isBusy}>
                        {isGettingFeedback ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                        Get Feedback
                    </Button>
                </div>
            )}
             {feedback && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle>AI Feedback (বাংলা)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <div className="text-center p-2 rounded-md bg-background flex-1">
                                <p className="font-bold text-lg text-primary">{feedback.fluencyScore}/9</p>
                                <p className="text-xs text-muted-foreground">Fluency</p>
                            </div>
                            <div className="text-center p-2 rounded-md bg-background flex-1">
                                <p className="font-bold text-lg text-primary">{feedback.pronunciationScore}/9</p>
                                <p className="text-xs text-muted-foreground">Pronunciation</p>
                            </div>
                        </div>
                        <p>{feedback.feedback}</p>
                    </CardContent>
                </Card>
            )}
            <audio ref={modelAudioRef} className="hidden" />
        </div>
    )
};


export default function FluencyClient({ exercises }: { exercises: FluencyExercise[] }) {
    const [hasPermission, setHasPermission] = useState(false);

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
                console.error('Error getting microphone permission:', err);
                setHasPermission(false);
            }
        };
        getPermission();
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>How to Practice Shadowing</CardTitle>
                    <CardDescription>Follow these simple steps for each sentence.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. Press "Listen" to hear the model audio.</p>
                    <p>2. Press "Record" and speak along with the recording, trying to match the speaker's speed, rhythm, and intonation.</p>
                    <p>3. Press "Get Feedback" to see your AI-generated scores and advice.</p>
                    <p>4. Repeat until you feel confident, then move to the next segment.</p>
                </CardContent>
            </Card>

            {!hasPermission && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Microphone Permission Required</AlertTitle>
                    <AlertDescription>
                        Recording features are disabled. Please grant microphone access in your browser to practice.
                    </AlertDescription>
                </Alert>
            )}
            
            {exercises.map(exercise => (
                <Card key={exercise.id}>
                    <CardHeader>
                        <CardTitle>{exercise.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {exercise.segments.map((segment, index) => (
                                <AccordionItem value={segment.id} key={segment.id} className="border rounded-lg">
                                    <AccordionTrigger className="p-4 hover:no-underline text-left">
                                        <span className="font-semibold">{`Segment ${index + 1}`}</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-0 border-t">
                                        <SegmentPlayer segment={segment} hasPermission={hasPermission} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
