
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Draggable from 'react-draggable';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Draggable handle=".handle">
        <div className="fixed z-20 w-[300px] animate-in fade-in-50">
            <Card className="h-[400px] flex flex-col bg-[#fffacd] border-gray-400 shadow-2xl">
                <CardHeader className="handle flex flex-row items-center justify-between p-3 bg-gray-200/50 cursor-move">
                    <CardTitle className="text-base font-semibold text-gray-800">Notes</CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-2 flex-grow">
                    <Textarea 
                        className="h-full w-full resize-none border-gray-300 bg-white focus-visible:ring-blue-500 font-exam text-sm" 
                        placeholder="Type your notes here..."
                    />
                </CardContent>
            </Card>
        </div>
    </Draggable>
  );
}
