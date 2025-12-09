import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PreAssessmentPage from './pages/PreAssessmentPage';
import LearningPage from './pages/LearningPage';
import PostAssessmentPage from './pages/PostAssessmentPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/session/:sessionId/pre-test" element={<PreAssessmentPage />} />
        <Route path="/session/:sessionId/learning" element={<LearningPage />} />
        <Route path="/session/:sessionId/post-test" element={<PostAssessmentPage />} />
        <Route path="/session/:sessionId/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
