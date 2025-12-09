import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Navigation from '../components/Navigation';
import ContentSection from '../components/ContentSection';
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
  
  const startTimeRef = useRef(Date.now());
  const contentRef = useRef(null);

  useEffect(() => {
    fetchContent();
    
    // Timer - update každú sekundu
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    // Scroll progress tracker
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      clearInterval(timerInterval);
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
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

  const handleContinueToTest = () => {
    navigate(`/session/${sessionId}/post-test`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container">
        <Navigation />
        <div className="loading">Načítavam učebný materiál...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Navigation />
      
      <div className="learning-container">
        <div className="learning-header">
          <h1>{topicTitle}</h1>
          <div className="learning-stats">
            <div className="stat">
              <span className="stat-label">Váš vstupný test:</span>
              <span className="stat-value">{preTestScore.toFixed(1)}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Čas štúdia:</span>
              <span className="stat-value">{formatTime(elapsedTime)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pokrok:</span>
              <span className="stat-value">{scrollProgress.toFixed(0)}%</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
          </div>
        </div>

        <div className="learning-content" ref={contentRef}>
          {content?.sections.map((section, index) => (
            <ContentSection key={index} section={section} />
          ))}
        </div>

        <div className="learning-footer">
          <button 
            onClick={handleContinueToTest}
            className="btn btn-primary btn-large"
          >
            Prejsť na výstupný test →
          </button>
        </div>
      </div>
    </div>
  );
}

export default LearningPage;

