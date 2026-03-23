import './TopicCard.css';

function TopicCard({ topic, onStart }) {
  const difficultyLabels = {
    beginner: 'Začiatočník',
    intermediate: 'Pokročilý',
    advanced: 'Expert'
  };

  const topicEmojis = {
    'Čo sú to mocniny?': '🔢',
    'Čo sú to vektory?': '📐',
    'Protostómy': '🦠',
    'Varenie na woku': '🍳',
    'Pomoc pri výpočte kalórií': '🥗',
    'Ako si správne vystretchovať svaly': '🧘',
    'Ktoré farby sa ku sebe hodia': '🎨',
    'List vs Set vs Map vs Vector': '💻',
    'Základy fotosyntézy': '🌱',
    'Úvod do investovania': '📈'
  };

  const getEmoji = () => {
    return topicEmojis[topic.title] || topic.title.charAt(0);
  };

  return (
    <div className="topic-card" onClick={() => onStart(topic.id)}>
      <div className={`topic-icon-wrapper ${topic.difficulty}`}>
        {getEmoji()}
      </div>
      
      <div className="topic-meta-row">
        <span className={`topic-difficulty-badge ${topic.difficulty}`}>
          {difficultyLabels[topic.difficulty]}
        </span>
        <span className="topic-duration">
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"/>
          </svg>
          {topic.estimatedDuration} min
        </span>
      </div>
      
      <h3 className="topic-title">{topic.title}</h3>
      <p className="topic-description">{topic.description}</p>
      
      <button className="topic-button">
        Začať
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 8h10M9 4l4 4-4 4"/>
        </svg>
      </button>
    </div>
  );
}

export default TopicCard;
