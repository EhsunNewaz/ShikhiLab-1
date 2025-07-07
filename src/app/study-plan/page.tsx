import Link from 'next/link';
import { courseData, type Module, type Lesson } from '@/lib/course-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function LessonItem({ lesson }: { lesson: Lesson }) {
  return (
    <Link href={lesson.href} passHref>
      <div className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer border-b last:border-b-0">
        <div className="flex items-center gap-4">
          {lesson.isCompleted ? <CheckCircle className="text-green-500" /> : <Circle className="text-muted-foreground/50" />}
          <div>
            <p className="font-semibold">{lesson.title}</p>
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">Start</Button>
      </div>
    </Link>
  );
}

function ModuleSection({ module }: { module: Module }) {
  const { icon: Icon } = module;
  return (
    <Card>
      <AccordionItem value={module.id} className="border-b-0">
        <AccordionTrigger className="p-6 hover:no-underline">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-left">{module.title}</CardTitle>
              <CardDescription className="text-left">{module.description}</CardDescription>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
            <div className="flex flex-col border-t">
              {module.lessons.map(lesson => (
                <LessonItem key={lesson.id} lesson={lesson} />
              ))}
            </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}

export default function StudyPlanPage() {
  return (
    <div className="container mx-auto py-6 sm:py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Your Study Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">This is your roadmap to success. Complete these modules to achieve your dream IELTS score.</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="writing">
          {courseData.map(module => (
            <ModuleSection key={module.id} module={module} />
          ))}
        </Accordion>
      </main>
    </div>
  );
}
