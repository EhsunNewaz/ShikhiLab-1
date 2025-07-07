import { BookMarked, Mic, PenSquare, Ear, BookOpen } from 'lucide-react';

export type Lesson = {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean; // For tracking progress
  href: string;
};

export type Module = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  lessons: Lesson[];
};

export const courseData: Module[] = [
  {
    id: 'intro',
    title: 'Introduction',
    description: 'Start your journey by understanding the test format and scoring.',
    icon: BookMarked,
    lessons: [
      { id: 'intro-1', title: 'What is IELTS?', description: 'An overview of the test.', isCompleted: true, href: '#' },
      { id: 'intro-2', title: 'Understanding Band Scores', description: 'Learn how your test is graded.', isCompleted: false, href: '#' },
    ],
  },
  {
    id: 'writing',
    title: 'Writing',
    description: 'Master both Task 1 and Task 2 with structured lessons and AI feedback.',
    icon: PenSquare,
    lessons: [
      { id: 'writing-1', title: 'Intro to Writing Task 1 (Academic)', description: 'Analyzing charts and graphs.', isCompleted: false, href: '/writing' },
      { id: 'writing-2', title: 'Intro to Writing Task 2', description: 'Structuring your essay.', isCompleted: false, href: '/writing' },
      { id: 'writing-3', title: 'Advanced Essay Techniques', description: 'Complex sentences and vocabulary.', isCompleted: false, href: '/writing' },
    ],
  },
    {
    id: 'speaking',
    title: 'Speaking',
    description: 'Build confidence and fluency for all three parts of the speaking test.',
    icon: Mic,
    lessons: [
      { id: 'speaking-1', title: 'Part 1: Common Topics', description: 'Practice answering personal questions.', isCompleted: false, href: '#' },
      { id: 'speaking-2', title: 'Part 2: The Long Turn', description: 'Structure your 2-minute talk.', isCompleted: false, href: '#' },
    ],
  },
  {
    id: 'listening',
    title: 'Listening',
    description: 'Sharpen your listening skills with practice tests and strategies.',
    icon: Ear,
    lessons: [
      { id: 'listening-1', title: 'Strategies for Section 1', description: 'Listening for specific information.', isCompleted: false, href: '#' },
      { id: 'listening-2', title: 'Understanding Different Accents', description: 'Exposure to UK, US, and Australian accents.', isCompleted: false, href: '#' },
    ],
  },
    {
    id: 'reading',
    title: 'Reading',
    description: 'Develop techniques for skimming, scanning, and understanding complex texts.',
    icon: BookOpen,
    lessons: [
      { id: 'reading-1', title: 'Skimming vs. Scanning', description: 'Learn the difference and when to use each.', isCompleted: false, href: '#' },
      { id: 'reading-2', title: 'Matching Headings Questions', description: 'A common and tricky question type.', isCompleted: false, href: '#' },
    ],
  },
];

export const getNextLesson = () => {
    for (const module of courseData) {
        for (const lesson of module.lessons) {
            if (!lesson.isCompleted) {
                return lesson;
            }
        }
    }
    return null;
}
