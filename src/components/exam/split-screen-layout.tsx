
'use client';

import type { ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitScreenLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function SplitScreenLayout({ leftPanel, rightPanel }: SplitScreenLayoutProps) {
  return (
    <PanelGroup direction="horizontal" className="h-full w-full font-exam text-exam-text">
      <Panel defaultSize={50} minSize={30} className="bg-white">
        <ScrollArea className="h-full">
          <div className="p-5">{leftPanel}</div>
        </ScrollArea>
      </Panel>
      <PanelResizeHandle 
        className={cn(
            "flex w-[7px] items-center justify-center bg-background transition-colors hover:bg-muted",
            "focus-visible:bg-primary focus-visible:outline-none"
        )}
      >
        <div className="flex h-8 w-6 items-center justify-center rounded-sm border bg-white shadow-sm">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </PanelResizeHandle>
      <Panel defaultSize={50} minSize={30} className="relative bg-[#fafafa]">
         {rightPanel}
      </Panel>
    </PanelGroup>
  );
}
