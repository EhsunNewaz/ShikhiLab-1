
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-in fade-in-50",
        { "hidden": !isOpen }
    )}>
        <Card className="w-[300px] bg-[#fffacd] border-gray-400 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-3 bg-gray-200/50">
                <CardTitle className="text-base font-semibold text-gray-800">Notes</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-2">
                <Textarea 
                    className="h-64 w-full resize-none border-gray-300 bg-white focus-visible:ring-blue-500" 
                    placeholder="Type your notes here..."
                />
            </CardContent>
        </Card>
    </div>
  );
}
