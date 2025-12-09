import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Navigation from '../components/Navigation';
import TopicCard from '../components/TopicCard';
import './HomePage.css';

function HomePage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/topics`);
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.data);
      } else {
        setError('Nepodarilo sa načítať témy');
      }
    } catch (err) {
      setError('Chyba pri pripájaní na server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = async (topicId) => {
    try {
      // Nájdenie témy pre uloženie
      const topic = topics.find(t => t.id === topicId);
      
      // Vytvorenie novej session
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topicId })
      });

      const data = await response.json();

      if (data.success) {
        const { sessionId } = data.data;
        localStorage.setItem('currentSessionId', sessionId);
        localStorage.setItem('sessionStartTime', Date.now());
        localStorage.setItem('currentTopicId', topicId);
        localStorage.setItem('currentTopicTitle', topic?.title || '');
        
        // Navigácia na vstupný test
        navigate(`/session/${sessionId}/pre-test`);
      } else {
        alert('Nepodarilo sa vytvoriť reláciu');
      }
    } catch (err) {
      alert('Chyba pri vytváraní relácie');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Navigation />
        <div className="loading">Načítavam témy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Navigation />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Navigation />
      
      <section className="hero">
        <div className="hero-content">
          <h1>
            Učte sa <span className="italic">interaktívne</span>
          </h1>
          <p className="lead">
            AI asistent, ktorý je efektívny a zábavný.
          </p>
          <p>
            Experimentujte s najnovšími AI technológiami.
          </p>
        </div>
      </section>

      <section className="topics-section">
        <h2 className="section-title">Dostupné Témy</h2>
        <div className="topics-grid">
          {topics.map((topic) => (
            <TopicCard 
              key={topic.id} 
              topic={topic} 
              onStart={handleStartLearning}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;

