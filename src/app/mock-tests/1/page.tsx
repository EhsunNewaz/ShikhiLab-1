
'use client';

import { useState } from 'react';
import { ExamShell } from '@/components/exam/exam-shell';
import { SplitScreenLayout } from '@/components/exam/split-screen-layout';
import { InteractivePassage } from '@/components/exam/interactive-passage';
import { readingTestData } from '@/lib/course-data';
import { ExamInput } from '@/components/exam/form-elements/exam-input';
import { ExamRadioGroup, ExamRadioGroupItem } from '@/components/exam/form-elements/exam-radio-group';
import { ExamCheckbox } from '@/components/exam/form-elements/exam-checkbox';


interface QuestionState {
  id: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

const initialQuestions: QuestionState[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  status: 'unanswered',
}));

// Get the first reading test for demonstration
const readingTest = readingTestData[0];

// New component to demonstrate form elements
function QuestionPanel() {
  const [fillBlank, setFillBlank] = useState('');
  const [multipleChoice, setMultipleChoice] = useState('');
  const [checkboxes, setCheckboxes] = useState({ a: false, b: false, c: false });

  const handleCheckboxChange = (key: 'a' | 'b' | 'c') => {
    setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 font-exam">
      <div>
        <h3 className="font-bold">Questions 1 - 2</h3>
        <p className="text-sm mb-4">Complete the sentences below.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>1. Tea likely originated in the</span>
            <ExamInput value={fillBlank} onChange={e => setFillBlank(e.target.value)} />
            <span>region.</span>
          </div>
           <div className="flex items-center gap-2">
            <span>2. Placeholder question for</span>
            <ExamInput disabled />
            <span>.</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold">Question 3</h3>
        <p className="text-sm mb-4">Choose the correct letter, A, B, or C.</p>
        <ExamRadioGroup value={multipleChoice} onValueChange={setMultipleChoice} className="space-y-1">
          <ExamRadioGroupItem value="A" id="q3a" label="During the Shang Dynasty" />
          <ExamRadioGroupItem value="B" id="q3b" label="During the Tang Dynasty" />
          <ExamRadioGroupItem value="C" id="q3c" label="During the Ming Dynasty" />
        </ExamRadioGroup>
      </div>
      
       <div>
        <h3 className="font-bold">Question 4</h3>
        <p className="text-sm mb-4">Which TWO of the following are mentioned in the text?</p>
        <div className="flex flex-col gap-1">
          <ExamCheckbox checked={checkboxes.a} onCheckedChange={() => handleCheckboxChange('a')} label="The Japanese tea ceremony" />
          <ExamCheckbox checked={checkboxes.b} onCheckedChange={() => handleCheckboxChange('b')} label="The invention of the tea bag" />
          <ExamCheckbox checked={checkboxes.c} onCheckedChange={() => handleCheckboxChange('c')} label="The Opium Wars with China" />
        </div>
      </div>

    </div>
  )
}

export default function MockTestPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [questions, setQuestions] = useState<QuestionState[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleTimeUp = () => {
    console.log('Time is up! Interface is now locked.');
    setIsLocked(true);
  };

  const handleSelectQuestion = (index: number) => {
    if (!isLocked) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNextQuestion = () => {
    if (!isLocked) {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  };

  const handlePrevQuestion = () => {
    if (!isLocked) {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleToggleReview = () => {
    if (!isLocked) {
      setQuestions((prev) => {
        const newQuestions = [...prev];
        const currentQuestion = newQuestions[currentQuestionIndex];
        
        if (currentQuestion.status === 'reviewed') {
          // A more advanced version might remember the pre-review state.
          // For now, we revert to unanswered.
          currentQuestion.status = 'unanswered'; 
        } else {
          currentQuestion.status = 'reviewed';
        }
        return newQuestions;
      });
    }
  };

  return (
    <ExamShell
      onTimeUp={handleTimeUp}
      isLocked={isLocked}
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      onSelectQuestion={handleSelectQuestion}
      onNextQuestion={handleNextQuestion}
      onPrevQuestion={handlePrevQuestion}
      onToggleReview={onToggleReview}
    >
      <SplitScreenLayout
        leftPanel={<InteractivePassage text={readingTest.passage} />}
        rightPanel={<QuestionPanel />}
      />
    </ExamShell>
  );
}
