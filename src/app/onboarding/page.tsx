'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-hook';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';

const onboardingSteps = [
  { id: 1, title: 'Personal Information' },
  { id: 2, title: 'Your Goal' },
  { id: 3, title: 'Diagnostic Test' },
  { id: 4, title: 'All Set!' },
];

const diagnosticQuestions = [
  // Grammar
  { type: 'grammar', question: 'He ___ to the market every day.', options: ['go', 'goes', 'is going'], answer: 'goes' },
  { type: 'grammar', question: 'The books are ___ the table.', options: ['on', 'in', 'at'], answer: 'on' },
  { type: 'grammar', question: 'She is much ___ than her brother.', options: ['tall', 'taller', 'tallest'], answer: 'taller' },
  { type: 'grammar', question: "I haven't seen him ___ last year.", options: ['since', 'for', 'from'], answer: 'since' },
  { type: 'grammar', question: 'If I ___ you, I would study harder.', options: ['am', 'was', 'were'], answer: 'were' },
  // Vocabulary
  { type: 'vocab', question: "Which word is a synonym for 'essential'?", options: ['Optional', 'Crucial', 'Trivial'], answer: 'Crucial' },
  { type: 'vocab', question: "An 'itinerary' is a plan for a ___.", options: ['Meal', 'Meeting', 'Journey'], answer: 'Journey' },
  { type: 'vocab', question: "To 'commence' means to ___.", options: ['Stop', 'Begin', 'Continue'], answer: 'Begin' },
  { type: 'vocab', question: "Something that is 'ambiguous' is ___.", options: ['Unclear', 'Loud', 'Bright'], answer: 'Unclear' },
  { type: 'vocab', question: "If you 'collaborate', you ___ with others.", options: ['Compete', 'Work', 'Argue'], answer: 'Work' },
];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', city: '', ieltsGoalBand: '7.0' });
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (user.name && user.city && user.ieltsGoalBand && user.progress?.diagnosticTestScore !== undefined) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);
  
  if (!mounted || loading || !user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const handleUpdateUser = async (data: any) => {
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, data);
      setStep(prev => prev + 1);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizSubmit = () => {
    const score = diagnosticQuestions.reduce((acc, q, index) => {
      return q.answer === quizAnswers[index] ? acc + 1 : acc;
    }, 0);
    handleUpdateUser({ 'progress.diagnosticTestScore': score });
  };
  
  const progressValue = ((step - 1) / (onboardingSteps.length -1)) * 100;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to ShikhiLab!</CardTitle>
          <CardDescription>Let's set up your profile to personalize your learning journey.</CardDescription>
           <Progress value={progressValue} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 1: Personal Details</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Fatima Ahmed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g., Dhaka" />
              </div>
              <Button onClick={() => handleUpdateUser({ name: formData.name, city: formData.city })} disabled={!formData.name || !formData.city || isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Your Target</h3>
              <div className="space-y-2">
                <Label>What is your target IELTS band score?</Label>
                <Select value={formData.ieltsGoalBand} onValueChange={value => setFormData({...formData, ieltsGoalBand: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(band => (
                      <SelectItem key={band} value={band}>{band}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleUpdateUser({ ieltsGoalBand: parseFloat(formData.ieltsGoalBand) })} disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="animate-spin" />}
                Next Step
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Step 3: Diagnostic Test</h3>
              {diagnosticQuestions.map((q, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <p>{index + 1}. {q.question}</p>
                  <RadioGroup onValueChange={value => setQuizAnswers({...quizAnswers, [index]: value})}>
                    {q.options.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`q${index}-${option}`} />
                        <Label htmlFor={`q${index}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < diagnosticQuestions.length || isSubmitting}>
                 {isSubmitting && <Loader2 className="animate-spin" />}
                Submit & See Results
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-8">
              <h3 className="text-2xl font-bold text-primary">You're all set!</h3>
              <p className="text-muted-foreground">We have personalized your study plan. Ready to begin?</p>
              <Button onClick={() => router.push('/dashboard')} size="lg">Go to Dashboard</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
