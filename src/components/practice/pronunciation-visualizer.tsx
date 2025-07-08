
'use client';

import type { PronunciationAnalysis } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import React from 'react';

interface PronunciationVisualizerProps {
    text: string;
    analysis: PronunciationAnalysis;
}

export default function PronunciationVisualizer({ text, analysis }: PronunciationVisualizerProps) {
    const words = text.split(/\s+/);

    const linkedWordIndexes = new Set(analysis.linkingOpportunities.flatMap(link => link.wordIndexes));
    
    const wordIssuesMap = new Map<string, string>();
    analysis.wordIssues.forEach(issue => {
        // Normalize word by making it lowercase and removing punctuation
        const normalizedWord = issue.word.toLowerCase().replace(/[.,!?]/g, '');
        wordIssuesMap.set(normalizedWord, issue.issue);
    });

    const pausesMap = new Map<number, 'short' | 'long'>();
    analysis.pauses.forEach(pause => {
        pausesMap.set(pause.afterWordIndex, pause.strength);
    });

    return (
        <TooltipProvider>
            <div className="text-2xl font-body leading-loose flex flex-wrap items-center gap-x-1">
                {words.map((word, index) => {
                    const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, '');
                    const issue = wordIssuesMap.get(normalizedWord);
                    const hasPause = pausesMap.get(index);
                    const isLinked = linkedWordIndexes.has(index);

                    const wordElement = (
                        <span className={cn(
                            "inline-block transition-colors duration-300",
                            isLinked && "border-b-2 border-blue-500",
                            issue && "bg-yellow-200/70 text-yellow-900 rounded-md px-1"
                        )}>
                            {word}
                        </span>
                    );

                    return (
                        <React.Fragment key={index}>
                            {issue ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>{wordElement}</TooltipTrigger>
                                    <TooltipContent><p>{issue}</p></TooltipContent>
                                </Tooltip>
                            ) : (
                                wordElement
                            )}
                            {hasPause && <span className="text-red-500 font-bold mx-1">/</span>}
                        </React.Fragment>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}
