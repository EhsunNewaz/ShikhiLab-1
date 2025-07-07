
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Square, Play, Volume2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const speakingQuestions = [
  {
    id: 'spk1',
    topic: 'Part 2: Describe a website you have bought something from.',
    modelAnswerUrl: '/audio/placeholder-model-answer-1.mp3', // Placeholder
  },
  {
    id: 'spk2',
    topic: 'Part 2: Describe a time you saw something interesting on social media.',
    modelAnswerUrl: '/audio/placeholder-model-answer-2.mp3',
  },
  {
    id: 'spk3',
    topic: 'Part 2: Describe a person in your family who you admire.',
    modelAnswerUrl: '/audio/placeholder-model-answer-3.mp3',
  },
];

export default function SpeakingClient() {
  const [selectedQuestion, setSelectedQuestion] = useState(speakingQuestions[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function getMicrophonePermission() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (err) {
        console.error("Error getting microphone permission:", err);
        setHasPermission(false);
      }
    }
    getMicrophonePermission();
  }, []);

  const startRecording = async () => {
    if (isRecording) return;
    if (hasPermission === false) {
       toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description: 'Please enable microphone permissions in your browser settings to use the speaking practice feature.',
        });
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
            stream.getTracks().forEach(track => track.stop()); // Stop the tracks to turn off the microphone indicator
        };

        mediaRecorder.start();
        setIsRecording(true);
        setAudioURL(''); // Clear previous recording
    } catch (err) {
        console.error("Error starting recording:", err);
        toast({
            variant: 'destructive',
            title: 'Recording Error',
            description: 'Could not start recording. Please check your microphone.',
        });
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleQuestionChange = (questionId: string) => {
    const question = speakingQuestions.find(q => q.id === questionId);
    if (question) {
        setSelectedQuestion(question);
        setAudioURL('');
        if (isRecording) {
            stopRecording();
        }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Speaking Practice</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Select a question, record your response, and then compare it to a model answer.</p>
      </header>

      {hasPermission === false && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Microphone Access Required</AlertTitle>
              <AlertDescription>
                This feature requires access to your microphone. Please enable it in your browser settings and refresh the page.
              </AlertDescription>
          </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Practice Question</CardTitle>
          <CardDescription>Choose a topic to practice your speaking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={handleQuestionChange} defaultValue={selectedQuestion.id}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a practice question" />
            </SelectTrigger>
            <SelectContent>
              {speakingQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-foreground font-semibold">{selectedQuestion.topic}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Record Your Answer</CardTitle>
            <CardDescription>Click the record button and speak for 1-2 minutes. Click stop when you're finished.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-4">
                <Button onClick={startRecording} disabled={isRecording || hasPermission !== true} size="lg" variant="destructive" className="gap-2">
                    <Mic className="h-5 w-5" />
                    Record
                </Button>
                <Button onClick={stopRecording} disabled={!isRecording} size="lg" className="gap-2">
                    <Square className="h-5 w-5" />
                    Stop
                </Button>
            </div>
            {isRecording && <p className="text-sm text-destructive animate-pulse">Recording in progress...</p>}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle>Review & Compare</CardTitle>
            <CardDescription>Listen to your recording and compare it with the model answer.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><Play className="h-5 w-5 text-primary"/> Your Answer</h3>
                {audioURL ? (
                    <audio src={audioURL} controls className="w-full" />
                ) : (
                    <div className="flex items-center justify-center h-14 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Your recording will appear here.</p>
                    </div>
                )}
            </div>
             <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><Volume2 className="h-5 w-5 text-primary"/> Model Answer</h3>
                <audio src={selectedQuestion.modelAnswerUrl} controls className="w-full" />
                <p className="text-xs text-muted-foreground">Note: Model answer audio is for demonstration purposes.</p>
            </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
