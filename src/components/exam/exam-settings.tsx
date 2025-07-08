
'use client';

import { useState, useEffect } from 'react';
import { Settings, Check, Volume2, ALargeSmall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMounted } from '@/hooks/use-mounted';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

type ContrastOption = 'black-on-white' | 'yellow-on-black' | 'white-on-black';
type TextSizeOption = 'standard' | 'large' | 'extra-large';

const contrastOptions: { value: ContrastOption; label: string; class: string }[] = [
  { value: 'black-on-white', label: 'Black on white', class: '' },
  { value: 'yellow-on-black', label: 'Yellow on black', class: 'theme-contrast-yellow' },
  { value: 'white-on-black', label: 'White on black', class: 'theme-contrast-dark' },
];

const textSizeOptions: { value: TextSizeOption; label:string; class: string }[] = [
  { value: 'standard', label: 'Standard', class: '' },
  { value: 'large', label: 'Large', class: 'text-size-large' },
  { value: 'extra-large', label: 'Extra Large', class: 'text-size-xl' },
];

interface ExamSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamSettings({ isOpen, onOpenChange }: ExamSettingsProps) {
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
  
  if (!mounted) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Screen Settings</AlertDialogTitle>
          <AlertDialogDescription>Adjust the appearance for better readability.</AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-6 py-4">
            <div className="space-y-3">
                <Label>Color Contrast</Label>
                <div className="flex gap-2">
                    {contrastOptions.map(option => (
                        <Button key={option.value} variant={contrast === option.value ? 'default' : 'outline'} onClick={() => setContrast(option.value)}>
                            {contrast === option.value && <Check className="mr-2 h-4 w-4" />}
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>
             <div className="space-y-3">
                <Label>Text Size</Label>
                <div className="flex gap-2">
                    {textSizeOptions.map(option => (
                         <Button key={option.value} variant={textSize === option.value ? 'default' : 'outline'} onClick={() => setTextSize(option.value)}>
                            {textSize === option.value && <Check className="mr-2 h-4 w-4" />}
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>
             <div className="space-y-3">
                <Label>Volume</Label>
                <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5"/>
                    <Slider defaultValue={[100]} max={100} step={1} className="w-full"/>
                </div>
            </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
