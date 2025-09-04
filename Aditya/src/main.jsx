import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import GamePage from './Component/GamePage/GamePage.jsx';
import Leaderboard from './Component/LeaderPage/leaderBoardPage.jsx'; // ✅ import Leaderboard
import { BrowserRouter, Routes, Route } from 'react-router-dom';
window.global=window
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />           {/* Landing Page */}
        <Route path="/game" element={<GamePage />} />  {/* Game Page */}
        <Route path="/leaderboard" element={<Leaderboard />} /> {/* ✅ Leaderboard Page */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
