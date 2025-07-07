'use client';

import { useAuth } from '@/hooks/use-auth-hook';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Languages, Sparkles, Repeat, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useMounted } from '@/hooks/use-mounted';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mounted = useMounted();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (!mounted || loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-light-indigo font-body">
      {/* Hero Section */}
      <section id="hero" className="flex-1 flex items-center justify-center py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold font-headline tracking-tighter text-primary sm:text-5xl xl:text-6xl/none">
                  শিখুন সহজে, শিখুন বাংলায়
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                  Your AI-Powered IELTS Mentor. Stop worrying, start preparing. ShikhiLab uses a Bangla-first approach with AI feedback to help you achieve your dream score.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                <Button asChild size="lg">
                  <Link href="/auth">
                    Start for Free
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x500.png"
              data-ai-hint="students learning together"
              width="600"
              height="500"
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      {/* Why ShikhiLab? Section */}
      <section id="features" className="py-12 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline text-primary">Why ShikhiLab?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">The smart way to prepare for your IELTS exam.</p>
          </div>
          <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-3 md:gap-12">
            <div className="grid gap-2 text-center">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                  <Languages className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Bangla-First Method</h3>
              <p className="text-sm text-muted-foreground">Understand complex topics in simple Bangla before mastering them in English.</p>
            </div>
            <div className="grid gap-2 text-center">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                  <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold">AI Personal Tutor</h3>
              <p className="text-sm text-muted-foreground">Get instant feedback on your writing and practice speaking with an AI mentor 24/7.</p>
            </div>
             <div className="grid gap-2 text-center">
               <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                  <Repeat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold">'Thinking in English' Training</h3>
              <p className="text-sm text-muted-foreground">Develop fluency with our unique shadowing and active listening exercises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-24 bg-background">
          <div className="container">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold font-headline text-primary">Success Stories</h2>
                  <p className="text-muted-foreground mt-2">See what our students are saying about their journey.</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                      <CardHeader className="flex flex-row items-center gap-4">
                          <Image src="https://placehold.co/48x48.png" alt="User" width={48} height={48} className="rounded-full" data-ai-hint="person smiling"/>
                          <div>
                              <CardTitle className="text-base">Rahim Ahmed</CardTitle>
                              <CardDescription>Band Score: 7.5</CardDescription>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground">"The AI writing feedback was a game-changer. I finally understood my mistakes. The Bangla explanations made everything so clear. Highly recommended!"</p>
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader className="flex flex-row items-center gap-4">
                           <Image src="https://placehold.co/48x48.png" alt="User" width={48} height={48} className="rounded-full" data-ai-hint="person portrait"/>
                          <div>
                              <CardTitle className="text-base">Sadia Chowdhury</CardTitle>
                              <CardDescription>Band Score: 8.0</CardDescription>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground">"I used to be nervous about the speaking test. The 'Record & Compare' feature helped me build so much confidence. Thank you, ShikhiLab!"</p>
                      </CardContent>
                  </Card>
                  <Card>
                       <CardHeader className="flex flex-row items-center gap-4">
                           <Image src="https://placehold.co/48x48.png" alt="User" width={48} height={48} className="rounded-full" data-ai-hint="student looking at camera"/>
                          <div>
                              <CardTitle className="text-base">Kamal Hassan</CardTitle>
                              <CardDescription>Band Score: 7.0</CardDescription>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground">"As a student from a Bengali medium background, this platform was a lifesaver. The foundation skills modules helped me fix my basics."</p>
                      </CardContent>
                  </Card>
              </div>
          </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline text-primary">Choose Your Plan</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Start for free and upgrade when you're ready for more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Get started with the basics</CardDescription>
                <p className="text-4xl font-bold pt-2">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Limited access to lessons</p>
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> 3 AI Writing feedbacks</p>
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Basic progress tracking</p>
              </CardContent>
              <CardFooter>
                 <Button className="w-full" variant="outline">Get Started</Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col border-primary shadow-lg">
               <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Unlock your full potential</CardDescription>
                <p className="text-4xl font-bold pt-2">$10<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Full access to all lessons</p>
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Unlimited AI Writing feedbacks</p>
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> All Foundation Skill modules</p>
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Full Mock Tests</p>
              </CardContent>
              <CardFooter>
                 <Button className="w-full">Choose Premium</Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
               <CardHeader>
                <CardTitle>Premium Plus</CardTitle>
                <CardDescription>For personalized coaching</CardDescription>
                <p className="text-4xl font-bold pt-2">$40<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Everything in Premium</p>
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> 2 Live classes per month</p>
                <p className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Human expert essay review</p>
              </CardContent>
              <CardFooter>
                 <Button className="w-full" variant="outline">Choose Plus</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-background">
          <div className="container text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} ShikhiLab. All rights reserved.
          </div>
      </footer>
    </div>
  );
}
