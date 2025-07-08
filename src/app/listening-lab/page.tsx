import ListeningLabPlayer from '@/components/practice/listening-lab-player';
import { listeningLabExercises } from '@/lib/listening-lab-data';

export default function ListeningLabPage() {
  // Load the first exercise. You could expand this to list all exercises.
  const exercise = listeningLabExercises[0];

  return (
     <div className="container mx-auto py-6 sm:py-10">
      <div className="space-y-8">
        <header className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Listening Lab</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Sharpen your listening skills with interactive gap-fill exercises.
            </p>
        </header>
        
        <div className="max-w-4xl mx-auto">
            <ListeningLabPlayer exercise={exercise} />
        </div>
      </div>
    </div>
  );
}
