import React from 'react';
import { RotateCcw, Play } from 'lucide-react';
import Button from './Button';
import Card from './Card';

type ResumeQuizModalProps = {
  isOpen: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  quizProgress?: {
    currentQuestion: number;
    totalQuestions: number;
    answeredQuestions: number;
    timestamp?: string;
  };
};

const ResumeQuizModal = ({
  isOpen,
  onResume,
  onStartFresh,
  quizProgress
}: ResumeQuizModalProps) => {
  // CRITICAL SAFETY: Never show modal if answeredQuestions is 0 or invalid
  if (!isOpen) return null;
  if (!quizProgress || quizProgress.answeredQuestions === 0) {
    console.error('[ResumeQuizModal] ⚠️ SAFETY: Modal received invalid progress - not rendering');
    return null;
  }

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      // Validate date is not invalid
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Play className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Resume Previous Quiz?
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                We found an incomplete quiz in your browser. Would you like to resume where you left off or start a fresh quiz?
              </p>
              
              {quizProgress && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Progress:</span>
                      <span>{quizProgress.currentQuestion + 1} of {quizProgress.totalQuestions} questions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Answered:</span>
                      <span>{quizProgress.answeredQuestions} questions</span>
                    </div>
                    {quizProgress.timestamp && (
                      <div className="flex justify-between">
                        <span className="font-medium">Started:</span>
                        <span className="text-xs">{formatDate(quizProgress.timestamp)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={onResume}
            >
              <Play className="h-4 w-4 mr-2 inline" />
              Resume Quiz
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={onStartFresh}
            >
              <RotateCcw className="h-4 w-4 mr-2 inline" />
              Start Fresh Quiz
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Starting a fresh quiz will clear your previous quiz data
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResumeQuizModal;

