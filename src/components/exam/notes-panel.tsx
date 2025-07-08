
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'exam-general-notes';

export function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        try {
            const savedNotes = localStorage.getItem(STORAGE_KEY);
            if (savedNotes) {
                setNotes(savedNotes);
            }
        } catch (error) {
            console.error("Could not load notes from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, notes);
        } catch (error) {
            console.error("Could not save notes to localStorage", error);
        }
    }, [notes]);


  return (
    <>
        {/* Overlay */}
        <div 
            className={cn(
                'fixed inset-0 z-10 bg-black/20 transition-opacity',
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={onClose}
        />
        {/* Panel */}
        <div
            className={cn(
                'fixed top-0 h-full w-[350px] bg-background shadow-2xl z-20 transition-transform duration-300 ease-in-out',
                'right-0',
                isOpen ? 'translate-x-0' : 'translate-x-full'
            )}
        >
            <Card className="h-full flex flex-col rounded-none border-l">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <div>
                        <CardTitle className="text-lg">Notes</CardTitle>
                        <CardDescription>Your general notes for this test.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-2 flex-grow">
                    <Textarea 
                        className="h-full w-full resize-none border-gray-300 bg-white focus-visible:ring-blue-500 font-exam text-sm" 
                        placeholder="Type your notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </CardContent>
            </Card>
        </div>
    </>
  );
}
