'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { shadowingExercises } from '@/lib/shadowing-data';
import { part1Exercises } from '@/lib/part1-data';
import { part3Exercises } from '@/lib/part3-data';
import { useToast } from '@/hooks/use-toast';
import ShadowingExercisePlayer from '@/components/practice/shadowing-exercise-player';
import Part1ExercisePlayer from '@/components/practice/part1-exercise-player';
import Part3ExercisePlayer from '@/components/practice/part3-exercise-player';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Mic } from 'lucide-react';

export default function SpeakingLabPage() {
    const [hasPermission, setHasPermission] = useState(false);
    const [activeTab, setActiveTab] = useState('part1');
    const [selectedPart2ExerciseId, setSelectedPart2ExerciseId] = useState<string>(shadowingExercises[0]?.id || '');
    const { toast } = useToast();

    const selectedPart2Exercise = shadowingExercises.find(ex => ex.id === selectedPart2ExerciseId);
    const part1Exercise = part1Exercises[0]; 
    // This logic assumes Part 3 is linked to the selected Part 2.
    const part3Exercise = part3Exercises.find(ex => ex.part2TopicId === selectedPart2ExerciseId) || part3Exercises[0]; 

    useEffect(() => {
        const getPermission = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    setHasPermission(true);
                    // Important: stop the track immediately after getting permission
                    stream.getTracks().forEach(track => track.stop());
                } else {
                     setHasPermission(false);
                     toast({
                        variant: 'destructive',
                        title: 'Audio Recording Not Supported',
                        description: 'Your browser does not support microphone access.',
                    });
                }
            } catch (err) {
                console.error('Error getting microphone permission:', err);
                setHasPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Microphone Access Denied',
                    description: 'Please enable microphone permissions in your browser settings to use the recording feature.',
                });
            }
        };
        getPermission();
    }, [toast]);
    
    return (
        <div className="container mx-auto py-6 sm:py-10 max-w-5xl">
            <header className="mb-8 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Mic className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Speaking Lab</h1>
                    <p className="text-muted-foreground mt-2">Hone your speaking skills for all parts of the test with targeted exercises and AI feedback.</p>
                </div>
            </header>

            {!hasPermission && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Microphone Permission Required</AlertTitle>
                    <AlertDescription>
                        Recording features are disabled. Please grant microphone access in your browser to practice.
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="part1" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="part1">Part 1: The Interview</TabsTrigger>
                    <TabsTrigger value="part2">Part 2: The Long Turn</TabsTrigger>
                    <TabsTrigger value="part3">Part 3: The Discussion</TabsTrigger>
                </TabsList>
                 <TabsContent value="part1" className="mt-6">
                    {activeTab === 'part1' && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Part 1 Practice</CardTitle>
                                <CardDescription>Practice answering common interview questions about familiar topics. Record your answer and get comprehensive AI feedback.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {part1Exercise ? (
                                    <Part1ExercisePlayer exercise={part1Exercise} hasMicrophonePermission={hasPermission} />
                                ) : (
                                    <p>No Part 1 exercises available yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="part2" className="mt-6">
                   {activeTab === 'part2' && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Part 2 Practice</CardTitle>
                                <CardDescription>Choose a topic to practice your 2-minute monologue. Use the Shadowing mode to perfect a model answer, then record your own for full evaluation.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {shadowingExercises.length > 0 ? (
                                    <>
                                        <Select value={selectedPart2ExerciseId} onValueChange={setSelectedPart2ExerciseId}>
                                            <SelectTrigger className="w-full md:w-[400px]">
                                                <SelectValue placeholder="Select an exercise" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shadowingExercises.map((exercise) => (
                                                    <SelectItem key={exercise.id} value={exercise.id}>
                                                        {exercise.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {selectedPart2Exercise && (
                                            <ShadowingExercisePlayer key={selectedPart2Exercise.id} exercise={selectedPart2Exercise} hasMicrophonePermission={hasPermission} />
                                        )}
                                    </>
                                ) : (
                                    <p>No Part 2 exercises available.</p>
                                )}
                            </CardContent>
                        </Card>
                   )}
                </TabsContent>
                <TabsContent value="part3" className="mt-6">
                    {activeTab === 'part3' && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Part 3 Practice</CardTitle>
                                <CardDescription>Practice answering abstract follow-up questions related to your Part 2 topic. Record your answer for detailed AI analysis.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {part3Exercise ? (
                                    <Part3ExercisePlayer exercise={part3Exercise} hasMicrophonePermission={hasPermission} />
                                ) : (
                                    <p>No Part 3 exercises available for this topic yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
