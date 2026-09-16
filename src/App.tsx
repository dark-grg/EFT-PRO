import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TopBar } from './components/layout/TopBar';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home';
import { Formations } from './pages/Formations';
import { Profile } from './pages/Profile';
import { Wheel } from './pages/Wheel';
import { DeviceCheck } from './pages/DeviceCheck';
import { FormationReader } from './pages/FormationReader';
import { AlRashdawiPortal } from './pages/AlRashdawiPortal';
import { PlayerDevelopmentsWebView } from './pages/PlayerDevelopmentsWebView';
import { Managers } from './pages/Managers';
import { AdminDashboard } from './pages/AdminDashboard';
import { OwnerPlayerDevelopments } from './pages/OwnerPlayerDevelopments';

import { LagRemover } from './pages/LagRemover';
import { Tactics } from './pages/Tactics';
import { UsersStats } from './pages/UsersStats';
import { News } from './pages/News';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';

function AppContent() {
  useAndroidBackButton();

  return (
    <div className="min-h-screen pb-24 bg-[#050B14] relative overflow-x-hidden">
      {/* 2D Static EFT PRO Production Background */}
      <div 
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: "url('/eft_pro_background.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark Subtle Vignette & Contrast Overlay */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-[#050B14]/80 via-[#050B14]/70 to-[#050B14]/90" />
      
      <TopBar />
      
      <main className="container max-w-md mx-auto p-4 relative z-10">
        <Routes>
          {/* Main Direct Routes (No login required) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/tournaments" element={<Navigate to="/news" replace />} />
          <Route path="/formations" element={<Navigate to="/formation-reader" replace />} />
          <Route path="/analyze" element={<Navigate to="/formation-reader" replace />} />
          <Route path="/tactics" element={<Tactics />} />
          <Route path="/users-stats" element={<UsersStats />} />
          <Route path="/users" element={<UsersStats />} />
          <Route path="/leaderboard" element={<Navigate to="/users-stats" replace />} />
          <Route path="/news" element={<News />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wheel" element={<Wheel />} />
          <Route path="/formation-reader" element={<FormationReader />} />
          <Route path="/device-check" element={<DeviceCheck />} />
          <Route path="/ram-check" element={<DeviceCheck />} />
          <Route path="/battery-check" element={<DeviceCheck />} />
          <Route path="/thermal-check" element={<DeviceCheck />} />
          <Route path="/alrashdawi" element={<AlRashdawiPortal />} />
          <Route path="/rashdawi" element={<AlRashdawiPortal />} />
          <Route path="/player-builds" element={<PlayerDevelopmentsWebView />} />
          <Route path="/players" element={<PlayerDevelopmentsWebView />} />
          <Route path="/managers" element={<Managers />} />
          <Route path="/coaches" element={<Managers />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/owner/player-developments" element={<OwnerPlayerDevelopments />} />
          <Route path="/admin/player-developments" element={<OwnerPlayerDevelopments />} />

          <Route path="/lag-remover" element={<LagRemover />} />
          <Route path="/boost" element={<LagRemover />} />
          <Route path="/anti-lag" element={<LagRemover />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: 'rgba(25, 25, 30, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }} 
        />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
