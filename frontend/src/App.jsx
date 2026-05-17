import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Activity, MessageSquare, Pill, Clock } from 'lucide-react';
import Scan from './pages/Scan';
import Interactions from './pages/Interactions';
import Chat from './pages/Chat';
import Reminders from './pages/Reminders';
import useIsMobile from './hooks/useIsMobile';
import './index.css';

function App() {
  const isMobile = useIsMobile();

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className={`glass-panel ${isMobile ? 'bottom-nav' : 'sidebar'}`}>
          <Link to="/" style={{ textDecoration: 'none', marginBottom: isMobile ? 0 : '2rem', display: 'flex', alignItems: 'center' }}>
            <h1 className="gradient-text" style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Activity color="#a78bfa" /> {!isMobile && "MediScan AI"}
            </h1>
          </Link>
          <div className="nav-links">
            <NavLink to="/">
                <Activity size={20} />
                <span>Scanner</span>
            </NavLink>
            <NavLink to="/interactions">
                <Pill size={20} />
                <span>Interactions</span>
            </NavLink>
            <NavLink to="/chat">
                <MessageSquare size={20} />
                <span>Chat</span>
            </NavLink>
            <NavLink to="/reminders">
                <Clock size={20} />
                <span>Reminders</span>
            </NavLink>
          </div>
        </nav>
        
        <main className="container" style={{ paddingBottom: isMobile ? '80px' : '2rem' }}>
          <Routes>
            <Route path="/" element={<Scan />} />
            <Route path="/interactions" element={<Interactions />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/reminders" element={<Reminders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
