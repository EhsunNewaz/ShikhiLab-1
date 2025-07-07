
'use client';

import { ExamTimer } from './exam-timer';
import { ExamSettings } from './exam-settings';
import { Button } from '@/components/ui/button';
import { HelpCircle, EyeOff, FileText, Eye } from 'lucide-react';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onToggleNotes: () => void;
    onToggleHide: () => void;
    isContentHidden: boolean;
}

export function ExamHeader({ onTimeUp, onToggleNotes, onToggleHide, isContentHidden }: ExamHeaderProps) {
    return (
      <header className="fixed top-0 left-0 right-0 z-10 flex h-[60px] items-center justify-between border-b-2 border-exam-border bg-exam-background px-6 text-exam-text font-exam">
        {/* Left Side: Instructions Box */}
        <div className="flex items-center gap-4">
          <div className="h-[40px] w-[300px] overflow-hidden rounded-[4px] border border-exam-border-timer bg-white p-2 text-sm text-exam-text shadow-inner">
            IELTS Reading Test: Instructions for this section will appear here.
          </div>
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ExamTimer initialMinutes={40} onTimeUp={onTimeUp} />
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center gap-2 text-sm">
            <Button
              style={{ width: 'auto', height: '40px' }}
              className="gap-2 rounded-[4px] bg-white text-exam-text hover:bg-gray-200"
              onClick={onToggleNotes}
            >
                <FileText className="h-5 w-5"/>
                <span>Notes</span>
            </Button>
            <ExamSettings />
            <Button
              style={{ width: '50px', height: '40px' }}
              className="gap-2 rounded-[4px] bg-exam-blue p-0 text-white hover:bg-exam-blue-hover disabled:bg-[#cccccc]"
            >
                <HelpCircle className="h-5 w-5"/>
            </Button>
            <Button
              style={{ width: '50px', height: '40px' }}
              className="gap-2 rounded-[4px] bg-exam-orange p-0 text-white hover:bg-exam-orange-hover disabled:bg-[#cccccc]"
              onClick={onToggleHide}
            >
              {isContentHidden ? <Eye className="h-5 w-5"/> : <EyeOff className="h-5 w-5"/>}
            </Button>
        </div>
      </header>
    );
}
