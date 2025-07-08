
'use client';

import { useState, useMemo, useRef, useEffect, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// --- TYPES ---
interface Annotation {
  id: string;
  start: number;
  end: number;
  type: 'highlight' | 'note';
  noteText?: string;
}

interface TempSelection {
  start: number;
  end: number;
}

interface PopupState {
  x: number;
  y: number;
  visible: boolean;
}

interface RemovePopupState extends PopupState {
  annotationId: string | null;
}

interface InteractivePassageProps {
  text: string;
  as?: React.ElementType;
  className?: string;
}

// --- POPUP COMPONENTS ---

const SelectionPopup = ({ x, y, onHighlight, onNote }: { x: number; y: number; onHighlight: () => void; onNote: () => void; }) => {
  return (
    <div
      className="absolute z-50 flex items-center rounded-md shadow-lg bg-[#2C3E50] text-white font-sans"
      style={{ top: y, left: x, transform: 'translateX(-50%)' }}
      data-popup="true"
    >
      <button onClick={onNote} className="px-4 py-2 text-sm hover:bg-black/20 rounded-l-md">
        Note
      </button>
      <div className="w-px h-4 bg-white/30"></div>
      <button onClick={onHighlight} className="px-4 py-2 text-sm hover:bg-black/20 rounded-r-md">
        Highlight
      </button>
    </div>
  );
};

const NoteInputPopup = ({ x, y, onSave, onCancel }: { x: number; y: number; onSave: (noteText: string) => void; onCancel: () => void; }) => {
    const [noteText, setNoteText] = useState('');
    
    const handleSave = () => {
        if (noteText.trim()) {
            onSave(noteText);
        }
    }

    return (
        <div
            className="absolute z-50 flex flex-col gap-2 rounded-md shadow-lg bg-white border border-gray-300 p-3 w-64"
            style={{ top: y + 10, left: x, transform: 'translateX(-50%)' }}
            data-popup="true"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
            <Textarea 
                placeholder="Please enter your notes" 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="resize-none"
                rows={4}
            />
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={!noteText.trim()}>Save</Button>
            </div>
        </div>
    )
}

const RemovePopup = ({ x, y, onRemove, label }: { x: number; y: number; onRemove: () => void; label: string }) => {
  return (
    <div
      className="absolute z-50 flex items-center rounded-md shadow-lg bg-[#2C3E50] text-white font-sans"
      style={{ top: y, left: x, transform: 'translateX(-50%)' }}
      data-popup="true"
    >
      <button onClick={onRemove} className="px-4 py-2 text-sm hover:bg-black/20 rounded-md">
        {label}
      </button>
    </div>
  );
};


// --- MAIN COMPONENT ---
export function InteractivePassage({ text, as: Comp = 'div', className }: InteractivePassageProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [tempSelection, setTempSelection] = useState<TempSelection | null>(null);
  
  const [selectionPopup, setSelectionPopup] = useState<PopupState>({ x: 0, y: 0, visible: false });
  const [noteInputPopup, setNoteInputPopup] = useState<PopupState>({ x: 0, y: 0, visible: false });
  const [removePopup, setRemovePopup] = useState<RemovePopupState>({ x: 0, y: 0, visible: false, annotationId: null });
  
  const passageRef = useRef<HTMLDivElement>(null);

  // Combines permanent and temporary selections for rendering
  const allAnnotationsForRender = useMemo(() => {
    const renderedAnnotations: (Annotation | (TempSelection & { id: string, type: 'temporary' }))[] = [...annotations];
    if (tempSelection) {
      renderedAnnotations.push({ ...tempSelection, id: 'temp', type: 'temporary' as const });
    }
    return renderedAnnotations.sort((a, b) => a.start - b.start);
  }, [annotations, tempSelection]);

  const hideAllPopups = () => {
    setSelectionPopup({ x: 0, y: 0, visible: false });
    setNoteInputPopup({ x: 0, y: 0, visible: false });
    setRemovePopup({ x: 0, y: 0, visible: false, annotationId: null });
    setTempSelection(null);
  }

  // Hide popups on any outside click or Esc key
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-popup="true"]')) {
        hideAllPopups();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideAllPopups();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getSelectionOffsets = (container: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    
    const range = selection.getRangeAt(0);
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null;

    let startOffset = -1;
    let endOffset = -1;
    let accumulatedLength = 0;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
        if (startOffset === -1 && node === range.startContainer) {
            startOffset = accumulatedLength + range.startOffset;
        }
        if (node === range.endContainer) {
            endOffset = accumulatedLength + range.endOffset;
            break;
        }
        accumulatedLength += node.textContent?.length || 0;
    }
    
    if (startOffset !== -1 && endOffset !== -1) {
        return { start: startOffset, end: endOffset };
    }
    return null;
  };
  
  const handleMouseUp = () => {
    if (!passageRef.current || noteInputPopup.visible || removePopup.visible) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    
    if ((selection.anchorNode?.parentElement as HTMLElement)?.dataset.annotationId) {
        selection.removeAllRanges();
        return;
    }

    const offsets = getSelectionOffsets(passageRef.current);
    if (!offsets) return;

    const isOverlapping = annotations.some(h => (offsets.start < h.end && offsets.end > h.start));
    if (isOverlapping) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = passageRef.current.getBoundingClientRect();
    
    setSelectionPopup({
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 45,
    });
    setRemovePopup({ x: 0, y: 0, visible: false, annotationId: null });
    setTempSelection(offsets);
    selection.removeAllRanges();
  };

  const addAnnotation = (type: 'highlight' | 'note', noteText?: string) => {
    if (!tempSelection) return;
    const isOverlapping = annotations.some(h => (tempSelection.start < h.end && tempSelection.end > h.start));
    if (isOverlapping) {
      hideAllPopups();
      return;
    };

    setAnnotations(prev => [...prev, { ...tempSelection, id: crypto.randomUUID(), type, noteText }]);
    hideAllPopups();
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(h => h.id !== id));
    hideAllPopups();
  };

  const handleOpenAnnotationPopup = (e: MouseEvent<HTMLSpanElement>, annotation: Annotation) => {
    e.stopPropagation();
    hideAllPopups();

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = passageRef.current!.getBoundingClientRect();
    
    setRemovePopup({
      visible: true,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 45,
      annotationId: annotation.id,
    });
  }

  const renderedPassage = useMemo(() => {
    if (allAnnotationsForRender.length === 0) {
      return text;
    }

    const parts = [];
    let lastIndex = 0;

    allAnnotationsForRender.forEach(annotation => {
      if (annotation.start > lastIndex) {
        parts.push(text.substring(lastIndex, annotation.start));
      }

      let styleClass = '';
      if (annotation.type === 'highlight') {
          styleClass = 'bg-[#FFFF99] cursor-pointer';
      } else if (annotation.type === 'note') {
          styleClass = 'border-b-2 border-dotted border-blue-500 cursor-pointer';
      } else if (annotation.type === 'temporary') {
          styleClass = 'bg-green-300/70';
      }

      parts.push(
        <span
          key={annotation.id}
          className={styleClass}
          data-annotation-id={annotation.id}
          onClick={(e: MouseEvent<HTMLSpanElement>) => {
            if (annotation.type === 'highlight' || annotation.type === 'note') {
              handleOpenAnnotationPopup(e, annotation);
            }
          }}
        >
          {text.substring(annotation.start, annotation.end)}
        </span>
      );
      lastIndex = annotation.end;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, allAnnotationsForRender]);

  return (
    <div className="relative">
      <Comp
        ref={passageRef}
        className={cn("whitespace-pre-wrap select-text", className)}
        onMouseUpCapture={handleMouseUp}
      >
        {renderedPassage}
      </Comp>
      
      {selectionPopup.visible && tempSelection && (
        <SelectionPopup
            x={selectionPopup.x}
            y={selectionPopup.y}
            onHighlight={() => addAnnotation('highlight')}
            onNote={() => {
                setNoteInputPopup({ ...selectionPopup, visible: true });
                setSelectionPopup(p => ({ ...p, visible: false }));
            }}
        />
      )}

      {noteInputPopup.visible && tempSelection && (
          <NoteInputPopup 
            x={noteInputPopup.x}
            y={noteInputPopup.y}
            onSave={(noteText) => addAnnotation('note', noteText)}
            onCancel={hideAllPopups}
          />
      )}

       {removePopup.visible && removePopup.annotationId && (() => {
           const annotation = annotations.find(a => a.id === removePopup.annotationId);
           if (!annotation) return null;

           return (
            <RemovePopup
                x={removePopup.x}
                y={removePopup.y}
                onRemove={() => removeAnnotation(removePopup.annotationId!)}
                label={annotation.type === 'highlight' ? "Remove highlight" : "Remove note"}
            />
           )
       })()}
    </div>
  );
}
