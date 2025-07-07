'use client';

import { useAuth } from '@/hooks/use-auth-hook';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  const userFirstName = user.name?.split(' ')[0] || 'friend';

  return (
    <div className="container mx-auto py-6 sm:py-10">
      <div className="space-y-8 max-w-4xl mx-auto">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">
            Welcome back, {userFirstName}!
          </h1>
          <p className="text-muted-foreground">Here is your study dashboard. Let's get started!</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>Your journey to IELTS mastery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress value={user.progress?.diagnosticTestScore ? (user.progress.diagnosticTestScore / 10) * 100 : 5} className="w-full" />
              <span className="font-semibold text-primary">{user.progress?.diagnosticTestScore ? (user.progress.diagnosticTestScore / 10) * 100 : 5}%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {user.progress?.diagnosticTestScore ? `You scored ${user.progress.diagnosticTestScore}/10 on the diagnostic test.` : `Let's complete the onboarding to get your baseline.`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Goal</CardTitle>
            <CardDescription>A few tasks to get you closer to your goal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <CheckCircle className="text-green-500" />
                <div>
                  <p className="font-semibold">Complete your profile</p>
                  <p className="text-sm text-muted-foreground">Finish the onboarding steps.</p>
                </div>
             </div>
             <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <CheckCircle className="text-muted-foreground/50" />
                <div>
                  <p className="font-semibold">Lesson: Introduction to Writing Task 2</p>
                  <p className="text-sm text-muted-foreground">Learn the fundamentals of essay structure.</p>
                </div>
             </div>
          </CardContent>
        </Card>
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-2/5" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-2/5" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
