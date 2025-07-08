
'use client';

import { useState, useMemo, useRef, useEffect, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Draggable from 'react-draggable';
import { X } from 'lucide-react';


// --- TYPES ---
interface Annotation {
  id: string;
  start: number;
  end: number;
  type: 'highlight' | 'note';
  noteText?: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  type: 'selection' | 'annotation';
  annotationId?: string;
  selection?: { start: number, end: number };
}

interface NotesPanelState {
    visible: boolean;
    annotationId: string;
    noteText: string;
}

interface InteractivePassageProps {
  id: string;
  text: string;
  as?: React.ElementType;
  className?: string;
}

// --- SUB-COMPONENTS ---
const ContextMenuPopup = ({ state, annotations, onHighlight, onNote, onClear, onClearAll, onViewNote }: { state: ContextMenuState; annotations: Annotation[]; onHighlight: () => void; onNote: () => void; onClear: (id: string) => void; onClearAll: () => void; onViewNote: (id: string) => void; }) => {
    const currentAnnotation = state.annotationId ? annotations.find(a => a.id === state.annotationId) : null;
    
    return (
         <div
            data-popup="true"
            className="absolute z-50 flex flex-col min-w-[180px] rounded-md shadow-lg bg-white border border-gray-300 text-sm font-exam"
            style={{ top: state.y, left: state.x }}
         >
            {state.type === 'selection' && (
                <>
                    <button onClick={onHighlight} className="text-left px-4 py-2 hover:bg-gray-100">Highlight</button>
                    <button onClick={onNote} className="text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>Notes</button>
                </>
            )}
            {state.type === 'annotation' && currentAnnotation && (
                 <>
                    {currentAnnotation.type === 'note' && (
                         <button onClick={() => onViewNote(currentAnnotation.id)} className="text-left px-4 py-2 hover:bg-gray-100">View/Edit Note</button>
                    )}
                    <button onClick={() => onClear(currentAnnotation.id)} className="text-left px-4 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800">Clear</button>
                    <button onClick={onClearAll} className="text-left px-4 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800">Clear All</button>
                </>
            )}
         </div>
    );
};


const NotesPanel = ({ noteText, onClose, onSave }: { noteText: string; onClose: () => void; onSave: (text: string) => void; }) => {
  const nodeRef = useRef(null);
  const [text, setText] = useState(noteText);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const charLimit = 1000;
  
  const handleSave = () => {
    setIsSaving(true);
    onSave(text);
    setTimeout(() => setIsSaving(false), 500); // Visual feedback
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  };
  
  useEffect(() => {
    // Auto-save logic
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
        handleSave();
    }, 10000); // Auto-save every 10 seconds

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Draggable handle=".handle" nodeRef={nodeRef} bounds="parent">
        <div ref={nodeRef} className="fixed z-40 w-[300px]" data-popup="true">
            <div className="h-[400px] flex flex-col bg-[#fffacd] border-gray-400 shadow-2xl rounded-md overflow-hidden">
                <div className="handle flex flex-row items-center justify-between p-3 bg-yellow-200/50 cursor-move border-b border-yellow-400/50">
                    <h3 className="text-base font-semibold text-gray-800">Note</h3>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={onClose}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-2 flex-grow flex flex-col gap-2">
                    <Textarea 
                        className="h-full w-full resize-none border-gray-300 bg-white focus-visible:ring-blue-500 font-exam text-sm" 
                        placeholder="Type your notes here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={charLimit}
                    />
                    <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-500">{text.length} / {charLimit}</span>
                         <Button onClick={handleSave} size="sm" className="self-end" disabled={isSaving}>
                            {isSaving ? 'Saved!' : 'Save & Close'}
                         </Button>
                    </div>
                </div>
            </div>
        </div>
    </Draggable>
  );
}


// --- MAIN COMPONENT ---
export function InteractivePassage({ id, text, as: Comp = 'div', className }: InteractivePassageProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, type: 'selection' });
  const [notesPanel, setNotesPanel] = useState<NotesPanelState>({ visible: false, annotationId: '', noteText: ''});
  const passageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const storageKey = `passage-annotations-${id}`;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedAnnotations = window.localStorage.getItem(storageKey);
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }
    } catch (error) {
      console.error("Failed to load annotations from localStorage", error);
    }
  }, [storageKey]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(annotations));
    } catch (error) {
      console.error("Failed to save annotations to localStorage", error);
    }
  }, [annotations, storageKey]);


  const hideAllPopups = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-popup="true"]')) {
        hideAllPopups();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectionOffsets = (container: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    
    const range = selection.getRangeAt(0);
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null;

    let startOffset = 0;
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    startOffset = preSelectionRange.toString().length;
    
    const endOffset = startOffset + range.toString().length;
    
    if (startOffset === endOffset) return null;

    return { start: startOffset, end: endOffset };
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    hideAllPopups();

    const target = e.target as HTMLElement;
    const annotationElement = target.closest('[data-annotation-id]');
    const annotationId = annotationElement?.getAttribute('data-annotation-id');

    if (annotationId && annotationElement) {
        const rect = annotationElement.getBoundingClientRect();
        setContextMenu({
            visible: true,
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY + 5,
            type: 'annotation',
            annotationId: annotationId,
        });
        return;
    }

    const offsets = getSelectionOffsets(passageRef.current!);
    if (!offsets) return;

    const isOverlapping = annotations.some(h => (offsets.start < h.end && offsets.end > h.start));
    if (isOverlapping) {
      toast({ variant: 'destructive', title: "Overlapping Selection", description: "Highlights cannot overlap." });
      return;
    }
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setContextMenu({
        visible: true,
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 5,
        type: 'selection',
        selection: offsets,
    });
  }

  const addAnnotation = (type: 'highlight' | 'note', noteText: string = '') => {
    const selection = contextMenu.selection;
    if (!selection) return;

    const newAnnotation: Annotation = { ...selection, id: crypto.randomUUID(), type, noteText };
    setAnnotations(prev => [...prev, newAnnotation].sort((a,b) => a.start - b.start));
    
    if (type === 'note') {
        setNotesPanel({ visible: true, annotationId: newAnnotation.id, noteText });
    }
    
    hideAllPopups();
  };
  
  const handleUpdateNote = (annotationId: string, text: string) => {
    setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId ? { ...ann, noteText: text, type: 'note' } : ann
    ));
    setNotesPanel({visible: false, annotationId: '', noteText: ''});
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(h => h.id !== id));
    hideAllPopups();
  };

  const removeAllAnnotations = () => {
    setAnnotations([]);
    hideAllPopups();
  }
  
  const handleViewNote = (annotationId: string) => {
    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation) {
        setNotesPanel({ visible: true, annotationId: annotation.id, noteText: annotation.noteText || '' });
    }
    hideAllPopups();
  };


  const renderedPassage = useMemo(() => {
    if (annotations.length === 0) return text;

    const parts: ReactNode[] = [];
    let lastIndex = 0;

    annotations.forEach(annotation => {
      if (annotation.start > lastIndex) {
        parts.push(text.substring(lastIndex, annotation.start));
      }

      parts.push(
        <span
          key={annotation.id}
          className={cn('cursor-pointer relative bg-exam-highlight')}
          data-annotation-id={annotation.id}
        >
          {text.substring(annotation.start, annotation.end)}
           {annotation.type === 'note' && (
             <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white" title="This highlight has a note."/>
           )}
        </span>
      );
      lastIndex = annotation.end;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, annotations]);


  return (
    <div onContextMenu={handleContextMenu} className="relative" data-interactive-passage="true">
      <Comp ref={passageRef} className={cn("whitespace-pre-wrap select-text", className)}>
        {renderedPassage}
      </Comp>
      
      {contextMenu.visible && (
        <ContextMenuPopup 
            state={contextMenu} 
            annotations={annotations}
            onHighlight={() => addAnnotation('highlight')}
            onNote={() => addAnnotation('note')}
            onClear={removeAnnotation}
            onClearAll={removeAllAnnotations}
            onViewNote={handleViewNote}
        />
      )}

      {notesPanel.visible && (
          <div className='absolute inset-0' data-popup="true">
            <NotesPanel 
                noteText={notesPanel.noteText}
                onClose={() => setNotesPanel(prev => ({...prev, visible: false}))}
                onSave={(text) => {
                    handleUpdateNote(notesPanel.annotationId, text);
                }}
            />
          </div>
      )}
    </div>
  );
}
