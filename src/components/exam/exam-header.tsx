
'use client';

import { ExamTimer } from './exam-timer';
import { ExamSettings } from './exam-settings';
import { Button } from '@/components/ui/button';
import { HelpCircle, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onSubmit: () => void;
    isSubmitted: boolean;
}

export function ExamHeader({ onTimeUp, onSubmit, isSubmitted }: ExamHeaderProps) {
    return (
      <header className="fixed top-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-b-2 border-exam-border bg-exam-background px-6 text-exam-text font-exam">
        {/* Left Side: Logo Placeholder & Test Name */}
        <div className="w-1/3">
           <h1 className="font-bold text-lg">IELTS Academic Reading Test</h1>
        </div>
        
        {/* Center: Timer */}
        <div className="w-1/3 flex justify-center">
          <ExamTimer initialMinutes={60} onTimeUp={onTimeUp} />
        </div>

        {/* Right Side: Controls */}
        <div className="w-1/3 flex items-center justify-end gap-2 text-sm">
            <ExamSettings />
            <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5"/>
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6 bg-gray-300" />
            <Button className="gap-2 rounded-md bg-exam-green text-white hover:bg-exam-green-hover" onClick={onSubmit} disabled={isSubmitted}>
                <span>Submit</span>
                <Send className="h-4 w-4"/>
            </Button>
        </div>
      </header>
    );
}
