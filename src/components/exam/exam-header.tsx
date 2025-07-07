
'use client';

import { ExamTimer } from './exam-timer';
import { ExamSettings } from './exam-settings';
import { Button } from '@/components/ui/button';
import { HelpCircle, EyeOff, FileText, Settings } from 'lucide-react';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onToggleNotes: () => void;
}

export function ExamHeader({ onTimeUp, onToggleNotes }: ExamHeaderProps) {
    return (
      <header className="fixed top-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-b-2 border-exam-border bg-exam-background px-6 text-exam-text">
        {/* Left Side: Instructions Box Placeholder */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-[300px] overflow-hidden rounded bg-white p-2 text-sm text-exam-text shadow-inner">
            IELTS Reading Test: Instructions for this section will appear here.
          </div>
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ExamTimer initialMinutes={40} onTimeUp={onTimeUp} />
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-sm bg-white text-exam-text hover:bg-gray-200" onClick={onToggleNotes}>
                <FileText className="h-5 w-5"/>
                <span>Notes</span>
            </Button>
            <ExamSettings />
            <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-sm bg-exam-blue text-white hover:bg-exam-blue/90">
                <HelpCircle className="h-5 w-5"/>
                <span>Help</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-sm bg-exam-orange text-white hover:bg-exam-orange/90">
                <EyeOff className="h-5 w-5"/>
                <span>Hide</span>
            </Button>
        </div>
      </header>
    );
}
