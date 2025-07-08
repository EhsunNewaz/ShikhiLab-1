'use client';

import { useState, useRef } from 'react';
import type { ShadowingExercise, ShadowingSegment, SpeakingFeedback, ComprehensiveSpeakingFeedback } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Mic, Square, Sparkles, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { getSpeakingFeedback } from '@/ai/flows/get-speaking-feedback';
import { getComprehensiveSpeakingFeedback } from '@/ai/flows/get-comprehensive-speaking-feedback';
import { blobToDataURI } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ComprehensiveFeedbackCard } from './comprehensive-feedback-card';


// Session cache for model answer audio to avoid re-generating
const audioCache: Record<string, string> = {};

interface ShadowingExercisePlayerProps {
    exercise: ShadowingExercise;
    hasMicrophonePermission: boolean;
}

const SegmentPlayer = ({ segment, hasMicrophonePermission }: { segment: ShadowingSegment, hasMicrophonePermission: boolean }) => {
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
        if (!hasMicrophonePermission) {
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
        <div className="space-y-4 p-4 border rounded-md">
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
}

const IndependentResponsePlayer = ({ exercise, hasMicrophonePermission }: { exercise: ShadowingExercise, hasMicrophonePermission: boolean }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [feedback, setFeedback] = useState<ComprehensiveSpeakingFeedback | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const { toast } = useToast();

     const startRecording = async () => {
        if (!hasMicrophonePermission) {
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
            const result = await getComprehensiveSpeakingFeedback({
                questionText: exercise.cueCard.join('\n'),
                userAudioDataUri: audioDataUri,
            });
            setFeedback(result);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error getting feedback.' });
        } finally {
            setIsGettingFeedback(false);
        }
    };

    const isBusy = isRecording || isGettingFeedback;

    return (
        <div className="space-y-4">
            <Button onClick={isRecording ? stopRecording : startRecording} disabled={isBusy && !isRecording}>
                {isRecording ? <><Square className="mr-2"/> Stop Recording</> : <><Mic className="mr-2"/> Record Your Answer</>}
            </Button>
            {userAudioBlob && (
                <div className="space-y-4">
                    <audio src={URL.createObjectURL(userAudioBlob)} controls className="w-full" />
                    <Button onClick={handleGetFeedback} disabled={isBusy}>
                        {isGettingFeedback ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                        Get Comprehensive Feedback
                    </Button>
                </div>
            )}
            {isGettingFeedback && (
                 <div className="flex justify-center items-center p-6 text-muted-foreground"><Loader2 className="mr-2 animate-spin"/>Analyzing...</div>
            )}
            {feedback && <ComprehensiveFeedbackCard feedback={feedback}/>}
        </div>
    )
}

export default function ShadowingExercisePlayer({ exercise, hasMicrophonePermission }: ShadowingExercisePlayerProps) {
    return (
        <div className="space-y-6">
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle>Cue Card</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                    <ul>
                        {exercise.cueCard.map((line, index) => (
                            <li key={index}>{line.startsWith('•') ? <strong>{line}</strong> : line}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            <Tabs defaultValue="shadowing" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="shadowing">Shadowing Practice</TabsTrigger>
                    <TabsTrigger value="independent">Independent Response</TabsTrigger>
                </TabsList>
                <TabsContent value="shadowing" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shadowing Practice</CardTitle>
                            <CardDescription>Listen to each segment, then record yourself repeating it. Get instant feedback on your pronunciation and fluency.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full space-y-4">
                                {exercise.segments.map((segment, index) => (
                                    <AccordionItem value={segment.id} key={segment.id} className="border rounded-lg">
                                        <AccordionTrigger className="p-4 hover:no-underline text-left">
                                            <span className="font-semibold">{`Segment ${index + 1}`}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0 border-t">
                                            <SegmentPlayer segment={segment} hasMicrophonePermission={hasMicrophonePermission} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="independent" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Independent Response</CardTitle>
                            <CardDescription>Now, it's your turn. Give your own answer to the cue card prompt (1-2 minutes). When you're done, get a full evaluation based on the official IELTS criteria.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IndependentResponsePlayer exercise={exercise} hasMicrophonePermission={hasMicrophonePermission} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
