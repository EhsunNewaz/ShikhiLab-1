
'use client';

import { useState, useMemo, useRef, useEffect, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface Highlight {
  id: string;
  start: number;
  end: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  selection: Selection | null;
  targetHighlightId: string | null;
}

interface InteractivePassageProps {
  text: string;
}

const ContextMenu = ({ x, y, options }: { x: number; y: number; options: { label: string; action: () => void }[] }) => {
  return (
    <div
      className="absolute z-50 w-48 rounded-md border bg-white shadow-lg"
      style={{ top: y, left: x }}
    >
      <ul className="py-1">
        {options.map((option) => (
          <li key={option.label}>
            <button
              onClick={option.action}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};


export function InteractivePassage({ text }: InteractivePassageProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, selection: null, targetHighlightId: null });
  const passageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const selection = window.getSelection();
    const targetElement = event.target as HTMLElement;
    const highlightSpan = targetElement.closest('[data-highlight-id]');
    const highlightId = highlightSpan ? highlightSpan.getAttribute('data-highlight-id') : null;

    if (highlightId) {
        setContextMenu({ x: event.pageX, y: event.pageY, visible: true, selection: null, targetHighlightId: highlightId });
    } else if (selection && selection.toString().trim().length > 0) {
      setContextMenu({ x: event.pageX, y: event.pageY, visible: true, selection, targetHighlightId: null });
    }
  };

  const addHighlight = () => {
    const selection = contextMenu.selection;
    if (!selection || !passageRef.current) return;

    const range = selection.getRangeAt(0);
    const passageTextNode = passageRef.current.firstChild;
    
    if (!passageTextNode || !passageTextNode.contains(range.startContainer) || !passageTextNode.contains(range.endContainer)) {
        return;
    }

    const start = range.startOffset;
    const end = range.endOffset;
    
    const isOverlapping = highlights.some(h => (start < h.end && end > h.start));
    if (isOverlapping) {
      return;
    }
    
    setHighlights([...highlights, { id: crypto.randomUUID(), start, end }]);
    setContextMenu(prev => ({...prev, visible: false}));
    selection.removeAllRanges();
  };

  const clearHighlight = () => {
    if (!contextMenu.targetHighlightId) return;
    setHighlights(highlights.filter(h => h.id !== contextMenu.targetHighlightId));
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const clearAllHighlights = () => {
    setHighlights([]);
    setContextMenu(prev => ({...prev, visible: false}));
  };

  const renderedPassage = useMemo(() => {
    if (highlights.length === 0) {
      return text;
    }

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;

    sortedHighlights.forEach(highlight => {
      if (highlight.start > lastIndex) {
        parts.push(text.substring(lastIndex, highlight.start));
      }
      parts.push(
        <span key={highlight.id} className="text-highlight" data-highlight-id={highlight.id}>
          {text.substring(highlight.start, highlight.end)}
        </span>
      );
      lastIndex = highlight.end;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  }, [text, highlights]);
  
  const contextMenuOptions = useMemo(() => {
    if (contextMenu.targetHighlightId) {
        return [
            { label: 'Clear Highlight', action: clearHighlight },
            { label: 'Clear All Highlights', action: clearAllHighlights },
        ]
    }
    if (contextMenu.selection && contextMenu.selection.toString().trim().length > 0) {
        return [
            { label: 'Highlight', action: addHighlight },
            { label: 'Clear All Highlights', action: clearAllHighlights },
        ]
    }
    return [];
  }, [contextMenu, highlights]);

  return (
    <div onContextMenu={handleContextMenu}>
      <div ref={passageRef} className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-body text-base">
        {renderedPassage}
      </div>
      {contextMenu.visible && contextMenuOptions.length > 0 && <ContextMenu x={contextMenu.x} y={contextMenu.y} options={contextMenuOptions} />}
    </div>
  );
}
