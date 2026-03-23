import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Navigation from '../components/Navigation';
import './ProfilePage.css';

function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, token, logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token]);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success) {
        setProfileData(data.data);
      } else {
        setError('Nepodarilo sa načítať profil');
      }
    } catch {
      setError('Chyba pri pripájaní na server');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function getImprovementClass(val) {
    if (val > 0) return 'improvement positive';
    if (val < 0) return 'improvement negative';
    return 'improvement neutral';
  }

  return (
    <div className="profile-page">
      <Navigation />
      <div className="profile-container">

        <div className="profile-header-section">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-since">Člen od {formatDate(user?.createdAt)}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Odhlásiť sa
          </button>
        </div>

        {loading && (
          <div className="profile-loading">
            <div className="spinner"></div>
            <p>Načítavam výsledky...</p>
          </div>
        )}

        {error && (
          <div className="profile-error">{error}</div>
        )}

        {profileData && !loading && (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-number">{profileData.totalCompleted}</span>
                <span className="stat-label">Dokončené testy</span>
              </div>
              {profileData.totalCompleted > 0 && (
                <>
                  <div className="stat-card">
                    <span className="stat-number">
                      {Math.round(profileData.completedTests.reduce((s, t) => s + t.finalTestScore, 0) / profileData.totalCompleted)}%
                    </span>
                    <span className="stat-label">Priem. záverečné skóre</span>
                  </div>
                  <div className="stat-card">
                    <span className={`stat-number ${profileData.completedTests.reduce((s, t) => s + t.improvement, 0) / profileData.totalCompleted >= 0 ? 'positive-text' : 'negative-text'}`}>
                      {profileData.completedTests.reduce((s, t) => s + t.improvement, 0) / profileData.totalCompleted > 0 ? '+' : ''}
                      {(profileData.completedTests.reduce((s, t) => s + t.improvement, 0) / profileData.totalCompleted).toFixed(1)}%
                    </span>
                    <span className="stat-label">Priem. zlepšenie</span>
                  </div>
                </>
              )}
            </div>

            <div className="tests-section">
              <h2>História testov</h2>

              {profileData.completedTests.length === 0 ? (
                <div className="no-tests">
                  <p>Zatiaľ si nedokončil žiadny test.</p>
                  <button className="start-btn" onClick={() => navigate('/')}>
                    Začni sa učiť →
                  </button>
                </div>
              ) : (
                <div className="tests-list">
                  {profileData.completedTests.map(test => (
                    <div key={test.sessionId} className="test-card">
                      <div className="test-card-top">
                        <div className="test-topic-info">
                          <span className="test-category-tag">{test.topicCategory}</span>
                          <span className="test-topic-title">{test.topicTitle}</span>
                        </div>
                        <span className="test-date">{formatDate(test.completedAt)}</span>
                      </div>

                      <div className="test-card-scores">
                        <div className="score-col">
                          <span className="score-col-label">Vstupný test</span>
                          <span className="score-col-value pre-score">{Math.round(test.preTestScore)}%</span>
                        </div>

                        <div className="score-arrow">→</div>

                        <div className="score-col">
                          <span className="score-col-label">Záverečný test</span>
                          <span className="score-col-value final-score">{Math.round(test.finalTestScore)}%</span>
                        </div>

                        <div className="score-divider" />

                        <div className={`improvement-col ${test.improvement > 0 ? 'positive' : test.improvement < 0 ? 'negative' : 'neutral'}`}>
                          <span className="score-col-label">Zlepšenie</span>
                          <span className="improvement-value">
                            {test.improvement > 0 ? '↑' : test.improvement < 0 ? '↓' : '–'}
                            {' '}{test.improvement > 0 ? '+' : ''}{Math.round(test.improvement)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
