
'use client';

import { useState, useMemo, useRef, useEffect, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Draggable from 'react-draggable';
import { X, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// --- TYPES ---
export interface Annotation {
  id: string;
  start: number;
  end: number;
  type: 'highlight' | 'note';
  noteText?: string;
  passageId: string;
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

export interface PassageProps {
  id: string; // A unique ID for this passage instance for storage
  text: string;
  as?: React.ElementType;
  className?: string;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  scrollToAnnotationId: string | null;
  onScrollComplete: () => void;
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
                    <button onClick={onNote} className="text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"><Pencil className="h-4 w-4" />Notes</button>
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


const StickyNotePanel = ({ noteText, onClose, onSave }: { noteText: string; onClose: () => void; onSave: (text: string) => void; }) => {
  const nodeRef = useRef(null);
  const [text, setText] = useState(noteText);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const charLimit = 1000;
  
  const handleSaveAndClose = () => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    onSave(text);
    onClose();
  };
  
  useEffect(() => {
    // Auto-save logic
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
        onSave(text);
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    }
  }, [text, onSave]);

  return (
    <Draggable handle=".handle" nodeRef={nodeRef} bounds="parent">
        <div ref={nodeRef} className="fixed z-40 w-[300px]" data-popup="true">
            <div className="h-[400px] flex flex-col bg-yellow-100 border border-yellow-400 shadow-2xl rounded-md overflow-hidden">
                <div className="handle flex flex-row items-center justify-between p-3 bg-yellow-200 cursor-move border-b border-yellow-400/50">
                    <h3 className="text-base font-semibold text-gray-800">Note</h3>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={handleSaveAndClose}
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
                    <div className="flex justify-between items-center px-1">
                         <span className="text-xs text-gray-500">{text.length} / {charLimit}</span>
                         <Button onClick={handleSaveAndClose} size="sm" className="self-end bg-yellow-400 hover:bg-yellow-500 text-black">
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
export function InteractivePassage({ id, text, as: Comp = 'div', className, annotations, setAnnotations, scrollToAnnotationId, onScrollComplete }: PassageProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, type: 'selection' });
  const [notesPanel, setNotesPanel] = useState<NotesPanelState>({ visible: false, annotationId: '', noteText: ''});
  const rootRef = useRef<HTMLDivElement>(null); // Ref for the main container
  const { toast } = useToast();
  
  // Filter annotations for this specific passage instance
  const passageAnnotations = useMemo(() => annotations.filter(a => a.passageId === id), [annotations, id]);

  const hideAllPopups = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };
  
  // Effect to scroll to a specific annotation when requested by parent
  useEffect(() => {
    if (scrollToAnnotationId && rootRef.current) {
        const element = rootRef.current.querySelector(`[data-annotation-id="${scrollToAnnotationId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        onScrollComplete(); // Notify parent that scroll is done
    }
  }, [scrollToAnnotationId, onScrollComplete]);

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
    
    if (!rootRef.current || !rootRef.current.contains(range.startContainer) || !rootRef.current.contains(range.endContainer)) {
        return null;
    }

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
    
    if (!rootRef.current) return;
    const target = e.target as HTMLElement;
    const annotationElement = target.closest('[data-annotation-id]');
    const annotationId = annotationElement?.getAttribute('data-annotation-id');

    if (annotationId && annotationElement) {
        const rect = annotationElement.getBoundingClientRect();
        setContextMenu({
            visible: true,
            x: e.clientX - rect.left + (rect.left - rootRef.current.getBoundingClientRect().left),
            y: e.clientY - rect.top + (rect.bottom - rootRef.current.getBoundingClientRect().top) + 5,
            type: 'annotation',
            annotationId: annotationId,
        });
        return;
    }

    const offsets = getSelectionOffsets(rootRef.current);
    if (!offsets) return;

    const isOverlapping = passageAnnotations.some(h => (offsets.start < h.end && offsets.end > h.start));
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
        x: rect.left - rootRef.current.getBoundingClientRect().left,
        y: rect.bottom - rootRef.current.getBoundingClientRect().top + 5,
        type: 'selection',
        selection: offsets,
    });
  }
  
  const addAnnotation = (type: 'highlight' | 'note', noteText: string = '') => {
    const selection = contextMenu.selection;
    if (!selection) return;

    const newAnnotation: Annotation = { ...selection, id: crypto.randomUUID(), type, noteText, passageId: id };
    
    const newAnnotations = [...annotations, newAnnotation].sort((a,b) => a.start - b.start);
    setAnnotations(newAnnotations);
    
    if (type === 'note') {
        setNotesPanel({ visible: true, annotationId: newAnnotation.id, noteText });
    }
    
    hideAllPopups();
    window.getSelection()?.removeAllRanges();
  };
  
  const handleUpdateNote = (annotationId: string, text: string) => {
    setAnnotations(prevAnns => prevAnns.map(ann => 
        ann.id === annotationId ? { ...ann, noteText: text, type: 'note' } : ann
    ));
  };
  
  const handleCloseNotePanel = () => {
    setNotesPanel({visible: false, annotationId: '', noteText: ''});
  }

  const removeAnnotation = (idToRemove: string) => {
    setAnnotations(annotations.filter(h => h.id !== idToRemove));
    hideAllPopups();
  };

  const removeAllAnnotations = () => {
    setAnnotations(annotations.filter(a => a.passageId !== id));
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
    if (passageAnnotations.length === 0) return text;

    const parts: ReactNode[] = [];
    let lastIndex = 0;

    passageAnnotations.forEach(annotation => {
      if (annotation.start > lastIndex) {
        parts.push(text.substring(lastIndex, annotation.start));
      }
      
      const el = (
        <span
          key={annotation.id}
          className={cn('cursor-pointer relative bg-exam-highlight')}
          data-annotation-id={annotation.id}
          onClick={(e) => {
            if (annotation.type === 'note') {
              e.stopPropagation();
              handleViewNote(annotation.id);
            }
          }}
        >
          {text.substring(annotation.start, annotation.end)}
           {annotation.type === 'note' && annotation.noteText && (
             <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild> 
                         <div 
                           className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white"
                          />
                    </TooltipTrigger>
                    <TooltipContent 
                        data-popup="true" 
                        side="top" 
                        align="center"
                        className="max-w-xs whitespace-pre-wrap font-sans text-sm z-50 p-2"
                    >
                        <p>{annotation.noteText}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
           )}
        </span>
      );

      parts.push(el);
      lastIndex = annotation.end;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, passageAnnotations]);


  return (
    <div ref={rootRef} onContextMenu={handleContextMenu} className="relative" data-interactive-passage="true">
      <Comp className={cn("whitespace-pre-wrap select-text", className)}>
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
            <StickyNotePanel 
                noteText={notesPanel.noteText}
                onClose={handleCloseNotePanel}
                onSave={(text) => {
                    handleUpdateNote(notesPanel.annotationId, text);
                }}
            />
          </div>
      )}
    </div>
  );
}
