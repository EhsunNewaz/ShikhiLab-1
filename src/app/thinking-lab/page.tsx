import ThinkingLabClient from '@/components/practice/thinking-lab-client';

export default function ThinkingLabPage() {
  return (
    <div className="container mx-auto py-6 sm:py-10">
        <div className="space-y-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">Thinking Lab</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                Master abstract thinking for IELTS Speaking Part 3. Practice structuring your arguments before you worry about the English.
            </p>
        </div>
      
      <div className="max-w-4xl mx-auto mt-8">
        <ThinkingLabClient />
      </div>
    </div>
  );
}
