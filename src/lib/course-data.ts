
import { BookMarked, Mic, PenSquare, Ear, BookOpen, BookCheck, Repeat, ClipboardCheck } from 'lucide-react';

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
  readingTestId?: string;
};

export type Module = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  lessons: Lesson[];
};

export type ReadingQuestion = {
  id: string;
  type: 'fill-in-the-blank' | 'multiple-choice' | 'multiple-answer';
  instruction: string; // "Complete the sentences below.", "Choose the correct letter, A, B, or C."
  questionText: string; // For fill-in-the-blank, use '___' as placeholder
  options: string[];
  correctAnswer: any; // Can be string or string[]
  explanation: string;
};

export type ReadingTest = {
  id: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
};

export type MockTest = {
  id: string;
  title: string;
  description: string;
  href: string;
};


export type GrammarLesson = {
    id: string;
    title: string;
    description: string;
    href: string;
}

export type PhonicsDrill = {
    pair: string;
    audio1Url: string;
    audio2Url: string;
}

export type ShadowingExercise = {
    title: string;
    audioUrl: string;
    transcript: string;
}

export const foundationSkills = {
    grammar: {
        title: "Grammar Foundation",
        description: "Build a strong base with these essential grammar micro-lessons.",
        icon: BookCheck,
        href: "/foundation-skills/grammar",
        lessons: [
            { id: 'grammar-1', title: 'Tense (কাল)', description: 'Master the use of past, present, and future tenses.', href: '/lessons/grammar-1' },
            { id: 'grammar-2', title: 'Articles (a, an, the)', description: 'Learn when to use definite and indefinite articles.', href: '/lessons/grammar-2' },
            { id: 'grammar-3', title: 'Prepositions ( حروف সংযোজন )', description: 'Understand how to use in, on, at, for, since correctly.', href: '/lessons/grammar-3' },
            { id: 'grammar-4', title: 'Subject-Verb Agreement', description: 'Ensure your subjects and verbs match perfectly.', href: '/lessons/grammar-4' },
        ] as GrammarLesson[]
    },
    listeningLab: {
        title: "Listening & Pronunciation Lab",
        description: "Sharpen your listening and speaking clarity with focused drills.",
        icon: Ear,
        href: "/foundation-skills/listening-lab",
        phonicsDrills: [
            { pair: 'Ship / Sheep', audio1Url: '/audio/placeholder-ship.mp3', audio2Url: '/audio/placeholder-sheep.mp3' },
            { pair: 'Live / Leave', audio1Url: '/audio/placeholder-live.mp3', audio2Url: '/audio/placeholder-leave.mp3' },
            { pair: 'Pen / Pan', audio1Url: '/audio/placeholder-pen.mp3', audio2Url: '/audio/placeholder-pan.mp3' },
        ] as PhonicsDrill[],
    },
    fluency: {
        title: "English Thinking & Fluency",
        description: "Train your brain to think in English and speak more naturally.",
        icon: Repeat,
        href: "/foundation-skills/fluency",
        shadowingExercises: [
            {
                title: "Daily Habits",
                audioUrl: "/audio/placeholder-shadowing-1.mp3",
                transcript: "Every morning, I wake up at 7 AM. The first thing I do is drink a glass of water. Then, I spend about fifteen minutes stretching and doing some light exercise. It helps me wake up properly. After that, I take a shower and get dressed for the day. Breakfast is usually simple – just some toast and a cup of tea. I like to read the news on my phone while I eat. Before leaving the house, I always make sure I have my keys, wallet, and phone. My commute to work takes about thirty minutes by bus. During the ride, I often listen to a podcast or some music. It’s a nice way to relax before starting a busy day at the office."
            },
            {
                title: "Ordering Food at a Restaurant",
                audioUrl: "/audio/placeholder-shadowing-2.mp3",
                transcript: "Waiter: Hello, welcome! Here are your menus. Can I get you something to drink to start with?\nYou: Yes, I'll have a glass of lemonade, please.\nWaiter: Certainly. Are you ready to order your meal, or do you need a few more minutes?\nYou: I think I'm ready. I'd like to have the grilled chicken salad, please.\nWaiter: Excellent choice. And for you, sir?\nYour Friend: I'll have the vegetable pasta.\nWaiter: Great. So that's one lemonade, one grilled chicken salad, and one vegetable pasta. I'll be right back with your drinks."
            }
        ] as ShadowingExercise[]
    }
}


export const readingTestData: ReadingTest[] = [
  {
    id: 'history-of-tea',
    title: 'The History of Tea',
    passage: `The history of tea is long and complex, spreading across multiple cultures over the span of thousands of years. Tea likely originated in the Yunnan region during the Shang dynasty as a medicinal drink. The first recorded drinking of tea is in China, with the earliest records of tea consumption dating to the 10th century BC. It was not until the Tang dynasty that tea became a popular recreational drink, and it was during this time that the tea plant was first cultivated.

From China, tea spread to Korea and Japan. It was introduced to Japan by Buddhist monks who had traveled to China to study. Tea became a central part of Japanese culture, leading to the development of the Japanese tea ceremony.

Tea was introduced to Europe by Portuguese priests and merchants during the 16th century. It became popular in Britain during the 17th century, where the British introduced tea production, as well as tea consumption, to India, in order to compete with the Chinese monopoly on tea. The British appetite for tea was a catalyst for the Opium Wars with China in the 19th century.`,
    questions: [
      {
        id: '1',
        type: 'fill-in-the-blank',
        instruction: 'Complete the sentence below. Write ONE WORD ONLY from the passage.',
        questionText: 'Tea became a widespread recreational beverage during the ___ dynasty.',
        options: [],
        correctAnswer: 'Tang',
        explanation: 'The passage states, "...it was not until the Tang dynasty that tea became a popular recreational drink..."',
      },
      {
        id: '2',
        type: 'multiple-choice',
        instruction: 'Choose the correct letter, A, B, or C.',
        questionText: 'According to the text, who first brought tea to Japan?',
        options: ['Portuguese merchants', 'British traders', 'Buddhist monks'],
        correctAnswer: 'Buddhist monks',
        explanation: 'The text says, tea "was introduced to Japan by Buddhist monks who had traveled to China to study."',
      },
      {
        id: '3',
        type: 'multiple-answer',
        instruction: 'Which TWO of the following statements are true according to the passage?',
        questionText: 'Select two correct options.',
        options: [
            'Tea originated in India.', 
            'The British started tea production to rival China.',
            'Tea was initially used as medicine.',
            'The Japanese tea ceremony was developed in China.'
        ],
        correctAnswer: ['The British started tea production to rival China.', 'Tea was initially used as medicine.'],
        explanation: 'The passage confirms tea was a "medicinal drink" and that the British introduced production in India "in order to compete with the Chinese monopoly on tea."',
      },
      // Adding a few more to reach a decent number for demo purposes
      {
        id: '4',
        type: 'multiple-choice',
        instruction: 'Choose the correct letter, A, B, or C.',
        questionText: 'When did tea become popular in Britain?',
        options: ['16th Century', '17th Century', '19th Century'],
        correctAnswer: '17th Century',
        explanation: 'The passage mentions tea "became popular in Britain during the 17th century..."',
      },
      {
        id: '5',
        type: 'fill-in-the-blank',
        instruction: 'Complete the sentence below. Write ONE WORD ONLY from the passage.',
        questionText: 'The British desire for tea was a factor in the ___ Wars.',
        options: [],
        correctAnswer: 'Opium',
        explanation: 'The text states, "The British appetite for tea was a catalyst for the Opium Wars with China..."',
      },
    ],
  },
];

// Re-creating the mock tests to have enough questions for the footer to be meaningful
const fullTestQuestions: ReadingQuestion[] = Array.from({ length: 40 }, (_, i) => {
    const questionNumber = i + 1;
    const baseQuestion = readingTestData[0].questions[i % readingTestData[0].questions.length];
    return {
        ...baseQuestion,
        id: `${questionNumber}`,
        questionText: `(Q${questionNumber}) ` + baseQuestion.questionText
    }
});

readingTestData.push({
    id: 'full-mock-test-1',
    title: 'Full Reading Mock Test',
    passage: readingTestData[0].passage, // reuse passage for simplicity
    questions: fullTestQuestions
});


export const mockTests: MockTest[] = [
    {
        id: 'mock-1',
        title: 'IELTS Academic Mock Test 1',
        description: 'A full-length mock test simulating the academic IELTS format. Covers all four modules.',
        href: '/mock-tests/1'
    },
    {
        id: 'mock-2',
        title: 'IELTS General Training Mock Test 1',
        description: 'A full-length mock test for the General Training IELTS format. Covers all four modules.',
        href: '/mock-tests/1'
    }
];

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
      { id: 'speaking-1', title: 'Part 1: Common Topics', titleEnglish: 'Part 1: Common Topics', titleBangla: 'পার্ট ১: সাধারণ বিষয়', description: 'Practice answering personal questions.', isCompleted: false, href: '/speaking' },
      { id: 'speaking-2', title: 'Part 2: The Long Turn', titleEnglish: 'Part 2: The Long Turn', titleBangla: 'পার্ট ২: দ্য লং টার্ন', description: 'Structure your 2-minute talk.', isCompleted: false, href: '/speaking' },
    ],
  },
  {
    id: 'listening',
    title: 'Listening',
    description: 'Sharpen your listening skills with practice tests and strategies.',
    icon: Ear,
    lessons: [
      { id: 'listening-1', title: 'Strategies for Section 1', titleEnglish: 'Strategies for Section 1', titleBangla: 'সেকশন ১ এর কৌশল', description: 'Listening for specific information.', isCompleted: false, href: '/listening' },
      { id: 'listening-2', title: 'Understanding Different Accents', titleEnglish: 'Understanding Different Accents', titleBangla: 'বিভিন্ন উচ্চারণ বোঝা', description: 'Exposure to UK, US, and Australian accents.', isCompleted: false, href: '/listening' },
    ],
  },
    {
    id: 'reading',
    title: 'Reading',
    description: 'Develop techniques for skimming, scanning, and understanding complex texts.',
    icon: BookOpen,
    lessons: [
      { id: 'reading-1', title: 'Practice Test: The History of Tea', titleEnglish: 'Practice Test: The History of Tea', titleBangla: 'অনুশীলনী পরীক্ষা: চায়ের ইতিহাস', description: 'Learn the difference and when to use each.', isCompleted: false, href: '/reading/practice/history-of-tea', readingTestId: 'history-of-tea' },
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
