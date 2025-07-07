
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { foundationSkills } from '@/lib/course-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FluencyPage() {
    const { title, description, shadowingExercises, icon: Icon } = foundationSkills.fluency;

  return (
    <div className="container mx-auto py-6 sm:py-10 max-w-3xl">
      <header className="mb-8 flex items-start gap-4">
         <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">{title}</h1>
            <p className="text-muted-foreground mt-2">{description}</p>
        </div>
      </header>

      <main className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>How to Practice Shadowing</CardTitle>
                <CardDescription>Follow these simple steps for the best results.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Play the audio and listen to it once to understand the context.</p>
                <p>2. Play the audio again and speak along with the recording, trying to match the speaker's speed, rhythm, and intonation exactly.</p>
                <p>3. Don't worry about understanding every word. Focus on the sounds and flow.</p>
                <p>4. Repeat the exercise multiple times. The goal is to make your speech sound like a 'shadow' of the original.</p>
            </CardContent>
        </Card>

        {shadowingExercises.map((exercise, index) => (
            <Card key={index}>
                <CardHeader>
                    <CardTitle>{exercise.title}</CardTitle>
                </CardHeader>
                <CardContent>
                     <audio controls src={exercise.audioUrl} className="w-full"></audio>
                     <Accordion type="single" collapsible className="w-full mt-4">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>View Transcript</AccordionTrigger>
                            <AccordionContent>
                                <p className="whitespace-pre-wrap font-body text-base leading-relaxed text-muted-foreground">
                                    {exercise.transcript}
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        ))}
        <p className="text-xs text-muted-foreground text-center pt-2">Note: Audio files are placeholders for demonstration purposes.</p>
      </main>
    </div>
  );
}
