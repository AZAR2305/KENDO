// Quiz page - Displays AI-generated multiple-choice quiz based on the PDF
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function QuizPage() {
  const [quiz, setQuiz] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const documentId = localStorage.getItem('document_id');
    if (!documentId) {
      setError('No document uploaded. Please upload a PDF first.');
      return;
    }
  }, []);

  const fetchQuiz = async () => {
    const documentId = localStorage.getItem('document_id');
    if (!documentId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: documentId, question_count: 5 }),
      });

      const result = await response.json();

      if (response.ok) {
        setQuiz(result.quiz);
        setQuizStarted(true);
      } else {
        setError(result.error || 'Failed to generate quiz.');
      }
    } catch (err) {
      setError('An error occurred while fetching the quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer,
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStarted(false);
    setQuiz([]);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🥇';
    if (percentage >= 70) return '🥈';
    if (percentage >= 60) return '🥉';
    return '📚';
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-12">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-lg text-gray-600">🧠 AI is creating your personalized quiz...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                  {error.includes('No document uploaded') && (
                    <button 
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                      onClick={() => router.push('/upload')}
                    >
                      📁 Upload PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Results state
  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.length) * 100);
    
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8 flex items-center justify-center">
              🎯 <span className="ml-2">Quiz Results</span>
            </h1>
            
            {/* Score Display */}
            <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-6xl mb-4">{getScoreEmoji(percentage)}</div>
              <p className={`text-4xl font-bold mb-2 ${getScoreColor(percentage)}`}>
                {score} / {quiz.length}
              </p>
              <p className={`text-2xl ${getScoreColor(percentage)}`}>
                {percentage}% Score
              </p>
              <p className="text-gray-600 mt-2">
                {percentage >= 80 ? 'Excellent work!' : 
                 percentage >= 60 ? 'Good job!' : 
                 'Keep studying!'}
              </p>
            </div>
            
            {/* Detailed Results */}
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">📊 Detailed Results</h2>
              {quiz.map((question, index) => {
                const isCorrect = selectedAnswers[index] === question.correct_answer;
                const userAnswer = selectedAnswers[index];
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">
                        {isCorrect ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{index + 1}. {question.question}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-green-700">
                            <strong>Correct:</strong> {question.correct_answer}
                          </p>
                          <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                            <strong>Your answer:</strong> {userAnswer || 'Not answered'}
                          </p>
                          {question.explanation && (
                            <p className="text-gray-600 mt-2 italic">
                              💡 {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button 
                onClick={resetQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 Retake Quiz
              </button>
              <button 
                onClick={() => router.push('/question')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ❓ Ask Questions
              </button>
              <button 
                onClick={() => router.push('/')}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center">
              🧠 <span className="ml-2">Smart Quiz</span>
            </h1>
            
            <div className="mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg text-gray-600 mb-6">
                Test your understanding with AI-generated questions based on your uploaded document.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Quiz Features:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 5 Multiple-choice questions</li>
                  <li>• Based on your PDF content</li>
                  <li>• Detailed explanations provided</li>
                  <li>• Track your progress</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={fetchQuiz}
              disabled={!localStorage.getItem('document_id')}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Start Quiz
            </button>
            
            {!localStorage.getItem('document_id') && (
              <p className="text-red-600 mt-4">
                Please upload a PDF document first to take the quiz.
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz question view
  if (quiz.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No quiz questions available.</p>
            <button 
              onClick={() => router.push('/')} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const question = quiz[currentQuestion];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {quiz.length}</span>
              <span className="text-sm text-gray-600">{Math.round(((currentQuestion + 1) / quiz.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {question.question}
            </h2>
            
            {/* Answer Options */}
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedAnswers[currentQuestion] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={selectedAnswers[currentQuestion] === option}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedAnswers[currentQuestion] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[currentQuestion] === option && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{String.fromCharCode(65 + index)}. {option}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button 
              onClick={prevQuestion} 
              disabled={currentQuestion === 0}
              className="border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-bold py-2 px-4 rounded transition-colors"
            >
              ← Previous
            </button>
            
            <div className="flex space-x-2">
              {quiz.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentQuestion ? 'bg-blue-500' :
                    selectedAnswers[index] ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextQuestion}
              disabled={!selectedAnswers[currentQuestion]}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {currentQuestion === quiz.length - 1 ? 'Finish Quiz' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
