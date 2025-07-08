'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { ListeningLabExercise } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, Loader2, Volume2, RotateCcw, PartyPopper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// A simple session-level cache to avoid re-generating audio constantly.
const globalAudioCache: Record<string, string> = {};

export default function ListeningLabPlayer({ exercise }: { exercise: ListeningLabExercise }) {
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [inputs, setInputs] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<Array<'correct' | 'incorrect' | 'unchecked'>>([]);
    const [hasChecked, setHasChecked] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

    const currentChunk = exercise.chunks[currentChunkIndex];
    const words = useMemo(() => currentChunk.text.split(' '), [currentChunk]);
    const gapWords = useMemo(() => currentChunk.gaps.map(g => words[g].toLowerCase().replace(/[.,]/g, '')), [currentChunk, words]);
    
    useEffect(() => {
        setInputs(new Array(gapWords.length).fill(''));
        setFeedback(new Array(gapWords.length).fill('unchecked'));
        setHasChecked(false);
    }, [currentChunkIndex, gapWords.length]);


    const handlePlayAudio = async () => {
        const cachedAudio = globalAudioCache[currentChunk.id];
        if (cachedAudio && audioRef.current) {
            audioRef.current.src = cachedAudio;
            audioRef.current.play();
            return;
        }

        setIsAudioLoading(true);
        try {
            const result = await textToSpeech(currentChunk.text);
            const newAudioSrc = result.audio;
            
            globalAudioCache[currentChunk.id] = newAudioSrc;

            if (audioRef.current) {
                audioRef.current.src = newAudioSrc;
                audioRef.current.play();
            }
        } catch (error) {
            console.error('TTS Error:', error);
            toast({ variant: 'destructive', title: 'Audio Error', description: 'Failed to load audio.' });
        } finally {
            setIsAudioLoading(false);
        }
    };

    const handleInputChange = (index: number, value: string) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
    };

    const handleCheckAnswers = () => {
        const newFeedback = inputs.map((input, i) =>
            input.trim().toLowerCase() === gapWords[i] ? 'correct' : 'incorrect'
        );
        setFeedback(newFeedback);
        setHasChecked(true);
    };

    const handleNextChunk = () => {
        if (currentChunkIndex < exercise.chunks.length - 1) {
            setCurrentChunkIndex(prev => prev + 1);
        } else {
            setIsComplete(true);
        }
    };
    
    const handleRestart = () => {
        setCurrentChunkIndex(0);
        setIsComplete(false);
    };

    const progress = (currentChunkIndex / exercise.chunks.length) * 100;
    let gapCounter = 0;
    
    if (isComplete) {
        return (
            <Card className="text-center">
                <CardHeader><CardTitle>Exercise Complete!</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <PartyPopper className="w-16 h-16 text-yellow-500"/>
                    <Button onClick={handleRestart}><RotateCcw className="mr-2"/> Practice Again</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle>{exercise.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">{exercise.difficulty}</Badge>
                </div>
                <CardDescription>{exercise.description}</CardDescription>
                <Progress value={progress} className="mt-4"/>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="p-4 bg-muted">
                    <div className="flex items-center gap-4">
                        <Button onClick={handlePlayAudio} disabled={isAudioLoading} size="lg">
                            {isAudioLoading ? <Loader2 className="animate-spin" /> : <Volume2 />}
                        </Button>
                        <p className="text-sm text-muted-foreground">Listen and fill in the gaps.</p>
                    </div>
                </Card>

                <div className="text-2xl leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-4">
                    {words.map((word, index) => {
                        if (currentChunk.gaps.includes(index)) {
                            const currentGapIndex = gapCounter++;
                            const isCorrect = feedback[currentGapIndex] === 'correct';
                            const isIncorrect = feedback[currentGapIndex] === 'incorrect';
                            return (
                                <div key={index} className="inline-block">
                                    <Input
                                        type="text"
                                        value={inputs[currentGapIndex] || ''}
                                        onChange={(e) => handleInputChange(currentGapIndex, e.target.value)}
                                        disabled={hasChecked}
                                        className={cn(
                                            'w-36 h-10 text-xl inline-block text-center',
                                            hasChecked && isCorrect && 'bg-green-100 border-green-500',
                                            hasChecked && isIncorrect && 'bg-red-100 border-red-500'
                                        )}
                                        placeholder="......"
                                    />
                                    {hasChecked && isIncorrect && (
                                        <p className="text-xs text-center text-green-600 font-semibold pt-1">{gapWords[currentGapIndex]}</p>
                                    )}
                                </div>
                            );
                        }
                        return <span key={index}>{word}</span>;
                    })}
                </div>
                
                <div className="flex justify-end pt-4">
                    {hasChecked ? (
                        <Button onClick={handleNextChunk} size="lg">Next <ArrowRight className="ml-2"/></Button>
                    ) : (
                        <Button onClick={handleCheckAnswers} size="lg" disabled={inputs.some(i => i === '')}>Check <Check className="ml-2"/></Button>
                    )}
                </div>
            </CardContent>
            <audio ref={audioRef} className="hidden" />
        </Card>
    );
}
