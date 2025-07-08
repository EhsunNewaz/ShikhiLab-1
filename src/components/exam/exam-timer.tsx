
'use client';

import { useState, useEffect } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimerProps {
  initialMinutes?: number;
  onTimeUp: () => void;
}

export function ExamTimer({ initialMinutes = 60, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp, mounted]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const tooltipDisplay = `${minutes} minutes and ${seconds} seconds remaining`;
  
  const initialDisplay = `${String(initialMinutes).padStart(2, '0')}:00`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <Clock className="h-5 w-5" />
            <span className="text-lg tabular-nums">{mounted ? display : initialDisplay}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipDisplay}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
