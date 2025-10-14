import React, { useState } from 'react';
import { userAuthStore } from '../store/userAuthStore';
import { MailIcon, MessageCircleIcon, UserIcon, LockIcon, Loader } from 'lucide-react';
import { Link } from 'react-router';

function SignUpPage() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const { isSigningUp, signUp } = userAuthStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        signUp(formData);
    };

    return (
        <div className='w-full min-h-screen flex items-center justify-center p-4 bg-slate-900'>
            <div className='relative w-full max-w-6xl md:h-[800px] h-[650px]'>
                <div className='w-full flex flex-col md:flex-row'>
                    {/* LEFT FORM COLUMN */}
                    <div className='md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30'>
                        <div className='w-full max-w-md'>
                            {/* HEADER */}
                            <div className='text-center mb-8'>
                                <MessageCircleIcon className='w-12 h-12 mx-auto text-slate-400 mb-4' />
                                <h2 className='text-2xl font-bold text-slate-200 mb-2'>Create Account</h2>
                                <p className='text-slate-400'>Sign up for a new account</p>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit} className='space-y-6'>
                                {/* FULL NAME */}
                                <div>
                                    <label className='auth-input-label'>Full Name</label>
                                    <div className='relative'>
                                        <UserIcon className='auth-input-icon' />
                                        <input
                                            type='text'
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className='input'
                                            placeholder='John Doe'
                                        />
                                    </div>
                                </div>

                                {/* EMAIL */}
                                <div>
                                    <label className='auth-input-label'>Email</label>
                                    <div className='relative'>
                                        <MailIcon className='auth-input-icon' />
                                        <input
                                            type='email'
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className='input'
                                            placeholder='johndoe@gmail.com'
                                        />
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <label className='auth-input-label'>Password</label>
                                    <div className='relative'>
                                        <LockIcon className='auth-input-icon' />
                                        <input
                                            type='password'
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className='input'
                                            placeholder='******'
                                        />
                                    </div>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button className='auth-btn' type='submit' disabled={isSigningUp}>
                                    {isSigningUp ? (
                                        <Loader className='w-5 h-5 animate-spin mx-auto' />
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            {/* LOGIN LINK */}
                            <div className='text-center mt-6'>
                                <Link className='auth-link' to='/login'>
                                    Already have an account?
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* RIGHT FORM COLUMN */}
                    <div className='hidden md:w-1/2 p-8 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-50 to-transparent rounded-lg'>
                        <div>
                            <img src="/signUp.png" alt="people using mobile devices" className='w-full h-auto object-contain' />
                            <div className='mt-6 text-center'>
                                <h3 className='text-xl font-medium text-cyan-400 '>Start Your Journey Today</h3>
                                <div className='mt-4 flex justify-center gap-4'>
                                    <span className='auth-badge'>Free </span>

                                    <span className='auth-badge'>Easy Setup  </span>
                                    <span className='auth-badge'>Private </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;
