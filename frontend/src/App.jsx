import React from 'react'
import { Route, Routes, Navigate } from 'react-router'
import ChatPage from './pages/chatPage';
import SignUpPage from './pages/signUpPage';
import LoginPage from './pages/loginPage'
import { userAuthStore } from './store/userAuthStore';
import { useEffect } from 'react';
import PageLoader from './components/page_loader';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const { authUser,
    isCheckingAuth,
    checkAuth } = userAuthStore();


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <Routes>
            <Route path='/' element={authUser ? <ChatPage /> : <Navigate to='/login' />} />
            <Route path='/signUp' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
            <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
          </Routes>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(30, 41, 59, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#06b6d4',
              secondary: '#e2e8f0',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#e2e8f0',
            },
          },
        }}
      />
    </div >
  )
}

export default App
