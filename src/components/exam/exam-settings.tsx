
'use client';

import { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMounted } from '@/hooks/use-mounted';

type ContrastOption = 'black-on-white' | 'black-on-yellow' | 'white-on-black';
type TextSizeOption = 'standard' | 'large' | 'extra-large';

const contrastOptions: { value: ContrastOption; label: string; class: string }[] = [
  { value: 'black-on-white', label: 'Black on white', class: '' },
  { value: 'black-on-yellow', label: 'Black on yellow', class: 'theme-contrast-yellow' },
  { value: 'white-on-black', label: 'White on black', class: 'theme-contrast-dark' },
];

const textSizeOptions: { value: TextSizeOption; label:string; class: string }[] = [
  { value: 'standard', label: 'Standard', class: '' },
  { value: 'large', label: 'Large', class: 'text-size-large' },
  { value: 'extra-large', label: 'Extra Large', class: 'text-size-xl' },
];

export function ExamSettings() {
  const [contrast, setContrast] = useState<ContrastOption>('black-on-white');
  const [textSize, setTextSize] = useState<TextSizeOption>('standard');
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    
    const body = document.body;
    // Remove all possible theme classes first to avoid conflicts
    contrastOptions.forEach(opt => {
        if (opt.class) body.classList.remove(opt.class);
    });
    textSizeOptions.forEach(opt => {
        if (opt.class) body.classList.remove(opt.class);
    });

    // Add the active classes
    const contrastClass = contrastOptions.find(c => c.value === contrast)?.class;
    if (contrastClass) body.classList.add(contrastClass);
    
    const textSizeClass = textSizeOptions.find(t => t.value === textSize)?.class;
    if (textSizeClass) body.classList.add(textSizeClass);

  }, [contrast, textSize, mounted]);

  // Cleanup effect to remove classes when component unmounts
  useEffect(() => {
    return () => {
      if (mounted) {
        const body = document.body;
        contrastOptions.forEach(opt => {
            if (opt.class) body.classList.remove(opt.class);
        });
        textSizeOptions.forEach(opt => {
            if (opt.class) body.classList.remove(opt.class);
        });
      }
    };
  }, [mounted]);

  const buttonJsx = (
     <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-sm bg-exam-green text-white hover:bg-exam-green/90" disabled={!mounted}>
        <Settings className="h-5 w-5" />
        <span>Settings</span>
    </Button>
  );

  if (!mounted) {
    return buttonJsx;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {buttonJsx}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuLabel>Colour contrast</DropdownMenuLabel>
        {contrastOptions.map(option => (
            <DropdownMenuItem key={option.value} onSelect={() => setContrast(option.value)}>
                <div className="w-5 mr-2">
                    {contrast === option.value && <Check className="h-4 w-4" />}
                </div>
                {option.label}
            </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Text size</DropdownMenuLabel>
        {textSizeOptions.map(option => (
             <DropdownMenuItem key={option.value} onSelect={() => setTextSize(option.value)}>
                <div className="w-5 mr-2">
                    {textSize === option.value && <Check className="h-4 w-4" />}
                </div>
                {option.label}
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
