'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { Part1Exercise, QAPair, SpeakingFeedback, ComprehensiveSpeakingFeedback } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Square, Sparkles, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { getComprehensiveSpeakingFeedback } from '@/ai/flows/get-comprehensive-speaking-feedback';
import { blobToDataURI } from '@/lib/utils';
import { ComprehensiveFeedbackCard } from './comprehensive-feedback-card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


// Session cache for model answer audio to avoid re-generating
const audioCache: Record<string, string> = {};

interface Part1ExercisePlayerProps {
    exercise: Part1Exercise;
    hasMicrophonePermission: boolean;
}

const QuestionPlayer = ({ qaPair, hasMicrophonePermission }: { qaPair: QAPair, hasMicrophonePermission: boolean }) => {
    const [isModelAudioLoading, setIsModelAudioLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [feedback, setFeedback] = useState<ComprehensiveSpeakingFeedback | null>(null);
    
    const modelAudioRef = useRef<HTMLAudioElement>(null);
    const userAudioRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const { toast } = useToast();

    const playModelAudio = async () => {
        if (audioCache[qaPair.id]) {
            if (modelAudioRef.current) {
                modelAudioRef.current.src = audioCache[qaPair.id];
                modelAudioRef.current.play();
            }
            return;
        }

        setIsModelAudioLoading(true);
        try {
            const result = await textToSpeech(qaPair.transcript);
            audioCache[qaPair.id] = result.audio;
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
            const result = await getComprehensiveSpeakingFeedback({
                questionText: qaPair.question,
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
         <Tabs defaultValue="independent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="independent">Your Answer</TabsTrigger>
                <TabsTrigger value="model">Model Answer</TabsTrigger>
            </TabsList>
            <TabsContent value="independent" className="mt-4 space-y-4">
                 <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Button onClick={isRecording ? stopRecording : startRecording} disabled={isBusy && !isRecording} className="w-full sm:w-auto">
                        {isRecording ? <><Square className="mr-2"/> Stop Recording</> : <><Mic className="mr-2"/> Record Your Answer</>}
                    </Button>
                    {isRecording && <Badge className="animate-pulse">Recording...</Badge>}
                </div>
                {userAudioBlob && (
                     <div className="space-y-4">
                        <audio ref={userAudioRef} src={URL.createObjectURL(userAudioBlob)} controls className="w-full" />
                        <Button onClick={handleGetFeedback} disabled={isBusy}>
                            {isGettingFeedback ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                            Get AI Feedback
                        </Button>
                    </div>
                )}
                 {isGettingFeedback && (
                    <div className="flex justify-center items-center p-6 text-muted-foreground"><Loader2 className="mr-2 animate-spin"/>Analyzing...</div>
                )}
                {feedback && <ComprehensiveFeedbackCard feedback={feedback}/>}
            </TabsContent>
            <TabsContent value="model" className="mt-4 space-y-4">
                <div className="flex gap-4 items-center">
                    <Button onClick={playModelAudio} disabled={isBusy}>
                        {isModelAudioLoading ? <Loader2 className="mr-2 animate-spin" /> : <Volume2 className="mr-2" />}
                        Play Model Answer
                    </Button>
                </div>
                <audio ref={modelAudioRef} className="hidden" />
                 <Accordion type="single" collapsible>
                    <AccordionItem value="transcript">
                        <AccordionTrigger>View Model Transcript</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{qaPair.transcript}</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </TabsContent>
        </Tabs>
    )
}

export default function Part1ExercisePlayer({ exercise, hasMicrophonePermission }: Part1ExercisePlayerProps) {
    const [selectedTopicId, setSelectedTopicId] = useState<string>(exercise.topics[0].id);

    const selectedTopic = useMemo(() => {
        return exercise.topics.find(t => t.id === selectedTopicId) || exercise.topics[0];
    }, [exercise.topics, selectedTopicId]);
    
    return (
        <div className="space-y-4">
             <Accordion type="multiple" className="w-full space-y-4">
                {selectedTopic.questions.map((qaPair, index) => (
                    <AccordionItem value={qaPair.id} key={qaPair.id} className="border rounded-lg">
                        <AccordionTrigger className="p-4 hover:no-underline text-left">
                            <span className="font-semibold">{`Question ${index + 1}: ${qaPair.question}`}</span>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                            <QuestionPlayer qaPair={qaPair} hasMicrophonePermission={hasMicrophonePermission} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
