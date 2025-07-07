
'use client';

import { ExamTimer } from './exam-timer';
import { ExamSettings } from './exam-settings';
import { Button } from '@/components/ui/button';
import { HelpCircle, FileText, FileSearch, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onToggleNotes: () => void;
    onToggleHelp: () => void;
    onToggleReview: () => void;
    onSubmit: () => void;
    isSubmitted: boolean;
}

export function ExamHeader({ onTimeUp, onToggleNotes, onToggleHelp, onToggleReview, onSubmit, isSubmitted }: ExamHeaderProps) {
    return (
      <header className="fixed top-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-b-2 border-exam-border bg-exam-background px-6 text-exam-text font-exam">
        {/* Left Side: Logo Placeholder */}
        <div className="w-48">
          {/* In a real app, a logo would go here. */}
        </div>
        
        {/* Center: Timer */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ExamTimer initialMinutes={60} onTimeUp={onTimeUp} />
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center justify-end gap-2 text-sm">
            <Button variant="ghost" size="icon" onClick={onToggleNotes}>
                <FileText className="h-5 w-5"/>
            </Button>
            <ExamSettings />
            <Button variant="ghost" size="icon" onClick={onToggleHelp}>
                <HelpCircle className="h-5 w-5"/>
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6 bg-gray-300" />
            <Button variant="outline" className="gap-2 rounded-md" onClick={onToggleReview} disabled={isSubmitted}>
                <FileSearch className="h-5 w-5"/>
                <span>Review</span>
            </Button>
            <Button className="gap-2 rounded-md bg-exam-green text-white hover:bg-exam-green-hover" onClick={onSubmit} disabled={isSubmitted}>
                <span>Submit</span>
                <Send className="h-4 w-4"/>
            </Button>
        </div>
      </header>
    );
}
