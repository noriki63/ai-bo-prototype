import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// コンポーネントのインポート
import Header from './components/Header';
import Footer from './components/Footer';
import ProjectCreation from './pages/ProjectCreation';
import RequirementsPhase from './pages/RequirementsPhase';
import DesignPhase from './pages/DesignPhase';
import ImplementationPhase from './pages/ImplementationPhase';
import Settings from './pages/Settings';
import ExpertAISettings from './pages/ExpertAISettings';
import LogViewer from './pages/LogViewer';
import { ProjectProvider } from './context/ProjectContext';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ProjectCreation />} />
              <Route path="/requirements" element={<RequirementsPhase />} />
              <Route path="/design" element={<DesignPhase />} />
              <Route path="/implementation" element={<ImplementationPhase />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/expert-settings" element={<ExpertAISettings />} />
              <Route path="/logs" element={<LogViewer />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ProjectProvider>
  );
}

export default App;