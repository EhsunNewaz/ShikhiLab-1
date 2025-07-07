
'use client';

import { ExamTimer } from './exam-timer';
import { ExamSettings } from './exam-settings';
import { Button } from '@/components/ui/button';
import { HelpCircle, EyeOff, FileText } from 'lucide-react';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onToggleNotes: () => void;
}

export function ExamHeader({ onTimeUp, onToggleNotes }: ExamHeaderProps) {
    return (
      <header className="fixed top-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-b border-gray-300 bg-[#f5f5f5] px-6 text-gray-800">
        {/* Left Side: Instructions Box Placeholder */}
        <div className="flex items-center gap-4">
          <div className="rounded border border-gray-400 p-2 text-sm font-semibold">
            IELTS Reading
          </div>
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ExamTimer initialMinutes={40} onTimeUp={onTimeUp} />
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center gap-1 text-sm">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-800 hover:bg-gray-200" onClick={onToggleNotes}>
                <FileText className="h-5 w-5"/>
                <span>Notes</span>
            </Button>
            <ExamSettings />
            <Button variant="ghost" size="sm" className="gap-2 text-gray-800 hover:bg-gray-200">
                <HelpCircle className="h-5 w-5"/>
                <span>Help</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-800 hover:bg-gray-200">
                <EyeOff className="h-5 w-5"/>
                <span>Hide</span>
            </Button>
        </div>
      </header>
    );
}
