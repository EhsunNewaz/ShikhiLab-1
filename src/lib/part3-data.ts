import type { Part3Exercise } from './types';

export const part3Exercises: Part3Exercise[] = [
  {
    id: 'part3-journey',
    part2TopicId: 'exercise-journey',
    title: 'Discussion: Travel and Tourism',
    description: 'Practice discussing abstract topics related to travel.',
    qaPairs: [
      {
        id: 'p3-q1',
        question: 'What are the benefits of traveling to different countries?',
        transcript: "Traveling abroad has numerous benefits. Primarily, it broadens your perspective by exposing you to different cultures, traditions, and ways of life. Furthermore, it's a great opportunity for personal growth, as it often pushes you out of your comfort zone. Finally, it can boost local economies and create jobs in the tourism sector.",
        segments: [
          { id: 'p3-q1-s1', text: "Traveling abroad has numerous benefits." },
          { id: 'p3-q1-s2', text: "Primarily, it broadens your perspective by exposing you to different cultures, traditions, and ways of life."},
          { id: 'p3-q1-s3', text: "Furthermore, it's a great opportunity for personal growth, as it often pushes you out of your comfort zone."},
          { id: 'p3-q1-s4', text: "Finally, it can boost local economies and create jobs in the tourism sector."}
        ]
      },
      {
        id: 'p3-q2',
        question: 'Do you think it is better to travel alone or with other people? Why?',
        transcript: "Both have their own merits, but I believe it depends on the purpose of the trip. Traveling with others is fantastic for creating shared memories and can be safer. However, traveling alone offers unparalleled freedom and a chance for self-discovery. You are forced to be more independent and often interact more with locals.",
        segments: [
          { id: 'p3-q2-s1', text: "Both have their own merits, but I believe it depends on the purpose of the trip." },
          { id: 'p3-q2-s2', text: "Traveling with others is fantastic for creating shared memories and can be safer." },
          { id: 'p3-q2-s3', text: "However, traveling alone offers unparalleled freedom and a chance for self-discovery." },
          { id: 'p3-q2-s4', text: "You are forced to be more independent and often interact more with locals." }
        ]
      },
    ]
  }
];
