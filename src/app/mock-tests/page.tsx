
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTests } from '@/lib/course-data';
import { ArrowRight, ClipboardCheck } from 'lucide-react';

export default function MockTestsPage() {
  return (
    <div className="container mx-auto py-6 sm:py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Full-Length Mock Tests</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Simulate the real test environment to build stamina and manage your time effectively.
        </p>
      </header>
      <main className="max-w-3xl mx-auto space-y-6">
        {mockTests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{test.title}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={test.href}>Start Test <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
