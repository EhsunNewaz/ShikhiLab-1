
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
    'timer text-lg font-bold px-4 py-2 rounded-sm border border-gray-300 bg-white',
    {
      'warning': timeLeft <= 600 && timeLeft > 300, // 10 minutes
      'critical': timeLeft <= 300 && timeLeft > 0, // 5 minutes
    }
  );

  if (!mounted) {
    return <div className="text-lg font-bold">{`Time Left: ${String(initialMinutes).padStart(2, '0')}:00`}</div>;
  }

  return (
    <div className={timerClasses}>
      Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
