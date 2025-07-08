import type { Part1Exercise } from './types';

export const part1Exercises: Part1Exercise[] = [
  {
    id: 'part1-general-intro',
    title: 'General Introduction & Topics',
    description: 'Practice common opening questions and mini-topics.',
    topics: [
      {
        id: 'topic-hometown',
        title: 'Mini-Topic: Hometown',
        questions: [
          {
            id: 'hometown-q1',
            question: "Let's talk about your hometown. Where is your hometown?",
            transcript: 'My hometown is a small coastal city in the south of the country. It is famous for its beautiful beaches and relaxed atmosphere.',
            segments: [
              { id: 'h-q1-s1', text: 'My hometown is a small coastal city in the south of the country.' },
              { id: 'h-q1-s2', text: 'It is famous for its beautiful beaches and relaxed atmosphere.' }
            ]
          },
          {
            id: 'hometown-q2',
            question: "What's the most interesting part of your hometown?",
            transcript: "I would say the most interesting part is the old town, with its narrow streets and historical buildings. It feels like stepping back in time.",
            segments: [
                { id: 'h-q2-s1', text: "I would say the most interesting part is the old town, with its narrow streets and historical buildings."},
                { id: 'h-q2-s2', text: "It feels like stepping back in time."}
            ]
          }
        ]
      },
      {
        id: 'topic-work-study',
        title: 'Mini-Topic: Work or Study',
        questions: [
            {
                id: 'work-q1',
                question: 'What do you do? Do you work or are you a student?',
                transcript: "Currently, I'm a final year university student, majoring in computer science. It's quite challenging, but I'm really enjoying it.",
                segments: [
                    { id: 'w-q1-s1', text: "Currently, I'm a final year university student, majoring in computer science." },
                    { id: 'w-q1-s2', text: "It's quite challenging, but I'm really enjoying it." }
                ]
            }
        ]
      }
    ]
  }
];
