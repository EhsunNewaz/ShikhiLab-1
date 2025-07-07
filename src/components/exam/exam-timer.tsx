
'use client';

import { useState, useEffect } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { Clock } from 'lucide-react';

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

  const display =
    minutes > 1
      ? `${minutes} minutes remaining`
      : minutes === 1
      ? '1 minute remaining'
      : 'Less than a minute remaining';
      
  const initialDisplay = `${initialMinutes} minutes remaining`;

  return (
    <div className="flex items-center gap-2 text-exam-text font-semibold">
      <Clock className="h-5 w-5" />
      <span>{mounted ? display : initialDisplay}</span>
    </div>
  );
}
