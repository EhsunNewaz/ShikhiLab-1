import { BookMarked, Mic, PenSquare, Ear, BookOpen } from 'lucide-react';

export type Lesson = {
  id: string;
  title: string;
  titleEnglish: string;
  titleBangla: string;
  description: string;
  isCompleted: boolean; // For tracking progress
  href: string;
  videoUrl?: string;
  transcriptBangla?: string;
  transcriptEnglish?: string;
  quizId?: string;
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
      { id: 'intro-1', title: 'What is IELTS?', titleEnglish: 'What is IELTS?', titleBangla: 'IELTS কী?', description: 'An overview of the test.', isCompleted: true, href: '/lessons/intro-1', transcriptBangla: 'IELTS (International English Language Testing System) আপনার ইংরেজি ভাষার দক্ষতা পরীক্ষা করার জন্য ডিজাইন করা হয়েছে।', transcriptEnglish: 'The IELTS (International English Language Testing System) is designed to test your English language proficiency.' },
      { id: 'intro-2', title: 'Understanding Band Scores', titleEnglish: 'Understanding Band Scores', titleBangla: 'ব্যান্ড স্কোর বোঝা', description: 'Learn how your test is graded.', isCompleted: false, href: '/lessons/intro-2', transcriptBangla: 'ব্যান্ড স্কোর ১ থেকে ৯ পর্যন্ত হয়। প্রতিটি সেকশনের জন্য আলাদা স্কোর এবং একটি সামগ্রিক স্কোর দেওয়া হয়।', transcriptEnglish: 'Band scores range from 1 to 9. You get a score for each section and an overall score.' },
    ],
  },
  {
    id: 'writing',
    title: 'Writing',
    description: 'Master both Task 1 and Task 2 with structured lessons and AI feedback.',
    icon: PenSquare,
    lessons: [
      { id: 'writing-1', title: 'Intro to Writing Task 1', titleEnglish: 'Introduction to Writing Task 1 (Academic)', titleBangla: 'রাইটিং টাস্ক ১ পরিচিতি (একাডেমিক)', description: 'Analyzing charts and graphs.', isCompleted: false, href: '/lessons/writing-1', videoUrl: 'https://www.youtube.com/embed/iA1IbbSQb_4', quizId: 'writing-1-quiz', transcriptBangla: 'রাইটিং টাস্ক ১-এ আপনাকে একটি গ্রাফ, চার্ট বা ডায়াগ্রাম বর্ণনা করতে বলা হবে। আপনাকে কমপক্ষে ১৫০ শব্দ লিখতে হবে।', transcriptEnglish: 'In Writing Task 1, you will be asked to describe a graph, chart, or diagram. You must write at least 150 words.' },
      { id: 'writing-2', title: 'Intro to Writing Task 2', titleEnglish: 'Introduction to Writing Task 2', titleBangla: 'রাইটিং টাস্ক ২ পরিচিতি', description: 'Structuring your essay.', isCompleted: false, href: '/lessons/writing-2', transcriptBangla: 'রাইটিং টাস্ক ২-এ আপনাকে একটি বিষয়ে প্রবন্ধ লিখতে হবে। আপনাকে কমপক্ষে ২৫০ শব্দ লিখতে হবে।', transcriptEnglish: 'In Writing Task 2, you will have to write an essay on a topic. You must write at least 250 words.' },
      { id: 'writing-3', title: 'Advanced Essay Techniques', titleEnglish: 'Advanced Essay Techniques', titleBangla: 'উন্নত প্রবন্ধ কৌশল', description: 'Complex sentences and vocabulary.', isCompleted: false, href: '/lessons/writing-3' },
    ],
  },
    {
    id: 'speaking',
    title: 'Speaking',
    description: 'Build confidence and fluency for all three parts of the speaking test.',
    icon: Mic,
    lessons: [
      { id: 'speaking-1', title: 'Part 1: Common Topics', titleEnglish: 'Part 1: Common Topics', titleBangla: 'পার্ট ১: সাধারণ বিষয়', description: 'Practice answering personal questions.', isCompleted: false, href: '/lessons/speaking-1' },
      { id: 'speaking-2', title: 'Part 2: The Long Turn', titleEnglish: 'Part 2: The Long Turn', titleBangla: 'পার্ট ২: দ্য লং টার্ন', description: 'Structure your 2-minute talk.', isCompleted: false, href: '/lessons/speaking-2' },
    ],
  },
  {
    id: 'listening',
    title: 'Listening',
    description: 'Sharpen your listening skills with practice tests and strategies.',
    icon: Ear,
    lessons: [
      { id: 'listening-1', title: 'Strategies for Section 1', titleEnglish: 'Strategies for Section 1', titleBangla: 'সেকশন ১ এর কৌশল', description: 'Listening for specific information.', isCompleted: false, href: '/lessons/listening-1' },
      { id: 'listening-2', title: 'Understanding Different Accents', titleEnglish: 'Understanding Different Accents', titleBangla: 'বিভিন্ন উচ্চারণ বোঝা', description: 'Exposure to UK, US, and Australian accents.', isCompleted: false, href: '/lessons/listening-2' },
    ],
  },
    {
    id: 'reading',
    title: 'Reading',
    description: 'Develop techniques for skimming, scanning, and understanding complex texts.',
    icon: BookOpen,
    lessons: [
      { id: 'reading-1', title: 'Skimming vs. Scanning', titleEnglish: 'Skimming vs. Scanning', titleBangla: 'স্কিমিং বনাম স্ক্যানিং', description: 'Learn the difference and when to use each.', isCompleted: false, href: '/lessons/reading-1' },
      { id: 'reading-2', title: 'Matching Headings Questions', titleEnglish: 'Matching Headings Questions', titleBangla: 'শিরোনাম মেলানো প্রশ্ন', description: 'A common and tricky question type.', isCompleted: false, href: '/lessons/reading-2' },
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
