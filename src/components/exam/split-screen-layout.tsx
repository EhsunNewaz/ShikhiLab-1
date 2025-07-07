
import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SplitScreenLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function SplitScreenLayout({ leftPanel, rightPanel }: SplitScreenLayoutProps) {
  return (
    <div className="flex h-full w-full font-exam">
      {/* Left Panel (Text) */}
      <div className="h-full w-1/2 min-w-[400px] border-r-2 border-exam-border bg-white">
        <ScrollArea className="h-full">
          <div className="p-5">{leftPanel}</div>
        </ScrollArea>
      </div>
      
      {/* Right Panel (Questions) */}
      <div className="h-full w-1/2 min-w-[400px] bg-[#fafafa]">
         <ScrollArea className="h-full">
            <div className="p-5">{rightPanel}</div>
         </ScrollArea>
      </div>
    </div>
  );
}
