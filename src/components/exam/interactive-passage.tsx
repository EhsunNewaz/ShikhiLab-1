
'use client';

import { useState, useMemo, useRef, useEffect, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface Highlight {
  id: string;
  start: number;
  end: number;
}

interface TempHighlight {
  start: number;
  end: number;
}

interface PopupState {
  x: number;
  y: number;
  visible: boolean;
}

interface InteractivePassageProps {
  text: string;
  as?: React.ElementType;
  className?: string;
}

const SelectionPopup = ({
  x,
  y,
  onHighlight,
  onNote,
}: {
  x: number;
  y: number;
  onHighlight: () => void;
  onNote: () => void;
}) => {
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

export function InteractivePassage({ text, as: Comp = 'div', className }: InteractivePassageProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [tempHighlight, setTempHighlight] = useState<TempHighlight | null>(null);
  const [popup, setPopup] = useState<PopupState>({ x: 0, y: 0, visible: false });
  const passageRef = useRef<HTMLDivElement>(null);

  // Combines permanent and temporary highlights for rendering
  const allAnnotations = useMemo(() => {
    const annotations = highlights.map(h => ({ ...h, type: 'permanent' as const }));
    if (tempHighlight) {
      annotations.push({ ...tempHighlight, id: 'temp', type: 'temporary' as const });
    }
    return annotations.sort((a, b) => a.start - b.start);
  }, [highlights, tempHighlight]);

  // Hide popup on any outside click
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (popup.visible) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-popup="true"]')) {
          setPopup(prev => ({ ...prev, visible: false }));
          setTempHighlight(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popup.visible]);

  const getSelectionOffsets = (container: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    
    const range = selection.getRangeAt(0);
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null;

    let startOffset = -1;
    let endOffset = -1;
    let accumulatedLength = 0;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        const nodeLength = node.textContent?.length || 0;
        if (startOffset === -1 && node === range.startContainer) {
            startOffset = accumulatedLength + range.startOffset;
        }
        if (node === range.endContainer) {
            endOffset = accumulatedLength + range.endOffset;
            break;
        }
        accumulatedLength += nodeLength;
    }
    
    if (startOffset !== -1 && endOffset !== -1) {
        return { start: startOffset, end: endOffset };
    }
    return null;
  };
  
  const handleMouseUp = () => {
    if (!passageRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
    }

    const offsets = getSelectionOffsets(passageRef.current);
    if (!offsets) return;

    const isOverlapping = highlights.some(h => (offsets.start < h.end && offsets.end > h.start));
    if (isOverlapping) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = passageRef.current.getBoundingClientRect();
    
    setPopup({
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 45, // Position above selection
    });
    setTempHighlight(offsets);
    selection.removeAllRanges();
  };

  const handlePermanentHighlight = () => {
    if (!tempHighlight) return;
    const isOverlapping = highlights.some(h => (tempHighlight.start < h.end && tempHighlight.end > h.start));
    if (isOverlapping) return;

    setHighlights(prev => [...prev, { ...tempHighlight, id: crypto.randomUUID() }]);
    setTempHighlight(null);
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const handleNote = () => {
     if (!tempHighlight) return;
     console.log('Note action for text range:', tempHighlight);
     // For now, we'll just make it a highlight as well
     handlePermanentHighlight();
  };

  const clearHighlight = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  const renderedPassage = useMemo(() => {
    if (allAnnotations.length === 0) {
      return text;
    }

    const parts = [];
    let lastIndex = 0;

    allAnnotations.forEach(annotation => {
      if (annotation.start > lastIndex) {
        parts.push(text.substring(lastIndex, annotation.start));
      }
      parts.push(
        <span
          key={annotation.id}
          className={cn({
            'bg-[#FFFF99] cursor-pointer': annotation.type === 'permanent',
            'bg-green-300/70': annotation.type === 'temporary',
          })}
          data-highlight-id={annotation.id}
          onClick={() => annotation.type === 'permanent' && clearHighlight(annotation.id)}
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
  }, [text, allAnnotations]);

  return (
    <div className="relative">
      <Comp
        ref={passageRef}
        className={cn("whitespace-pre-wrap", className)}
        onMouseUp={handleMouseUp}
      >
        {renderedPassage}
      </Comp>
      {popup.visible && tempHighlight && (
        <SelectionPopup
            x={popup.x}
            y={popup.y}
            onHighlight={handlePermanentHighlight}
            onNote={handleNote}
        />
      )}
    </div>
  );
}
