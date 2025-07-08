
import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SplitScreenLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function SplitScreenLayout({ leftPanel, rightPanel }: SplitScreenLayoutProps) {
  return (
    <div className="flex h-full w-full flex-col font-exam lg:flex-row">
      {/* Left Panel (Text) */}
      <div className="h-1/2 w-full border-b-2 border-exam-border bg-white lg:h-full lg:w-1/2 lg:min-w-[400px] lg:border-b-0 lg:border-r-2">
        <ScrollArea className="h-full">
          <div className="p-5">{leftPanel}</div>
        </ScrollArea>
      </div>
      
      {/* Right Panel (Questions) */}
      <div className="relative h-1/2 w-full bg-[#fafafa] lg:h-full lg:w-1/2 lg:min-w-[400px]">
         {rightPanel}
      </div>
    </div>
  );
}
