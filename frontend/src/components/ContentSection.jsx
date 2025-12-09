import ReactMarkdown from 'react-markdown';
import './ContentSection.css';

function ContentSection({ section }) {
  return (
    <div className={`content-section section-${section.type}`}>
      {section.heading && (
        <div className="section-heading-wrapper">
          <ReactMarkdown>{section.heading}</ReactMarkdown>
        </div>
      )}
      
      <div className="section-content">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>
      
      <div className="section-meta">
        <span className="reading-time">⏱️ ~{section.estimatedMinutes} min čítania</span>
      </div>
    </div>
  );
}

export default ContentSection;

