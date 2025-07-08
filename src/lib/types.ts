
import type { Timestamp } from 'firebase/firestore';

/**
 * ======================================================
 * FIRESTORE DATA MODELS
 * ======================================================
 * 
 * This file defines the TypeScript interfaces for our main Firestore collections.
 * Using idiomatic camelCase for all field names.
 * 
 * /users/{userId}
 *   - Main document for a user.
 *   /user_progress/{lessonOrQuizId}
 *     - Sub-collection to track detailed progress.
 * 
 * /courses/{courseId}
 *   - High-level course metadata.
 * 
 * /lessons/{lessonId}
 *   - Content for an individual lesson.
 * 
 * /quizzes/{quizId}
 *   - Questions and answers for a quiz, linked to a lesson.
 * 
 * ======================================================
 */

/**
 * Represents the result of a single mock test.
 */
export interface MockTestResult {
  testId: string;
  score: number;
  total: number;
  completedAt: Timestamp;
}

/**
 * Collection: /users
 * The main user profile document.
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  name?: string;
  city?: string;
  photoURL?: string;
  ieltsGoalBand?: number;
  role?: 'student' | 'admin';
  progress?: {
    diagnosticTestScore?: number;
    // other summary progress fields can go here
  };
  mockTestHistory?: MockTestResult[];
  createdAt: Timestamp;
}


/**
 * Collection: /courses
 * Stores metadata for a course. For V1, this will contain a single document.
 */
export interface Course {
  id: string; // e.g., 'ielts-mastery'
  title: string;
  description: string;
  modules: string[]; // List of module IDs, e.g., ['writing', 'speaking']
}


/**
 * Collection: /lessons
 * Stores content for an individual lesson.
 */
export interface Lesson {
  id: string;
  titleBangla: string;
  titleEnglish: string;
  videoUrl?: string; // Not all lessons may have a video
  transcriptBangla: string;
  transcriptEnglish: string;
  module: 'intro' | 'writing' | 'speaking' | 'listening' | 'reading' | 'grammar_foundation';
  quizId?: string; // Optional link to an associated quiz
}


/**
 * Collection: /quizzes
 * Stores interactive exercises linked to a lesson.
 */
export interface Quiz {
  id: string;
  lessonId: string;
  questions: Question[];
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}


/**
 * Sub-Collection: /users/{userId}/user_progress
 * Each document tracks completion of a single lesson or quiz.
 * The document ID should be the corresponding lesson or quiz.
 */
export interface UserProgress {
  type: 'lesson' | 'quiz';
  completedAt: Timestamp;
  score?: number; // Optional, as lessons may not have a score
}

// Listening Lab Types
export interface ListeningLabChunk {
  id: string;
  text: string; // The full text of the sentence/chunk
  gaps: number[]; // Array of indices of words to be turned into gaps
}

export interface ListeningLabExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  chunks: ListeningLabChunk[];
}


// Speaking Practice Types
export interface ShadowingSegment {
  id: string;
  text: string;
}

export interface QAPair {
  id: string;
  question: string;
  transcript: string;
  segments: ShadowingSegment[];
}

export interface Part1Topic {
  id: string;
  title: string;
  questions: QAPair[];
}

export interface Part1Exercise {
  id: string;
  title: string;
  description: string;
  topics: Part1Topic[];
}

export interface ShadowingExercise {
  id: string;
  title: string;
  description: string;
  cueCard: string[];
  transcript: string;
  segments: ShadowingSegment[];
}

export interface Part3Exercise {
  id: string;
  part2TopicId: string;
  title: string;
  description: string;
  qaPairs: QAPair[];
}

export interface SpeakingFeedback {
  pronunciationScore: number;
  fluencyScore: number;
  feedback: string;
}

export interface ComprehensiveSpeakingFeedback {
  pronunciationScore: number;
  pronunciationFeedback: string;
  fluencyScore: number;
  fluencyFeedback: string;
  lexicalResourceScore: number;
  lexicalResourceFeedback: string;
  grammaticalRangeAndAccuracyScore: number;
  grammaticalRangeAndAccuracyFeedback: string;
  overallBandScore: number;
}

// Pronunciation Lab Types
export interface WordIssue {
  word: string;
  issue: string;
}

export interface Linking {
  wordIndexes: number[];
}

export interface Pause {
  afterWordIndex: number;
  strength: 'short' | 'long';
}

export interface PronunciationAnalysis {
  wordIssues: WordIssue[];
  linkingOpportunities: Linking[];
  pauses: Pause[];
  overallFeedback: string;
}
