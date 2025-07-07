
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones } from 'lucide-react';

export default function ListeningPage() {
  // A real playlist ID for IELTS listening practice
  const playlistId = "PLwG9_i1P5oAgyyQPkZ-1o5p9d46O9y3o9";

  return (
    <div className="container mx-auto py-6 sm:py-10 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Listening Practice</h1>
        <p className="text-xl text-muted-foreground mt-2">Sharpen your ears with these practice tests.</p>
      </header>

      <main className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Headphones className="h-6 w-6" />
                <span>IELTS Listening Practice Playlist</span>
            </CardTitle>
            <CardDescription>
                Work through these official practice materials to improve your score. Use headphones for the best experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
              <iframe
                src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
                title="IELTS Listening Practice Playlist"
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
                <CardTitle>How to Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
                <p>1. Find a quiet place where you will not be disturbed.</p>
                <p>2. Download the question paper if one is provided in the video description.</p>
                <p>3. Play the audio ONCE only. Do not pause or rewind the audio.</p>
                <p>4. Answer the questions as you listen.</p>
                <p>5. After the audio finishes, check your answers with the key provided.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
