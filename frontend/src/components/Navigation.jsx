import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="logo">
          <svg className="logo-shapes" width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            {/* Pink semicircle */}
            <path d="M 5 0 A 15 15 0 0 1 5 30 L 5 0 Z" fill="#d87f8f" />
            {/* Light teal circle */}
            <circle cx="20" cy="15" r="15" fill="#7ec5c1" opacity="0.7" />
            {/* Dark teal capsule */}
            <rect x="30" y="0" width="15" height="35" rx="7.5" fill="#157b8b" />
          </svg>
          <span className="logo-text">Factfullness</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;

