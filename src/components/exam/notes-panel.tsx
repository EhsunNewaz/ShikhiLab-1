
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Annotation } from './interactive-passage';
import { ScrollArea } from '../ui/scroll-area';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  annotations: Annotation[];
  onNoteSelect: (annotationId: string) => void;
}

export function NotesPanel({ isOpen, onClose, annotations, onNoteSelect }: NotesPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const noteAnnotations = useMemo(() => {
        return annotations
            .filter(a => a.type === 'note' && a.noteText)
            .filter(a => a.noteText?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [annotations, searchTerm]);

    const handleNoteClick = (annotationId: string) => {
        onNoteSelect(annotationId);
        onClose(); // Optionally close panel on selection
    }

  return (
    <>
        {/* Overlay */}
        <div 
            className={cn(
                'fixed inset-0 z-30 bg-black/20 transition-opacity',
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={onClose}
        />
        {/* Panel */}
        <div
            className={cn(
                'fixed top-0 h-full w-[350px] bg-background shadow-2xl z-40 transition-transform duration-300 ease-in-out',
                'right-0',
                isOpen ? 'translate-x-0' : 'translate-x-full'
            )}
        >
            <div className="h-full flex flex-col border-l">
                <CardHeader className="p-4 border-b">
                     <div className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">My Notes</CardTitle>
                            <CardDescription>Search and review your notes.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="relative mt-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search notes..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-2">
                        {noteAnnotations.length > 0 ? (
                            noteAnnotations.map(note => (
                                <button 
                                    key={note.id} 
                                    onClick={() => handleNoteClick(note.id)}
                                    className="w-full text-left p-3 rounded-md border bg-card hover:bg-muted transition-colors"
                                >
                                    <p className="text-sm text-card-foreground line-clamp-4 whitespace-pre-wrap">{note.noteText}</p>
                                </button>
                            ))
                        ) : (
                            <div className="text-center p-8 text-sm text-muted-foreground">
                                <p>{searchTerm ? 'No notes match your search.' : 'You haven\'t created any notes yet.'}</p>
                                <p className="text-xs mt-2">To create a note, select text in the passage and right-click.</p>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </div>
        </div>
    </>
  );
}
