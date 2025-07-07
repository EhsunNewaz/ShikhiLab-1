# **App Name**: ShikhiLab IELTS Master

## Core Features:

- Secure Authentication: User authentication with Email/Password and Google Sign-In via Firebase Authentication.  New users are added to a 'users' collection in Firestore, storing key data like email, name, target IELTS band, and progress.
- Intelligent Onboarding: Multi-step onboarding flow to gather user information (name, city, target IELTS band). A diagnostic test assesses grammar and vocabulary, with results stored in Firestore.
- Personalized Dashboard: Personalized dashboard displaying 'Today's Goal' and 'Overall Progress' components.
- Dynamic Lessons: Interactive lesson pages with embedded video player and dual-language (Bangla/English) transcripts. Quizzes are linked to lessons, and user results are stored in Firestore.
- ShikhiLab AI Mentor: AI-powered mentor using Gemini Pro API via secure Cloud Function. The tool leverages a master system prompt that configures it to provide helpful explanations and advice.
- AI Writing Feedback: Writing module with a text editor and a 'Get Feedback' button that calls a Cloud Function to analyze the essay with Gemini and get personalized feedback.
- Speaking Practice: Speaking module to Record & Compare audio alongside pre-recorded model answers.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), suggestive of both Bangladesh and studiousness.
- Background color: Very light indigo (#F0F2FA).
- Accent color: Blue-violet (#7986CB) for highlights and interactive elements.
- Body text and headlines: 'PT Sans', a humanist sans-serif providing a modern yet approachable feel.
- Use a set of flat, line-art style icons with rounded corners and subtle animations to represent each module.
- Clean, modern layout with generous whitespace to avoid overwhelming users with information.
- Use subtle transitions and animations to provide feedback and guide the user through the app.