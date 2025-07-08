
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { ExamHeader } from './exam-header';
import { cn } from '@/lib/utils';
import { InactivityWarningDialog } from './inactivity-warning-dialog';
import { HelpDialog } from './help-dialog';
import { ExamSettings } from './exam-settings';
import { Button } from '../ui/button';

interface ExamShellProps {
  children: ReactNode;
  onTimeUp: () => void;
  isSubmitted: boolean;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function ExamShell({
  children,
  onTimeUp,
  isSubmitted,
}: ExamShellProps) {
  const [isScreenHidden, setIsScreenHidden] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);


  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    // Don't set new timer if test is submitted
    if (isSubmitted) return;

    inactivityTimer.current = setTimeout(() => {
      setShowInactivityModal(true);
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // --- Disable Browser Functions ---
    const handleContextMenu = (e: MouseEvent) => {
        // Allow context menu only inside the interactive passage
        if (!(e.target as HTMLElement).closest('[data-interactive-passage="true"]')) {
            e.preventDefault();
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // --- Inactivity Timer ---
    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();


    // --- Cleanup ---
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  // Clear timer when submitted
  useEffect(() => {
    if (isSubmitted && inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, [isSubmitted]);

  const handleContinue = () => {
    setShowInactivityModal(false);
    resetInactivityTimer();
  }

  return (
    <div
      className={cn('h-screen w-screen bg-exam-background font-exam text-exam-text', {
        'pointer-events-none opacity-75': isSubmitted,
      })}
    >
      <ExamHeader
        onTimeUp={onTimeUp}
        onToggleHelp={() => setIsHelpOpen(true)}
        onToggleSettings={() => setIsSettingsOpen(true)}
        onToggleHide={() => setIsScreenHidden(true)}
      />

      {/* Main Content Area - with padding for header and footer */}
      <main className="h-full bg-white pt-[60px] pb-[120px]">
        {children}
      </main>

      {isScreenHidden && (
          <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-4">
              <h2 className="text-2xl font-bold">Test Paused</h2>
              <p>Click the button below to resume the test.</p>
              <Button onClick={() => setIsScreenHidden(false)}>Resume Test</Button>
          </div>
      )}


      {/* Popups and Overlays */}
      <InactivityWarningDialog isOpen={showInactivityModal} onContinue={handleContinue} />
      <HelpDialog isOpen={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <ExamSettings isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
