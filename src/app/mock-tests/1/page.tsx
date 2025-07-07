
import { ExamShell } from '@/components/exam/exam-shell';

export default function MockTestPage() {
  return (
    <ExamShell>
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">IELTS Mock Test - Section 1</h1>
        <p>This is the main content area where the test passage and questions will be rendered.</p>
        <div className="mt-6 space-y-4">
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
            <div className="h-24 w-3/4 animate-pulse rounded-lg bg-gray-100"></div>
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
        </div>
      </div>
    </ExamShell>
  );
}
