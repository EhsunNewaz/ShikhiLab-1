
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';

interface TimerProps {
  initialMinutes?: number;
  onTimeUp: () => void;
}

export function ExamTimer({ initialMinutes = 40, onTimeUp }: TimerProps) {
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

  const timerClasses = cn(
    'timer text-lg font-bold flex items-center justify-center',
    {
      'warning': timeLeft <= 600 && timeLeft > 300, // 10 minutes
      'critical': timeLeft <= 300 && timeLeft > 0, // 5 minutes
    }
  );
  
  const initialDisplay = `Time Left: ${String(initialMinutes).padStart(2, '0')}:00`;
  const currentDisplay = `Time Left: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div style={{ width: '120px', height: '40px', border: '1px solid #cccccc' }} className={cn(timerClasses, 'bg-white rounded-[4px]')}>
      {mounted ? currentDisplay : initialDisplay}
    </div>
  );
}
