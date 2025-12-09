import './TopicCard.css';

function TopicCard({ topic, onStart }) {
  const difficultyColors = {
    beginner: '#22C55E',
    intermediate: '#F59E0B',
    advanced: '#EF4444'
  };

  const difficultyLabels = {
    beginner: 'Začiatočník',
    intermediate: 'Pokročilý',
    advanced: 'Expert'
  };

  return (
    <div className="topic-card">
      <div 
        className="topic-card-header"
        style={{ background: `linear-gradient(135deg, ${difficultyColors[topic.difficulty]}22, ${difficultyColors[topic.difficulty]}44)` }}
      >
        <div className="topic-icon">{topic.title.charAt(0)}</div>
      </div>
      
      <div className="topic-card-body">
        <div className="topic-meta">
          <span 
            className="topic-difficulty"
            style={{ backgroundColor: difficultyColors[topic.difficulty] }}
          >
            {difficultyLabels[topic.difficulty]}
          </span>
          <span className="topic-duration">⏱️ {topic.estimatedDuration} min</span>
        </div>
        
        <h3 className="topic-title">{topic.title}</h3>
        <p className="topic-description">{topic.description}</p>
        
        <button 
          className="topic-button"
          onClick={() => onStart(topic.id)}
        >
          Začať učenie →
        </button>
      </div>
    </div>
  );
}

export default TopicCard;

