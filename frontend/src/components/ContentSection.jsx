import ReactMarkdown from 'react-markdown';
import './ContentSection.css';

function ContentSection({ section }) {
  return (
    <div className="content-section">
      {section.heading && (
        <h2 className="section-heading">{section.heading}</h2>
      )}
      <div className="section-content">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ContentSection;

