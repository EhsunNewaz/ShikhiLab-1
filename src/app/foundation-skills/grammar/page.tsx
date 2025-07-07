
import Link from 'next/link';
import { foundationSkills } from '@/lib/course-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function GrammarFoundationPage() {
  const { title, description, lessons, icon: Icon } = foundationSkills.grammar;

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

      <main>
        <Card>
            <CardHeader>
                <CardTitle>Grammar Micro-Lessons</CardTitle>
                <CardDescription>Click on a lesson to start learning.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              {lessons.map(lesson => (
                <Link href={lesson.href} key={lesson.id} passHref>
                  <div className="flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer border-b last:border-b-0">
                    <div>
                      <p className="font-semibold text-lg">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </Link>
              ))}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
