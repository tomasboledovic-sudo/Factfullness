import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Navigation from '../components/Navigation';
import ContentSection from '../components/ContentSection';
import QuestionCard from '../components/QuestionCard';
import './LearningPage.css';

function LearningPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [preTestScore, setPreTestScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Záverečný test state
  const [finalTest, setFinalTest] = useState(null);
  const [testGenerating, setTestGenerating] = useState(true);
  const [testReady, setTestReady] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [showTestResults, setShowTestResults] = useState(false);
  const [testScore, setTestScore] = useState(null);
  
  const startTimeRef = useRef(Date.now());
  const contentRef = useRef(null);
  const pollingRef = useRef(null);
  const testGenStartedRef = useRef(false);

  useEffect(() => {
    fetchContent();
    
    // Timer
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    // Scroll progress
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    return () => {
      clearInterval(timerInterval);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [sessionId]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/content`);
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
        setTopicTitle(data.data.topicTitle);
        setPreTestScore(data.data.preTestScore);
        
        // Ak test už existuje
        if (data.data.finalTest?.questions?.length > 0) {
          setFinalTest(data.data.finalTest);
          setTestReady(true);
          setTestGenerating(false);
        } else {
          // Spustiť generovanie testu na pozadí
          startTestGeneration();
        }
      } else {
        alert('Nepodarilo sa načítať obsah');
        navigate('/');
      }
    } catch (err) {
      alert('Chyba pri načítaní obsahu');
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Spustenie generovania záverečného testu — zavolá sa iba raz
  const startTestGeneration = async () => {
    if (testGenStartedRef.current) return;
    testGenStartedRef.current = true;

    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/generate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.data?.status === 'ready') {
        const found = await fetchFinalTest();
        if (found) return;
      }
    } catch (err) {
      console.error('Chyba pri spúšťaní generovania testu:', err);
    }

    pollTestStatus();
  };

  // Polling pre stav testu — bez časového obmedzenia, beží kým test nie je hotový
  const pollTestStatus = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/test/status`);
        const data = await response.json();
        
        if (data.success && data.data.ready) {
          clearInterval(pollingRef.current);
          await fetchFinalTest();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  // Načítanie finálneho testu
  const fetchFinalTest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/content`);
      const data = await response.json();
      
      if (data.success && data.data.finalTest?.questions?.length > 0) {
        setFinalTest(data.data.finalTest);
        setTestReady(true);
        setTestGenerating(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Chyba pri načítaní testu:', err);
      return false;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Test handlers
  const handleTestAnswer = (questionIndex, selectedOptionIndex) => {
    setTestAnswers({
      ...testAnswers,
      [questionIndex]: selectedOptionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < finalTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleStartTest = () => {
    setShowTest(true);
    setCurrentQuestionIndex(0);
  };

  const handleSubmitFinalTest = async () => {
    const answeredCount = Object.keys(testAnswers).length;
    if (answeredCount < finalTest.questions.length) {
      alert(`Prosím odpovedzte na všetky otázky (${answeredCount}/${finalTest.questions.length})`);
      return;
    }

    // Odoslať na backend
    try {
      const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const answersArray = finalTest.questions.map((_, index) => ({
        questionId: index,
        selectedOptionIndex: testAnswers[index],
        answeredAt: new Date().toISOString()
      }));

      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/post-test/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersArray,
          timeSpentSeconds
        })
      });

      const data = await response.json();

      if (data.success) {
        setTestScore({
          percentage: data.data.postTestScore.percentage,
          correctCount: data.data.postTestScore.correctAnswers,
          totalQuestions: data.data.postTestScore.totalQuestions,
          detailedResults: data.data.detailedResults,
          improvement: data.data.improvement
        });
        setShowTestResults(true);
      } else {
        alert('Chyba pri odosielaní testu');
      }
    } catch (err) {
      console.error('Chyba:', err);
      alert('Chyba pri odosielaní testu');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRepeatTopic = () => {
    const topicId = localStorage.getItem('currentTopicId');
    if (topicId) {
      // Vytvoriť novú session
      navigate('/');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <div className="loading">Načítavam učebný materiál...</div>
      </div>
    );
  }

  // Výsledky záverečného testu
  if (showTestResults && testScore) {
    return (
      <div className="page-wrapper">
        <Navigation />
        
        <div className="results-container">
          <div className="results-header">
            <h1>🎉 Výsledky</h1>
            
            <div className="score-display">
              <div className="score-circle large">
                <span className="score-number">{testScore.percentage}%</span>
              </div>
              <p className="score-text">
                {testScore.correctCount} z {testScore.totalQuestions} správne
              </p>
            </div>
          </div>

          <div className="comparison-section">
            <div className="comparison-row">
              <div className="comparison-item">
                <span className="label">Vstupný test</span>
                <span className="value">{preTestScore.toFixed(0)}%</span>
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-item">
                <span className="label">Záverečný test</span>
                <span className="value">{testScore.percentage}%</span>
              </div>
            </div>
            <div className={`improvement-badge ${testScore.improvement >= 0 ? 'positive' : 'negative'}`}>
              {testScore.improvement >= 0 ? '+' : ''}{testScore.improvement.toFixed(0)}% zlepšenie
            </div>
          </div>

          <div className="detailed-results">
            <h2>Detaily</h2>
            {testScore.detailedResults?.map((result, index) => (
              <div 
                key={index} 
                className={`result-item ${result.wasCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="result-number">
                  {result.wasCorrect ? '✓' : '✗'} Otázka {index + 1}
                </div>
                <div className="result-question">{result.questionText}</div>
                <div className="result-answers">
                  <div className={`result-answer ${result.wasCorrect ? '' : 'wrong'}`}>
                    <strong>Vaša odpoveď:</strong> {result.userSelectedOption}
                  </div>
                  {!result.wasCorrect && (
                    <div className="result-answer correct-answer">
                      <strong>Správna odpoveď:</strong> {result.correctOption}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button onClick={handleRepeatTopic} className="btn btn-secondary">
              Zopakovať tému
            </button>
            <button onClick={handleGoHome} className="btn btn-primary">
              Späť na úvod
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Záverečný test
  if (showTest && finalTest) {
    const currentQuestion = finalTest.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / finalTest.questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === finalTest.questions.length - 1;

    return (
      <div className="page-wrapper">
        <Navigation />
        
        <div className="assessment-container">
          <div className="assessment-header">
            <h1>Záverečný Test</h1>
            <p className="test-description">{finalTest.description}</p>
            <div className="progress-info">
              Otázka {currentQuestionIndex + 1} z {finalTest.questions.length}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <QuestionCard
            question={{
              id: currentQuestionIndex,
              questionText: currentQuestion.question,
              options: currentQuestion.options
            }}
            selectedAnswer={testAnswers[currentQuestionIndex]}
            onAnswer={(optionIndex) => handleTestAnswer(currentQuestionIndex, optionIndex)}
          />

          <div className="navigation-buttons">
            <button 
              onClick={handlePreviousQuestion} 
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary"
            >
              ← Späť
            </button>

            {!isLastQuestion ? (
              <button 
                onClick={handleNextQuestion}
                className="btn btn-primary"
                disabled={testAnswers[currentQuestionIndex] === undefined}
              >
                Ďalej →
              </button>
            ) : (
              <button 
                onClick={handleSubmitFinalTest}
                className="btn btn-primary"
                disabled={Object.keys(testAnswers).length < finalTest.questions.length}
              >
                Odoslať Test
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Učebný obsah
  return (
    <div className="page-wrapper">
      <Navigation />
      
      <div className="learning-container">
        <div className="learning-header">
          <h1>{topicTitle}</h1>
          <div className="learning-stats">
            <div className="stat">
              <span className="stat-label">Vstupný test:</span>
              <span className="stat-value">{preTestScore.toFixed(0)}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Čas:</span>
              <span className="stat-value">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        <div className="learning-content" ref={contentRef}>
          {content?.sections.map((section, index) => (
            <ContentSection key={index} section={section} />
          ))}
        </div>

        <div className="learning-footer">
          {testReady && finalTest ? (
            <button 
              onClick={handleStartTest}
              className="btn btn-primary btn-large"
            >
              Začať Záverečný Test ({finalTest.questions.length} otázok) →
            </button>
          ) : testGenerating ? (
            <div className="test-generating">
              <div className="mini-spinner"></div>
              <span>Pripravujem záverečný test...</span>
            </div>
          ) : (
            <button 
              onClick={handleGoHome}
              className="btn btn-secondary btn-large"
            >
              Späť na úvod
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LearningPage;
