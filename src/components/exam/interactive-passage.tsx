
'use client';

import { useState, useMemo, useRef, useEffect, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// Temporarily add uuid for unique keys until a proper solution is in place
// In a real app, you would add the 'uuid' and '@types/uuid' packages.
// For this environment, we'll just use a simple polyfill.
const DUMMY_UUID = '00000000-0000-0000-0000-000000000000';
try {
  // Try to use the real uuid if it somehow exists
  uuidv4();
} catch {
  window.uuidv4 = () => DUMMY_UUID + Math.random();
}


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
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, selection: null });
  const passageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setContextMenu({ x: event.pageX, y: event.pageY, visible: true, selection });
    }
  };

  const addHighlight = () => {
    const selection = contextMenu.selection;
    if (!selection || !passageRef.current) return;

    const range = selection.getRangeAt(0);
    const passageTextNode = passageRef.current.firstChild;
    
    if (!passageTextNode || !passageTextNode.contains(range.startContainer) || !passageTextNode.contains(range.endContainer)) {
        // Selection is not fully within our passage text node, ignore it.
        return;
    }

    const start = range.startOffset;
    const end = range.endOffset;
    
    // Avoid creating overlapping highlights
    const isOverlapping = highlights.some(h => (start < h.end && end > h.start));
    if (isOverlapping) {
      // For simplicity, we just ignore overlapping highlights.
      // A more complex implementation might merge them.
      return;
    }
    
    setHighlights([...highlights, { id: uuidv4(), start, end }]);
    setContextMenu(prev => ({...prev, visible: false}));
    selection.removeAllRanges();
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
      // Add text before the highlight
      if (highlight.start > lastIndex) {
        parts.push(text.substring(lastIndex, highlight.start));
      }
      // Add the highlighted text
      parts.push(
        <span key={highlight.id} className="text-highlight">
          {text.substring(highlight.start, highlight.end)}
        </span>
      );
      lastIndex = highlight.end;
    });

    // Add any remaining text after the last highlight
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  }, [text, highlights]);
  
  const contextMenuOptions = [
    { label: 'Highlight', action: addHighlight },
    { label: 'Clear All Highlights', action: clearAllHighlights },
  ];

  return (
    <div onContextMenu={handleContextMenu}>
      <div ref={passageRef} className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-body text-base">
        {renderedPassage}
      </div>
      {contextMenu.visible && <ContextMenu x={contextMenu.x} y={contextMenu.y} options={contextMenuOptions} />}
    </div>
  );
}
