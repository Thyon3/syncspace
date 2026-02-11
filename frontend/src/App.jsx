import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import LoginPage from './pages/loginPage';
import SignUpPage from './pages/signUpPage';
import { userAuthStore } from './store/userAuthStore';
import PageLoader from './components/page_loader';
import { Toaster } from 'react-hot-toast';
import ChatApp from './components/ChatApp';

function App() {
  const { authUser, isCheckingAuth } = userAuthStore();

  if (isCheckingAuth) return <PageLoader />;

  if (!authUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return <ChatApp />;
}

export default App;
