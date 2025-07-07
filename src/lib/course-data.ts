
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
  passage: number; // Which passage (1, 2, or 3) this question belongs to
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
  passages: string[];
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

export type ActiveListeningExercise = {
    id: string;
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
        activeListeningExercises: [
            { id: 'al-1', title: 'Simple Statement', audioUrl: '/audio/placeholder-al-1.mp3', transcript: 'The train to London leaves from platform four.' },
            { id: 'al-2', title: 'Question', audioUrl: '/audio/placeholder-al-2.mp3', transcript: 'Could you please tell me where the nearest post office is?' },
            { id: 'al-3', title: 'Complex Sentence', audioUrl: '/audio/placeholder-al-3.mp3', transcript: 'Despite the heavy traffic, we managed to arrive at the airport with plenty of time to spare.' }
        ] as ActiveListeningExercise[],
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

const generateQuestions = (passage: number, startId: number, count: number, type: 'multiple-choice' | 'fill-in-the-blank' = 'multiple-choice'): ReadingQuestion[] => {
    return Array.from({ length: count }, (_, i) => {
        const id = startId + i;
        if (type === 'fill-in-the-blank') {
            return {
                id: `${id}`,
                passage,
                type: 'fill-in-the-blank',
                instruction: 'Complete the sentence using ONE WORD from the passage.',
                questionText: `This is a sample ___ for question ${id}.`,
                options: [],
                correctAnswer: 'answer',
                explanation: `The correct answer is 'answer' because the text provides this information for question ${id}.`
            }
        }
        return {
            id: `${id}`,
            passage,
            type: 'multiple-choice',
            instruction: 'Choose the correct letter, A, B, C, or D.',
            questionText: `What is the main point of the paragraph related to question ${id}?`,
            options: [`Option A for ${id}`, `Option B for ${id}`, `Option C for ${id}`, `Option D for ${id}`],
            correctAnswer: `Option B for ${id}`,
            explanation: `The passage explicitly states the information corresponding to Option B for question ${id}.`
        };
    });
};

export const readingTestData: ReadingTest[] = [
  {
    id: 'full-mock-test-1',
    title: 'IELTS Academic Reading Test 1',
    passages: [
        `Passage 1: The Revolution in Communication.
The late 20th century witnessed a revolution in communication technologies that has reshaped human interaction on a global scale. The advent of the internet, followed by the proliferation of mobile devices, has created an ecosystem of constant connectivity. Before this digital era, long-distance communication was primarily reliant on postal services and telephones, which were slower and less immediate. The internet dismantled these barriers, enabling real-time conversations across continents through email, instant messaging, and later, video calls. This shift has had profound effects on social structures, economies, and personal relationships.
Socially, the internet has fostered the growth of virtual communities, connecting individuals with shared interests regardless of their geographical location. Economically, e-commerce has flourished, allowing businesses to reach a global customer base without the need for physical storefronts in every region. Personal relationships have also been transformed; families and friends can maintain close contact despite living thousands of miles apart. However, this hyper-connectivity is not without its drawbacks. Concerns about privacy, the spread of misinformation, and the impact of social media on mental health are significant challenges that society must navigate in this new digital landscape. The very definition of 'community' and 'friendship' is being redefined by these powerful tools.`,
        
        `Passage 2: The Science of Urban Planning.
Urban planning is a technical and political process concerned with the development and design of land use and the built environment. It involves forecasting population growth, planning for infrastructure like transportation and utilities, and zoning areas for different types of development such as residential, commercial, and industrial. The primary goal of urban planning is to create functional, sustainable, and aesthetically pleasing communities for people to live, work, and play in.
One of the key challenges in modern urban planning is sustainability. As cities continue to grow, they consume vast amounts of resources and generate significant pollution. Planners are increasingly focused on creating 'green cities' that incorporate renewable energy sources, efficient public transportation systems, and ample green spaces like parks and gardens. Mixed-use development, where residential, commercial, and recreational spaces are integrated, is another popular strategy. This approach reduces the need for long commutes, thereby decreasing traffic congestion and carbon emissions. Furthermore, preserving historical architecture and cultural heritage while accommodating new growth is a delicate balancing act that requires careful consideration and community involvement. Effective urban planning is crucial for managing the complexities of urban life and ensuring a high quality of life for all residents.`,

        `Passage 3: The Enigma of Honeybee Navigation.
Honeybees possess a remarkable ability to navigate the landscape, find flowers, and return to their hive with astonishing precision. This sophisticated navigational skill is crucial for their survival and the pollination of countless plant species. For decades, scientists have been captivated by the question of how these tiny insects achieve such feats. The pioneering research of Karl von Frisch in the mid-20th century revealed one of the primary mechanisms: the 'waggle dance'. This is a form of symbolic communication where a returning forager bee performs a specific pattern of movements to inform its hive-mates of the direction and distance to a food source. The angle of the dance relative to the vertical axis of the honeycomb indicates the direction of the food source in relation to the sun, while the duration of the 'waggling' part of the dance signifies the distance.
Beyond the waggle dance, bees also rely on a combination of other cues. They have an internal 'sun compass' that allows them to track the sun's position in the sky, even on cloudy days, by detecting patterns of polarized light. They also create and memorize mental maps of their surroundings, using landmarks like trees, rivers, and buildings to orient themselves. This cognitive mapping ability suggests a level of spatial awareness previously thought to be exclusive to larger-brained animals. Recent studies even indicate that bees might be sensitive to the Earth's magnetic field, using it as an additional navigational aid. The honeybee's brain, though no bigger than a sesame seed, integrates these multiple streams of information to create a robust and flexible navigation system.`
    ],
    questions: [
        // Passage 1: Questions 1-13
        ...generateQuestions(1, 1, 5),
        ...generateQuestions(1, 6, 8, 'fill-in-the-blank'),
        // Passage 2: Questions 14-26
        ...generateQuestions(2, 14, 7),
        ...generateQuestions(2, 21, 6, 'fill-in-the-blank'),
        // Passage 3: Questions 27-40
        ...generateQuestions(3, 27, 5),
        ...generateQuestions(3, 32, 9, 'fill-in-the-blank'),
    ],
  },
];


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
        href: '/mock-tests/1' // Note: For demo, points to the same test
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
