
'use client';

import { ExamTimer } from './exam-timer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth-hook';
import { Settings, HelpCircle, EyeOff, Wifi, Bell, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface ExamHeaderProps {
    onTimeUp: () => void;
    onSubmit: () => void;
    onToggleSettings: () => void;
    onToggleHelp: () => void;
    onToggleHide: () => void;
    onToggleNotes: () => void;
    isSubmitted: boolean;
}

export function ExamHeader({ onTimeUp, onSubmit, onToggleHelp, onToggleSettings, onToggleHide, onToggleNotes, isSubmitted }: ExamHeaderProps) {
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
           <ExamTimer initialMinutes={60} onTimeUp={onTimeUp} isPaused={isSubmitted} />
        </div>
        
        {/* Right Side: Controls */}
        <div className="flex items-center justify-end gap-1 text-sm">
            <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={isSubmitted}>
                Finish test
            </Button>
             
            <TooltipProvider>
                <div className="flex items-center gap-1 ml-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon"><Wifi /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Connection Status</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon"><Bell /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Notifications</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={onToggleNotes}><FileText /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Notes</p></TooltipContent>
                    </Tooltip>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={onToggleHelp}><HelpCircle /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Help</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={onToggleSettings}><Settings /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Settings</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={onToggleHide}><EyeOff /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Hide Screen</p></TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </div>
      </header>
    );
}
