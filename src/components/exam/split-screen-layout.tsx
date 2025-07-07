
import type { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SplitScreenLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function SplitScreenLayout({ leftPanel, rightPanel }: SplitScreenLayoutProps) {
  return (
    <div className="flex h-full w-full flex-col font-exam md:flex-row">
      {/* Left Panel (Text) */}
      <div className="h-1/2 w-full border-b-2 border-exam-border bg-white md:h-full md:w-1/2 md:min-w-[400px] md:border-b-0 md:border-r-2">
        <ScrollArea className="h-full">
          <div className="p-5">{leftPanel}</div>
        </ScrollArea>
      </div>
      
      {/* Right Panel (Questions) */}
      <div className="h-1/2 w-full bg-[#fafafa] md:h-full md:w-1/2 md:min-w-[400px]">
         <ScrollArea className="h-full">
            <div className="p-5">{rightPanel}</div>
         </ScrollArea>
      </div>
    </div>
  );
}
