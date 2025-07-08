import type { ListeningLabExercise } from './types';

export const listeningLabExercises: ListeningLabExercise[] = [
    {
        id: 'exercise-market-trip',
        title: 'A Trip to the Market',
        description: 'Listen to a short story about a trip to a local market and fill in the missing words.',
        difficulty: 'easy',
        chunks: [
            {
                id: 'chunk-1',
                text: "I went to the market yesterday to buy some fresh vegetables.",
                gaps: [3, 7] // "market", "vegetables"
            },
            {
                id: 'chunk-2',
                text: "It was bustling with people and vibrant colors.",
                gaps: [2, 6] // "bustling", "colors"
            },
            {
                id: 'chunk-3',
                text: "The smell of spices filled the air.",
                gaps: [3] // "spices"
            },
             {
                id: 'chunk-4',
                text: "I bought some ripe tomatoes and green cucumbers.",
                gaps: [3, 6] // "tomatoes", "cucumbers"
            }
        ]
    }
];
