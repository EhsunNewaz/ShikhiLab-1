
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Microscope } from 'lucide-react';
import PronunciationVisualizer from '@/components/practice/pronunciation-visualizer';
import type { PronunciationAnalysis } from '@/lib/types';

const PRACTICE_SENTENCE = "It's an interesting idea and I'd like to think about it for a bit.";

// This is a mock analysis object to demonstrate the visualizer's capabilities.
const MOCK_ANALYSIS: PronunciationAnalysis = {
  wordIssues: [
    { word: 'think', issue: 'Common error: The /θ/ sound (as in \'think\') is often pronounced like /t/ (as in \'tink\').' },
    { word: 'bit', issue: 'Common error: The short /ɪ/ vowel sound (as in \'bit\') is often confused with the long /iː/ sound (as in \'beat\').' }
  ],
  linkingOpportunities: [
    { wordIndexes: [0, 1] }, // It's_an
    { wordIndexes: [9, 10] } // about_it
  ],
  pauses: [
    { afterWordIndex: 3, strength: 'short' } // after "idea"
  ],
  overallFeedback: "খুব ভালো চেষ্টা! এখানে কিছু সাধারণ বিষয় দেখানো হলো যা আপনার উচ্চারণকে আরও উন্নত করতে পারে। শব্দ জোড়া লাগানো (linking) এবং সঠিক স্বরবর্ণের (vowel) ব্যবহারের উপর মনোযোগ দিন।"
};


export default function PronunciationLabPage() {

    return (
        <div className="container mx-auto py-6 sm:py-10 max-w-3xl">
            <header className="mb-8 flex items-start gap-4">
                 <div className="p-3 bg-primary/10 rounded-lg">
                    <Microscope className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Pronunciation Lab</h1>
                    <p className="text-muted-foreground mt-2">Get detailed feedback on your rhythm, linking, and pronunciation.</p>
                </div>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Practice Sentence</CardTitle>
                    <CardDescription>This is a demonstration of the detailed feedback you can receive. It shows common areas for improvement like word issues, linking, and pauses.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg border text-xl font-semibold">
                        <p>{PRACTICE_SENTENCE}</p>
                    </div>

                    <div className="space-y-4 animate-in fade-in-50">
                         <Card>
                            <CardHeader><CardTitle>Visual Feedback</CardTitle></CardHeader>
                            <CardContent>
                                <PronunciationVisualizer text={PRACTICE_SENTENCE} analysis={MOCK_ANALYSIS} />
                            </CardContent>
                         </Card>
                          <Card className="bg-blue-50 border-blue-200">
                            <CardHeader><CardTitle className="text-blue-800">Overall Feedback (বাংলা)</CardTitle></CardHeader>
                            <CardContent className="text-blue-900">
                                <p>{MOCK_ANALYSIS.overallFeedback}</p>
                            </CardContent>
                         </Card>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
