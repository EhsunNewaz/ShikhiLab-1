
import Link from 'next/link';
import { readingTestData } from '@/lib/course-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function ReadingHubPage() {
  return (
    <div className="container mx-auto py-6 sm:py-10">
      <header className="mb-8 text-center">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-3">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Reading Practice</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Work through these passages and question sets to improve your speed, accuracy, and comprehension.
        </p>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {readingTestData.map(test => (
          <Card key={test.id}>
            <CardHeader>
              <CardTitle>{test.title}</CardTitle>
              <CardDescription>A complete reading passage with questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/reading/practice/${test.id}`}>
                  Start Practice <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
