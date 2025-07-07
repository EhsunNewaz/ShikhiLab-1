
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { foundationSkills } from '@/lib/course-data';
import { Volume2 } from 'lucide-react';
import { ActiveListeningTrainer } from './active-listening-trainer';
import { useMounted } from '@/hooks/use-mounted';

export default function ListeningLabPage() {
  const { title, description, phonicsDrills, icon: Icon, activeListeningExercises } = foundationSkills.listeningLab;
  const mounted = useMounted();

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

      <main className="space-y-8">
        
        {mounted && <ActiveListeningTrainer exercises={activeListeningExercises} />}

        <Card>
          <CardHeader>
            <CardTitle>Phonics Drills: Minimal Pairs</CardTitle>
            <CardDescription>
              Listen carefully to the two similar-sounding words. Can you hear the difference? Repeat them out loud.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {phonicsDrills.map((drill) => (
              <div key={drill.pair} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 bg-secondary/30">
                <h3 className="font-semibold text-xl">{drill.pair}</h3>
                <div className="flex items-center gap-4">
                  <audio controls src={drill.audio1Url} className="max-w-[150px] sm:max-w-full"></audio>
                  <audio controls src={drill.audio2Url} className="max-w-[150px] sm:max-w-full"></audio>
                </div>
              </div>
            ))}
             <p className="text-xs text-muted-foreground text-center pt-2">Note: Audio files are placeholders for demonstration purposes.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
