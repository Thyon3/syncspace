import React from 'react'
import { Route, Routes } from 'react-router'
import ChatPage from './pages/chatPage';
import SignUpPage from './pages/signUpPage';
import LoginPage from './pages/loginPage';
import { userAuthStrore } from './store/userAuthStore';


const App = () => {



  return (
    <div class="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      <div class="absolute left-0 top-0 w-1/5 h-1/3 bg-blue-500/10 blur-2xl"></div>
      <div class="absolute right-0 top-0 w-1/5 h-1/3 bg-red-500/10 blur-2xl"></div>
      <div class="relative z-10 text-center text-white">
        <h1 class="text-5xl font-bold mb-4">Welcome to My App</h1>
        <p class="text-lg text-gray-300">Your components go here.</p>
      </div>
      <Routes>
        <Route path='/' element={<ChatPage />} />
        <Route path='/signUp' element={<SignUpPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </div >
  )
}

export default App
