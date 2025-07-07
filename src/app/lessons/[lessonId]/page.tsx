'use client';

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { courseData } from '@/lib/course-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, CheckCircle, Video } from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  const lesson = courseData
    .flatMap(module => module.lessons)
    .find(l => l.id === lessonId);

  if (!lesson) {
    notFound();
  }

  // Placeholder video URL if not provided
  const videoUrl = lesson.videoUrl || 'https://www.youtube.com/embed/iA1IbbSQb_4';

  return (
    <div className="container mx-auto py-6 sm:py-10 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">{lesson.titleEnglish}</h1>
        <p className="text-xl text-muted-foreground">{lesson.titleBangla}</p>
      </header>

      <main className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6" />
                <span>Lesson Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
              <iframe
                src={videoUrl}
                title="IELTS Lesson Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transcripts</CardTitle>
            <CardDescription>Read along with the video in your preferred language.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bangla" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bangla">বাংলা</TabsTrigger>
                <TabsTrigger value="english">English</TabsTrigger>
              </TabsList>
              <TabsContent value="bangla">
                <div className="p-4 bg-muted/50 rounded-lg min-h-[200px] whitespace-pre-wrap font-body">
                  {lesson.transcriptBangla || 'এই পাঠের জন্য কোনো প্রতিলিপি উপলব্ধ নেই।'}
                </div>
              </TabsContent>
              <TabsContent value="english">
                <div className="p-4 bg-muted/50 rounded-lg min-h-[200px] whitespace-pre-wrap font-body">
                  {lesson.transcriptEnglish || 'No transcript available for this lesson.'}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-lg bg-secondary/30">
          <div>
            <h3 className="font-semibold text-lg">Ready to test your knowledge?</h3>
            <p className="text-muted-foreground">Take the quiz to check your understanding.</p>
          </div>
          {lesson.quizId ? (
            <Button asChild size="lg">
              <Link href={`/quiz/${lesson.quizId}`}>
                Start Quiz <ArrowRight className="ml-2" />
              </Link>
            </Button>
          ) : (
             <Button size="lg" disabled>
                Quiz Not Available
             </Button>
          )}
        </div>
        
        <div className="text-center">
            <Button variant="outline">
                <CheckCircle className="mr-2" />
                Mark as Complete
            </Button>
        </div>

      </main>
    </div>
  );
}
