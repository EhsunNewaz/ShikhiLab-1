
'use client';

import { ExamTimer } from './exam-timer';
import { Button } from '@/components/ui/button';
import { Wifi, Bell, AlignJustify, FileEdit } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth-hook';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onSubmit: () => void;
    isSubmitted: boolean;
    onToggleNotes: () => void;
}

export function ExamHeader({ onTimeUp, onSubmit, isSubmitted, onToggleNotes }: ExamHeaderProps) {
    const { user, loading } = useAuth();

    return (
      <header className="fixed top-0 left-0 right-0 z-30 flex h-[60px] items-center justify-between border-b bg-rose-100 px-6 font-exam text-rose-900 shadow-sm">
        {/* Left Side: User and Timer */}
        <div className="flex flex-col">
           <h1 className="font-bold">{loading ? 'Loading...' : (user?.name || 'Test Taker')}</h1>
           <ExamTimer initialMinutes={60} onTimeUp={onTimeUp} />
        </div>
        
        {/* Right Side: Controls */}
        <div className="flex items-center justify-end gap-2 text-sm">
            <Button className="h-8 rounded-md border-rose-900/50 text-rose-900 hover:bg-rose-200" variant="outline" onClick={onSubmit} disabled={isSubmitted}>
                Finish test
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-200/50">
                <Wifi className="h-5 w-5"/>
            </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-200/50">
                <Bell className="h-5 w-5"/>
            </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-200/50">
                <AlignJustify className="h-5 w-5"/>
            </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-200/50" onClick={onToggleNotes}>
                <FileEdit className="h-5 w-5"/>
            </Button>
        </div>
      </header>
    );
}
