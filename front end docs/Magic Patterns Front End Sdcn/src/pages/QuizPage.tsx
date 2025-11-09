import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import GuestModeBanner from '../components/ui/GuestModeBanner';
// Mock quiz data with correct answers
const mockQuiz = {
  id: 'quiz123',
  title: 'JAMB Diagnostic Quiz',
  totalQuestions: 30,
  questions: Array.from({
    length: 30
  }, (_, i) => ({
    id: `q${i + 1}`,
    text: `This is a sample question ${i + 1} for the JAMB diagnostic quiz. What is the correct answer?`,
    correctAnswer: ['a', 'b', 'c', 'd'][i % 4],
    options: [{
      id: 'a',
      text: `Option A for question ${i + 1}`
    }, {
      id: 'b',
      text: `Option B for question ${i + 1}`
    }, {
      id: 'c',
      text: `Option C for question ${i + 1}`
    }, {
      id: 'd',
      text: `Option D for question ${i + 1}`
    }]
  }))
};
const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const [explanationError, setExplanationError] = useState(false);
  // Check if user is guest (no auth token)
  const isGuest = !localStorage.getItem('auth_token');
  // Get current question
  const currentQuestion = mockQuiz.questions[currentQuestionIndex];
  // Check if current answer is correct
  const currentAnswer = selectedAnswers[currentQuestion.id];
  const isAnswerCorrect = currentAnswer === currentQuestion.correctAnswer;
  const isAnswerWrong = currentAnswer && !isAnswerCorrect;
  // Check if explanation is required and missing
  const isExplanationRequired = isAnswerWrong;
  const isExplanationMissing = isExplanationRequired && !explanations[currentQuestion.id]?.trim();
  // Calculate progress
  const progress = (currentQuestionIndex + 1) / mockQuiz.totalQuestions * 100;
  // Auto-save quiz data to localStorage for guest users
  useEffect(() => {
    if (isGuest) {
      const quizData = {
        quizId: mockQuiz.id,
        currentQuestionIndex,
        selectedAnswers,
        confidenceScores,
        explanations,
        timer,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('guest_quiz', JSON.stringify(quizData));
    }
  }, [currentQuestionIndex, selectedAnswers, confidenceScores, explanations, timer, isGuest]);
  // Load saved quiz data for guest users on mount
  useEffect(() => {
    if (isGuest) {
      const savedQuiz = localStorage.getItem('guest_quiz');
      if (savedQuiz) {
        try {
          const data = JSON.parse(savedQuiz);
          if (data.quizId === mockQuiz.id) {
            setCurrentQuestionIndex(data.currentQuestionIndex || 0);
            setSelectedAnswers(data.selectedAnswers || {});
            setConfidenceScores(data.confidenceScores || {});
            setExplanations(data.explanations || {});
            setTimer(data.timer || 0);
          }
        } catch (error) {
          console.error('Error loading saved quiz:', error);
        }
      }
    }
  }, [isGuest]);
  // Clear explanation error when question changes
  useEffect(() => {
    setExplanationError(false);
  }, [currentQuestionIndex]);
  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionId
    });
    // Clear error when user selects an answer
    setExplanationError(false);
  };
  // Handle confidence score change
  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setConfidenceScores({
      ...confidenceScores,
      [currentQuestion.id]: value
    });
  };
  // Handle explanation change
  const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExplanations({
      ...explanations,
      [currentQuestion.id]: e.target.value
    });
    // Clear error when user starts typing
    if (explanationError) {
      setExplanationError(false);
    }
  };
  // Validate explanation requirement
  const validateExplanation = () => {
    if (isExplanationMissing) {
      setExplanationError(true);
      return false;
    }
    return true;
  };
  // Go to next question
  const handleNextQuestion = () => {
    // Validate explanation before proceeding
    if (!validateExplanation()) {
      return;
    }
    if (currentQuestionIndex < mockQuiz.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  // Go to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  // Submit quiz
  const handleSubmitQuiz = async () => {
    // Validate explanation before submitting
    if (!validateExplanation()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Mock API call - in a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // For guest users, store complete quiz data in localStorage
      if (isGuest) {
        const completeQuizData = {
          quizId: mockQuiz.id,
          selectedAnswers,
          confidenceScores,
          explanations,
          totalTime: timer,
          completedAt: new Date().toISOString()
        };
        localStorage.setItem('guest_quiz_complete', JSON.stringify(completeQuizData));
      }
      // Redirect to results page
      window.location.href = `/diagnostic/${mockQuiz.id}`;
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Guest Mode Banner */}
        {isGuest && showGuestBanner && <GuestModeBanner onDismiss={() => setShowGuestBanner(false)} />}
        {/* Quiz Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mockQuiz.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Question {currentQuestionIndex + 1} of {mockQuiz.totalQuestions}
              </span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {formatTime(timer)}
              </span>
            </div>
          </div>
          <ProgressBar progress={progress} color="blue" />
        </div>
        {/* Question Card */}
        <Card className="mb-6">
          <Card.Body>
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {currentQuestion.text}
            </h2>
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map(option => <div key={option.id} className={`
                    border rounded-md p-4 cursor-pointer transition-colors
                    ${selectedAnswers[currentQuestion.id] === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                  `} onClick={() => handleSelectOption(option.id)}>
                  <div className="flex items-center">
                    <div className={`
                        flex items-center justify-center w-6 h-6 rounded-full mr-3
                        ${selectedAnswers[currentQuestion.id] === option.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}
                      `}>
                      <span className="text-sm font-medium uppercase">
                        {option.id}
                      </span>
                    </div>
                    <span className="text-gray-800">{option.text}</span>
                  </div>
                </div>)}
            </div>
            {/* Confidence Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How confident are you in this answer?
              </label>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">
                  Not confident
                </span>
                <input type="range" min="1" max="5" value={confidenceScores[currentQuestion.id] || 3} onChange={handleConfidenceChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-gray-500 ml-2">
                  Very confident
                </span>
              </div>
              <div className="text-center mt-1">
                <span className="text-sm font-medium text-gray-700">
                  {confidenceScores[currentQuestion.id] || 3}/5
                </span>
              </div>
            </div>
            {/* Explanation Textarea */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isExplanationRequired ? 'text-red-600' : 'text-gray-700'}`}>
                {isExplanationRequired ? 'Explain your reasoning (required)' : 'Explain your reasoning (optional)'}
                {isExplanationRequired && <span className="text-red-600 ml-1">*</span>}
              </label>
              <textarea value={explanations[currentQuestion.id] || ''} onChange={handleExplanationChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${explanationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}`} rows={3} placeholder={isExplanationRequired ? 'Please explain why you chose this answer...' : 'Optional: Share your thought process...'} />
              {explanationError && <p className="mt-1 text-sm text-red-600">
                  Please explain why you chose this answer
                </p>}
            </div>
          </Card.Body>
        </Card>
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentQuestionIndex === mockQuiz.totalQuestions - 1 ? <Button variant="primary" onClick={handleSubmitQuiz} isLoading={isSubmitting}>
              Submit Quiz
            </Button> : <Button variant="primary" onClick={handleNextQuestion}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>}
        </div>
        {/* Question Navigation Dots */}
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {mockQuiz.questions.map((_, index) => <button key={index} className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${index === currentQuestionIndex ? 'bg-blue-500 text-white' : selectedAnswers[mockQuiz.questions[index].id] ? 'bg-blue-100 text-blue-700 border border-blue-500' : 'bg-gray-200 text-gray-700'}
                `} onClick={() => setCurrentQuestionIndex(index)}>
                {index + 1}
              </button>)}
          </div>
        </div>
      </div>
    </div>;
};
export default QuizPage;