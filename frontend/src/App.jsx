import React from 'react'
import { Route, Routes, Navigate } from 'react-router'
import ChatPage from './pages/chatPage';
import SignUpPage from './pages/signUpPage';
import LoginPage from './pages/loginPage';
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

  console.log("user", authUser);

  if (isCheckingAuth) return <PageLoader />;
  return (
    <div class="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      <div class="absolute left-0 top-0 w-1/5 h-1/3 bg-blue-500/10 blur-2xl"></div>
      <div class="absolute right-0 top-0 w-1/5 h-1/3 bg-red-500/10 blur-2xl"></div>

      <Routes>
        <Route path='/' element={authUser ? <ChatPage /> : <Navigate to={'/login'} />} />
        <Route path='/signUp' element={!authUser ? <SignUpPage /> : <Navigate to={'/login'} />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to={'/login'} />} />
      </Routes>
      <Toaster />
    </div >
  )
}

export default App
