import type { Timestamp } from 'firebase/firestore';

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
    // other progress fields can go here
  };
  createdAt: Timestamp;
}
