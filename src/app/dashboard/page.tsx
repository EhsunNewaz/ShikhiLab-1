
'use client';

import { useAuth } from '@/hooks/use-auth-hook';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, ClipboardCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMounted } from '@/hooks/use-mounted';
import { courseData, getNextLesson, type Module } from '@/lib/course-data';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { MockTestResult } from '@/lib/types';


const getModuleLink = (module: Module): string => {
  switch (module.id) {
    case 'writing':
      return '/writing';
    case 'speaking':
      return '/speaking';
    case 'listening':
      return '/listening';
    case 'reading':
      return '/reading';
    // For other modules, default to the first lesson's link.
    default:
      return module.lessons[0]?.href || '#';
  }
};

function MockTestHistory({ history }: { history: MockTestResult[] }) {
    if (!history || history.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Mock Test History</CardTitle>
                    <CardDescription>Your past mock test scores will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <ClipboardCheck className="h-12 w-12 mb-4" />
                        <p className="font-semibold">No tests taken yet</p>
                        <p className="text-sm">Complete a full mock test to see your results.</p>
                         <Button asChild variant="secondary" className="mt-4">
                            <Link href="/mock-tests">Go to Mock Tests</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const sortedHistory = [...history].sort((a, b) => {
        const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(0);
        const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mock Test History</CardTitle>
                <CardDescription>Review your performance on past mock tests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {sortedHistory.slice(0, 3).map((result, index) => (
                     <div key={index} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                        <div>
                            <p className="font-semibold">Mock Test: {result.testId}</p>
                            <p className="text-sm text-muted-foreground">
                                {result.completedAt?.toDate ? format(result.completedAt.toDate(), "PPP") : 'Date unknown'}
                            </p>
                        </div>
                        <Badge className="text-lg">Score: {result.score}/{result.total}</Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) {
    return <DashboardSkeleton />;
  }
  
  const userFirstName = user.name?.split(' ')[0] || 'friend';
  const nextLesson = getNextLesson();

  return (
    <div className="container mx-auto py-6 sm:py-10">
      <div className="space-y-8 max-w-4xl mx-auto">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">
            Welcome back, {userFirstName}!
          </h1>
          <p className="text-muted-foreground">Here is your study dashboard. Let's get started!</p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your journey to IELTS mastery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Progress value={user.progress?.diagnosticTestScore ? (user.progress.diagnosticTestScore / 10) * 100 : 5} className="w-full" />
                  <span className="font-semibold text-primary">{user.progress?.diagnosticTestScore ? `${(user.progress.diagnosticTestScore / 10) * 100}%` : '5%'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Target Band: <span className="font-semibold text-foreground">{user.ieltsGoalBand || '7.0'}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Goal</CardTitle>
                <CardDescription>The next step on your study plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                 {nextLesson ? (
                    <Link href={nextLesson.href} className="block group">
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                           <CheckCircle className="text-muted-foreground/50" />
                           <div>
                             <p className="font-semibold">{nextLesson.title}</p>
                             <p className="text-sm text-muted-foreground">{nextLesson.description}</p>
                           </div>
                        </div>
                        <ArrowRight className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                 ) : (
                    <div className="flex items-center gap-3 p-3 bg-green-100/50 rounded-lg">
                      <CheckCircle className="text-green-500" />
                      <div>
                        <p className="font-semibold">Congratulations!</p>
                        <p className="text-sm text-muted-foreground">You have completed all lessons.</p>
                      </div>
                    </div>
                 )}
              </CardContent>
            </Card>
        </div>

        <MockTestHistory history={user.mockTestHistory || []} />

        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Modules</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {courseData.map(module => {
                    const { icon: Icon } = module;
                    return (
                        <Link href={getModuleLink(module)} key={module.id}>
                            <Card className="hover:border-primary transition-colors h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">{module.title}</CardTitle>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    )
                })}
            </div>
            <div className="text-center mt-6">
                <Button asChild variant="outline">
                    <Link href="/study-plan">View Full Study Plan <ArrowRight className="ml-2" /></Link>
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-6 sm:py-10">
      <div className="space-y-8 max-w-4xl mx-auto">
        <header className="space-y-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </header>
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
        </div>
        <div>
            <Skeleton className="h-28 w-full" />
        </div>
         <div>
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
      </div>
    </div>
  );
}
