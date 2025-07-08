
'use client';

import { ExamTimer } from './exam-timer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth-hook';
import { Settings, HelpCircle, EyeOff } from 'lucide-react';

interface ExamHeaderProps {
    onTimeUp: () => void;
    onToggleSettings: () => void;
    onToggleHelp: () => void;
    onToggleHide: () => void;
}

export function ExamHeader({ onTimeUp, onToggleHelp, onToggleSettings, onToggleHide }: ExamHeaderProps) {
    const { user, loading } = useAuth();
    const candidateNumber = user?.uid.substring(0, 8).toUpperCase() || 'N/A';

    return (
      <header className="fixed top-0 left-0 right-0 z-30 flex h-[60px] items-center justify-between border-b bg-gray-100 px-6 font-exam text-gray-800 shadow-sm">
        {/* Left Side: User and Timer */}
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600">
                   {user?.name?.charAt(0).toUpperCase() || 'T'}
               </div>
               <div>
                   <h1 className="font-bold text-sm">{loading ? 'Loading...' : (user?.name || 'Test Taker')}</h1>
                   <p className="text-xs text-gray-500">Candidate No: {candidateNumber}</p>
               </div>
           </div>
           <div className="h-8 w-px bg-gray-300"></div>
           <ExamTimer initialMinutes={60} onTimeUp={onTimeUp} />
        </div>
        
        {/* Right Side: Controls */}
        <div className="flex items-center justify-end gap-1 text-sm">
             <Button variant="ghost" className="h-9 w-auto px-3 gap-2 text-gray-600 hover:bg-gray-200/50 hover:text-gray-900" onClick={onToggleSettings}>
                <Settings className="h-5 w-5"/>
                <span>Settings</span>
            </Button>
            <Button variant="ghost" className="h-9 w-auto px-3 gap-2 text-gray-600 hover:bg-gray-200/50 hover:text-gray-900" onClick={onToggleHelp}>
                <HelpCircle className="h-5 w-5"/>
                <span>Help</span>
            </Button>
             <Button variant="ghost" className="h-9 w-auto px-3 gap-2 text-gray-600 hover:bg-gray-200/50 hover:text-gray-900" onClick={onToggleHide}>
                <EyeOff className="h-5 w-5"/>
                <span>Hide</span>
            </Button>
        </div>
      </header>
    );
}
