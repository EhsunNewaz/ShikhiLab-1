
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ isOpen, onOpenChange }: HelpDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Help Information</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-left space-y-2">
              <p><strong>Timer:</strong> Shows the remaining time. It will turn red and flash when time is low.</p>
              <p><strong>Settings:</strong> Adjust text size and color contrast for better readability.</p>
              <p><strong>Highlighting:</strong> Select text in the passage and right-click to highlight it. Right-click a highlight to remove it.</p>
              <p><strong>Contextual Notes:</strong> Right-click selected text and choose "Notes" to add a note in a pop-up. Highlights with notes will have an orange dot.</p>
              <p><strong>Notes Panel:</strong> Click the Notes icon in the header to open a panel with all your notes. You can search your notes, and clicking a note will scroll the passage to its context.</p>
              <p><strong>Hide:</strong> Click the Hide button to temporarily hide the test content.</p>
              <p><strong>Review:</strong> Mark a question for review using the 'Review' button in the footer. Reviewed questions will appear as circles in the navigation.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
