
'use client';

import { ExamTimer } from './exam-timer';
import { ExamSettings } from './exam-settings';
import { Button } from '@/components/ui/button';
import { HelpCircle, Send, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onSubmit: () => void;
    isSubmitted: boolean;
    onPrev: () => void;
    onNext: () => void;
    onToggleReview: () => void;
}

export function ExamHeader({ onTimeUp, onSubmit, isSubmitted, onPrev, onNext, onToggleReview }: ExamHeaderProps) {
    return (
      <header className="fixed top-0 left-0 right-0 z-30 flex h-[60px] items-center justify-between border-b-2 border-exam-border bg-white px-6 text-exam-text font-exam shadow-sm">
        {/* Left Side: Navigation & Review */}
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous Question">
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={onNext} aria-label="Next Question">
                <ChevronRight className="h-5 w-5" />
            </Button>
             <Button variant="outline" onClick={onToggleReview} disabled={isSubmitted} className="gap-2 ml-4">
                <Flag className="h-4 w-4"/>
                Review
            </Button>
        </div>
        
        {/* Center: Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ExamTimer initialMinutes={60} onTimeUp={onTimeUp} />
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center justify-end gap-1 text-sm">
            <ExamSettings />
            <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5"/>
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6 bg-gray-300" />
            <Button className="gap-2 rounded-md bg-green-600 text-white hover:bg-green-700" onClick={onSubmit} disabled={isSubmitted}>
                <span>Submit</span>
                <Send className="h-4 w-4"/>
            </Button>
        </div>
      </header>
    );
}
