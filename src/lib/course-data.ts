
import { BookMarked, Mic, PenSquare, Ear, BookOpen, BookCheck, Repeat, ClipboardCheck, Lightbulb, Microscope } from 'lucide-react';

export type SubQuestion = {
    id: string;
    text: string;
    preText?: string;
    postText?: string;
}

export type ReadingQuestion = {
  id: string; // For single questions, this is the number. For grouped questions, it's a range like "1-4".
  passage: number;
  type: 'fill-in-the-blank' | 'multiple-choice' | 'multiple-answer' | 'true-false-not-given' | 'yes-no-not-given' | 'matching-headings';
  instruction: string;
  // For single questions
  questionText?: string; 
  options?: string[];
  requiredAnswers?: number; // For multiple-answer
  // For matching/grouped questions
  matchingOptions?: string[]; // The list of headings/options to match from
  subQuestions?: SubQuestion[]; // The list of statements/gaps to handle
  // For all questions
  correctAnswer: any; // string for single, Record<string, string> for grouped
  explanation: string;
};


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

export type FluencyExercise = {
    id: string;
    title: string;
    segments: {
        id: string;
        text: string;
    }[];
}

export type ActiveListeningExercise = {
    id:string;
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
        title: "Listening Lab",
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
     speakingLab: {
        title: "Speaking Lab",
        description: "Practice all parts of the speaking test with AI feedback.",
        icon: Mic,
        href: "/foundation-skills/speaking-lab",
    },
    fluency: {
        title: "English Thinking & Fluency",
        description: "Train your brain to think in English and speak more naturally.",
        icon: Repeat,
        href: "/foundation-skills/fluency",
        fluencyExercises: [
            {
                id: 'fluency-1',
                title: 'Daily Habits',
                segments: [
                    { id: 'fs-1-1', text: "Every morning, I wake up at 7 AM." },
                    { id: 'fs-1-2', text: "The first thing I do is drink a glass of water." },
                    { id: 'fs-1-3', text: "Then, I spend about fifteen minutes stretching and doing some light exercise." },
                    { id: 'fs-1-4', text: "It helps me wake up properly." },
                    { id: 'fs-1-5', text: "After that, I take a shower and get dressed for the day." },
                ],
            },
            {
                id: 'fluency-2',
                title: 'Ordering Food',
                segments: [
                    { id: 'fs-2-1', text: "Hello, welcome! Here are your menus." },
                    { id: 'fs-2-2', text: "Can I get you something to drink to start with?" },
                    { id: 'fs-2-3', text: "Yes, I'll have a glass of lemonade, please." },
                    { id: 'fs-2-4', text: "Are you ready to order your meal, or do you need a few more minutes?" },
                    { id: 'fs-2-5', text: "I think I'm ready. I'd like to have the grilled chicken salad, please." },
                ]
            }
        ] as FluencyExercise[]
    },
    thinkingLab: {
        title: "Thinking Lab",
        description: "Master abstract thinking for IELTS Speaking Part 3.",
        icon: Lightbulb,
        href: "/foundation-skills/thinking-lab",
        lessons: []
    },
    pronunciationLab: {
        title: "Pronunciation Lab",
        description: "Get detailed feedback on rhythm, linking, and sounds.",
        icon: Microscope,
        href: "/foundation-skills/pronunciation-lab",
        lessons: []
    },
}


export const readingTestData: ReadingTest[] = [
  {
    id: 'full-mock-test-1',
    title: 'IELTS Academic Reading Test 1',
    passages: [
        `Passage 1: Marie Curie was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person and only woman to win the Nobel Prize twice, and the only person to win the Nobel Prize in two different scientific fields. Her husband, Pierre Curie, was a co-winner of her first Nobel Prize, making them the first-ever married couple to win the Nobel Prize. She was a co-winner on her second Nobel prize as well. Marie Curie's achievements included the development of the theory of radioactivity, techniques for isolating radioactive isotopes, and the discovery of two elements, polonium and radium. Under her direction, the world's first studies were conducted into the treatment of neoplasms, using radioactive isotopes. She founded the Curie Institutes in Paris and in Warsaw, which remain major centres of medical research today.`,
        
        `Passage 2: The Science of Urban Planning.
A) Urban planning is a technical and political process concerned with the development and design of land use and the built environment. It involves forecasting population growth, planning for infrastructure like transportation and utilities, and zoning areas for different types of development such as residential, commercial, and industrial. The primary goal of urban planning is to create functional, sustainable, and aesthetically pleasing communities for people to live, work, and play in.
B) One of the key challenges in modern urban planning is sustainability. As cities continue to grow, they consume vast amounts of resources and generate significant pollution. Planners are increasingly focused on creating 'green cities' that incorporate renewable energy sources, efficient public transportation systems, and ample green spaces like parks and gardens. This approach aims to minimize the environmental impact of urban areas and improve the well-being of their inhabitants.
C) Mixed-use development, where residential, commercial, and recreational spaces are integrated, is another popular strategy. This approach reduces the need for long commutes, thereby decreasing traffic congestion and carbon emissions. It fosters a sense of community by making neighborhoods more walkable and vibrant. By bringing daily necessities closer to home, it encourages a lifestyle that is less dependent on automobiles.
D) Furthermore, preserving historical architecture and cultural heritage while accommodating new growth is a delicate balancing act that requires careful consideration and community involvement. Public consultations and stakeholder engagement are crucial to ensure that development projects reflect the values and needs of the residents. Effective urban planning is essential for managing the complexities of urban life and ensuring a high quality of life for all citizens.`,

        `Passage 3: The Enigma of Honeybee Navigation.
Honeybees possess a remarkable ability to navigate the landscape, find flowers, and return to their hive with astonishing precision. This sophisticated navigational skill is crucial for their survival and the pollination of countless plant species. For decades, scientists have been captivated by the question of how these tiny insects achieve such feats. The pioneering research of Karl von Frisch in the mid-20th century revealed one of the primary mechanisms: the 'waggle dance'. This is a form of symbolic communication where a returning forager bee performs a specific pattern of movements to inform its hive-mates of the direction and distance to a food source. The angle of the dance relative to the vertical axis of the honeycomb indicates the direction of the food source in relation to the sun, while the duration of the 'waggling' part of the dance signifies the distance.
Beyond the waggle dance, bees also rely on a combination of other cues. They have an internal 'sun compass' that allows them to track the sun's position in the sky, even on cloudy days, by detecting patterns of polarized light. They also create and memorize mental maps of their surroundings, using landmarks like trees, rivers, and buildings to orient themselves. This cognitive mapping ability suggests a level of spatial awareness previously thought to be exclusive to larger-brained animals. Recent studies even indicate that bees might be sensitive to the Earth's magnetic field, using it as an additional navigational aid. The honeybee's brain, though no bigger than a sesame seed, integrates these multiple streams of information to create a robust and flexible navigation system.`
    ],
    questions: [
        // Passage 1: Questions 1-5
        {
            id: '1-3',
            passage: 1,
            type: 'true-false-not-given',
            instruction: 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.',
            subQuestions: [
                { id: '1', text: "Marie Curie's husband was a joint winner of both Marie's Nobel Prizes." },
                { id: '2', text: 'Marie became interested in science when she was a child.' },
                { id: '3', text: 'Marie was able to attend the Sorbonne because of her sister’s financial contribution.' },
            ],
            options: ['TRUE', 'FALSE', 'NOT GIVEN'],
            correctAnswer: {
                '1': 'FALSE',
                '2': 'NOT GIVEN',
                '3': 'NOT GIVEN',
            },
            explanation: "1: The passage says Pierre was a co-winner of her *first* Nobel Prize, not both. 2 &amp; 3: The passage does not mention her childhood interest or her sister's contribution."
        },
        {
            id: '4',
            passage: 1,
            type: 'multiple-choice',
            instruction: 'Choose the correct letter, A, B, C or D.',
            questionText: 'What was a key achievement of Marie Curie mentioned in the passage?',
            options: [
                'Inventing the telephone',
                'Developing the theory of radioactivity',
                'Discovering the law of gravity',
                'Founding the first university for women'
            ],
            correctAnswer: 'Developing the theory of radioactivity',
            explanation: 'The passage explicitly states "Marie Curie\'s achievements included the development of the theory of radioactivity..."'
        },
        {
            id: '5',
            passage: 1,
            type: 'multiple-answer',
            instruction: 'Choose TWO letters, A-E.',
            questionText: 'Which TWO of the following did Marie Curie discover?',
            options: ['X-rays', 'Polonium', 'Neutrons', 'Radium', 'Electrons'],
            correctAnswer: ['Polonium', 'Radium'],
            requiredAnswers: 2,
            explanation: 'The passage mentions "...and the discovery of two elements, polonium and radium."'
        },

        // Passage 2: Questions 6-12
        {
            id: '6-9',
            passage: 2,
            type: 'matching-headings',
            instruction: 'Reading Passage 2 has four paragraphs, A-D. Choose the correct heading for each paragraph from the list of headings below.',
            matchingOptions: [
                'i. The benefits of integrating different city functions',
                'ii. The need for resident participation',
                'iii. The definition and purpose of urban planning',
                'iv. The importance of historical context',
                'v. A focus on environmental sustainability',
            ],
            subQuestions: [
                { id: '6', text: 'Paragraph A' },
                { id: '7', text: 'Paragraph B' },
                { id: '8', text: 'Paragraph C' },
                { id: '9', text: 'Paragraph D' },
            ],
            correctAnswer: {
                '6': 'iii. The definition and purpose of urban planning',
                '7': 'v. A focus on environmental sustainability',
                '8': 'i. The benefits of integrating different city functions',
                '9': 'ii. The need for resident participation'
            },
            explanation: 'Each heading correctly summarizes the main idea of the corresponding paragraph.'
        },
        {
            id: '10-12',
            passage: 2,
            type: 'fill-in-the-blank',
            instruction: 'Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage for each answer.',
            subQuestions: [
                { id: '10', preText: 'A key challenge for modern planners is achieving environmental ', postText: '.' },
                { id: '11', preText: 'Mixed-use development helps to reduce ', postText: ' by decreasing the need for long commutes.' },
                { id: '12', preText: 'To ensure development projects meet residents\' needs, ', postText: ' is crucial.' },
            ],
            correctAnswer: {
                '10': 'sustainability',
                '11': 'traffic congestion',
                '12': 'community involvement',
            },
            explanation: '10: Passage B mentions "key challenges... is sustainability". 11: Passage C states this approach reduces "traffic congestion". 12: Passage D states "community involvement" is crucial.'
        },

        // Passage 3: Questions 13-15
        {
            id: '13',
            passage: 3,
            type: 'multiple-choice',
            instruction: 'Choose the correct letter, A, B, C or D.',
            questionText: 'What was the main finding of Karl von Frisch?',
            options: [
                'That honeybees use the Earth’s magnetic field.',
                'That honeybees can create mental maps.',
                'That honeybees communicate through a special dance.',
                'That honeybees can see polarized light.'
            ],
            correctAnswer: 'That honeybees communicate through a special dance.',
            explanation: 'The passage credits the "pioneering research of Karl von Frisch" with revealing the "waggle dance".'
        },
        {
            id: '14-15',
            passage: 3,
            type: 'yes-no-not-given',
            instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3?',
            subQuestions: [
                 { id: '14', text: 'The waggle dance is the only method honeybees use for navigation.' },
                 { id: '15', text: 'Honeybees\' brains are surprisingly complex for their size.' }
            ],
            options: ['YES', 'NO', 'NOT GIVEN'],
            correctAnswer: {
                '14': 'NO',
                '15': 'YES'
            },
            explanation: '14: No - the passage says "Beyond the waggle dance, bees also rely on a combination of other cues." 15: Yes - the passage describes their brain integrating multiple streams of information to create a "robust and flexible navigation system."'
        },
    ]
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
