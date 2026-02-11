import React, { useState } from 'react';
import { userAuthStore } from '../store/userAuthStore';
import { MailIcon, MessageCircleIcon, UserIcon, LockIcon, Loader, Eye, EyeOff, Check, X } from 'lucide-react';
import { Link } from 'react-router';

function SignUpPage() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const { isSigningUp, signUp } = userAuthStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== confirmPassword) {
            return;
        }
        if (!agreedToTerms) {
            return;
        }
        signUp(formData);
    };

    const passwordRequirements = [
        { regex: /.{8,}/, text: "At least 8 characters" },
        { regex: /[A-Z]/, text: "One uppercase letter" },
        { regex: /[a-z]/, text: "One lowercase letter" },
        { regex: /[0-9]/, text: "One number" },
    ];

    const isValidPassword = passwordRequirements.every(req => req.regex.test(formData.password));
    const passwordsMatch = formData.password === confirmPassword && formData.password !== "";

    return (
        <div className='w-full min-h-screen flex items-center justify-center p-4 bg-gradient-dark'>
            <div className='relative w-full max-w-6xl md:h-[800px] h-[750px] fade-in'>
                <div className='w-full flex flex-col md:flex-row gap-6'>
                    {/* LEFT FORM COLUMN */}
                    <div className='md:w-1/2 p-8 flex items-center justify-center'>
                        <div className='w-full max-w-md glass-dark rounded-2xl p-8 shadow-2xl border border-slate-700/30 slide-up'>
                            {/* HEADER */}
                            <div className='text-center mb-8'>
                                <div className='relative inline-block mb-4'>
                                    <div className='absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-50 pulse-glow'></div>
                                    <MessageCircleIcon className='relative w-12 h-12 mx-auto text-cyan-400' />
                                </div>
                                <h2 className='text-3xl font-bold text-gradient mb-2'>Create Account</h2>
                                <p className='text-slate-400 text-sm'>Join our community and start connecting</p>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit} className='space-y-5'>
                                {/* FULL NAME */}
                                <div className='space-y-2'>
                                    <label className='auth-input-label flex items-center gap-2'>
                                        <UserIcon className='w-4 h-4' />
                                        Full Name
                                    </label>
                                    <div className='relative group'>
                                        <UserIcon className='auth-input-icon group-focus-within:text-cyan-400' />
                                        <input
                                            type='text'
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className='input pl-12'
                                            placeholder='John Doe'
                                            required
                                        />
                                    </div>
                                </div>

                                {/* EMAIL */}
                                <div className='space-y-2'>
                                    <label className='auth-input-label flex items-center gap-2'>
                                        <MailIcon className='w-4 h-4' />
                                        Email Address
                                    </label>
                                    <div className='relative group'>
                                        <MailIcon className='auth-input-icon group-focus-within:text-cyan-400' />
                                        <input
                                            type='email'
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className='input pl-12'
                                            placeholder='john@example.com'
                                            required
                                        />
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div className='space-y-2'>
                                    <label className='auth-input-label flex items-center gap-2'>
                                        <LockIcon className='w-4 h-4' />
                                        Password
                                    </label>
                                    <div className='relative group'>
                                        <LockIcon className='auth-input-icon group-focus-within:text-cyan-400' />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className='input pl-12 pr-12'
                                            placeholder='••••••••'
                                            required
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors'
                                        >
                                            {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                        </button>
                                    </div>

                                    {/* Password Requirements */}
                                    {formData.password && (
                                        <div className='space-y-1 mt-2'>
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className='flex items-center gap-2 text-xs'>
                                                    {req.regex.test(formData.password) ? (
                                                        <Check className='w-3 h-3 text-green-400' />
                                                    ) : (
                                                        <X className='w-3 h-3 text-red-400' />
                                                    )}
                                                    <span className={req.regex.test(formData.password) ? 'text-green-400' : 'text-slate-500'}>
                                                        {req.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div className='space-y-2'>
                                    <label className='auth-input-label flex items-center gap-2'>
                                        <LockIcon className='w-4 h-4' />
                                        Confirm Password
                                    </label>
                                    <div className='relative group'>
                                        <LockIcon className='auth-input-icon group-focus-within:text-cyan-400' />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className='input pl-12 pr-12'
                                            placeholder='••••••••'
                                            required
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors'
                                        >
                                            {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                        </button>
                                    </div>
                                    {confirmPassword && (
                                        <div className='flex items-center gap-2 text-xs mt-1'>
                                            {passwordsMatch ? (
                                                <>
                                                    <Check className='w-3 h-3 text-green-400' />
                                                    <span className='text-green-400'>Passwords match</span>
                                                </>
                                            ) : (
                                                <>
                                                    <X className='w-3 h-3 text-red-400' />
                                                    <span className='text-red-400'>Passwords do not match</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* TERMS AND CONDITIONS */}
                                <div className='space-y-2'>
                                    <label className='flex items-start gap-3 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className='mt-1 w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2'
                                            required
                                        />
                                        <span className='text-sm text-slate-400'>
                                            I agree to the{' '}
                                            <Link to='/terms' className='text-cyan-400 hover:text-cyan-300 transition-colors'>
                                                Terms of Service
                                            </Link>
                                            {' '}and{' '}
                                            <Link to='/privacy' className='text-cyan-400 hover:text-cyan-300 transition-colors'>
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button
                                    className='auth-btn w-full'
                                    type='submit'
                                    disabled={isSigningUp || !isValidPassword || !passwordsMatch || !agreedToTerms}
                                >
                                    {isSigningUp ? (
                                        <div className='flex items-center justify-center gap-2'>
                                            <Loader className='w-5 h-5 animate-spin' />
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            {/* DIVIDER */}
                            <div className='relative my-6'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-slate-700/50'></div>
                                </div>
                                <div className='relative flex justify-center text-sm'>
                                    <span className='px-4 bg-slate-900/60 text-slate-400 backdrop-blur-sm'>Or sign up with</span>
                                </div>
                            </div>

                            {/* SOCIAL SIGNUP */}
                            <div className='grid grid-cols-2 gap-3'>
                                <button className='btn-secondary flex items-center justify-center gap-2'>
                                    <svg className='w-4 h-4' viewBox='0 0 24 24'>
                                        <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                                        <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                                        <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                                        <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                                    </svg>
                                    Google
                                </button>
                                <button className='btn-secondary flex items-center justify-center gap-2'>
                                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                                        <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                                    </svg>
                                    GitHub
                                </button>
                            </div>

                            {/* LOGIN LINK */}
                            <div className='text-center mt-6'>
                                <span className='text-slate-400 text-sm'>Already have an account? </span>
                                <Link className='auth-link inline-block' to='/login'>
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM COLUMN */}
                    <div className='hidden md:w-1/2 md:flex items-center justify-center p-8'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl'></div>
                            <div className='relative glass-dark rounded-3xl p-8 text-center'>
                                <img src="/signUp.png" alt="people using mobile devices" className='w-full h-auto object-contain rounded-2xl mb-6' />
                                <div className='space-y-4'>
                                    <h3 className='text-2xl font-bold text-gradient'>Start Your Journey Today</h3>
                                    <p className='text-slate-400'>Join thousands of users already connected on our platform</p>
                                    <div className='flex flex-wrap justify-center gap-3 pt-4'>
                                        <span className='auth-badge'>🚀 Lightning Fast</span>
                                        <span className='auth-badge'>🔒 End-to-End Encrypted</span>
                                        <span className='auth-badge'>💎 Premium Features</span>
                                        <span className='auth-badge'>🌍 Global Connect</span>
                                        <span className='auth-badge'>📱 Cross Platform</span>
                                        <span className='auth-badge'>⚡ Real-time Sync</span>
                                    </div>
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
