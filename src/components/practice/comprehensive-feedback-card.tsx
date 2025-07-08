'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ComprehensiveSpeakingFeedback } from '@/lib/types';

interface ComprehensiveFeedbackCardProps {
    feedback: ComprehensiveSpeakingFeedback;
}

const ScoreCard = ({ title, score }: { title: string, score: number }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-2xl font-bold text-primary">{score}/9</p>
        <p className="text-sm text-muted-foreground">{title}</p>
    </div>
);

export function ComprehensiveFeedbackCard({ feedback }: ComprehensiveFeedbackCardProps) {
    return (
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <div className="flex flex-col items-center text-center">
                    <CardDescription>Overall Band Score</CardDescription>
                    <CardTitle className="text-5xl text-primary">{feedback.overallBandScore.toFixed(1)}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreCard title="Fluency" score={feedback.fluencyScore} />
                    <ScoreCard title="Pronunciation" score={feedback.pronunciationScore} />
                    <ScoreCard title="Vocabulary" score={feedback.lexicalResourceScore} />
                    <ScoreCard title="Grammar" score={feedback.grammaticalRangeAndAccuracyScore} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Detailed Feedback</h3>
                    <Accordion type="single" collapsible className="w-full" defaultValue="fluency">
                        <AccordionItem value="fluency">
                            <AccordionTrigger>Fluency & Coherence</AccordionTrigger>
                            <AccordionContent className="text-card-foreground/90">{feedback.fluencyFeedback}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="pronunciation">
                            <AccordionTrigger>Pronunciation</AccordionTrigger>
                            <AccordionContent className="text-card-foreground/90">{feedback.pronunciationFeedback}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="lexical">
                            <AccordionTrigger>Lexical Resource (Vocabulary)</AccordionTrigger>
                            <AccordionContent className="text-card-foreground/90">{feedback.lexicalResourceFeedback}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="grammar">
                            <AccordionTrigger>Grammatical Range & Accuracy</AccordionTrigger>
                            <AccordionContent className="text-card-foreground/90">{feedback.grammaticalRangeAndAccuracyFeedback}</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </CardContent>
        </Card>
    );
}
