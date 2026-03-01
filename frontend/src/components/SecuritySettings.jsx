import React, { useState, useEffect } from 'react';
import { userAuthStore } from '../store/userAuthStore';
import { Lock, LogOut, Trash2, AlertTriangle, Eye, EyeOff, Monitor, Smartphone, Globe, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
    const {
        changePassword,
        deleteAccount,
        logout,
        getSessions,
        terminateSession,
        terminateOtherSessions
    } = userAuthStore();

    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    // ... existing password state ...
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoadingSessions(true);
        const data = await getSessions();
        setSessions(data);
        setLoadingSessions(false);
    };

    const handleTerminateSession = async (sessionId) => {
        if (window.confirm("Terminate this session? The device will be logged out immediately.")) {
            const success = await terminateSession(sessionId);
            if (success) fetchSessions();
        }
    };

    const handleTerminateOthers = async () => {
        if (window.confirm("Terminate ALL other sessions? Every other device will be logged out.")) {
            const success = await terminateOtherSessions();
            if (success) fetchSessions();
        }
    };

    const parseUserAgent = (ua) => {
        if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'Mobile';
        if (ua.includes('Windows') || ua.includes('Macintosh') || ua.includes('Linux')) return 'Desktop';
        return 'Web';
    };

    const getDeviceIcon = (ua) => {
        const type = parseUserAgent(ua);
        if (type === 'Mobile') return <Smartphone className="w-5 h-5" />;
        if (type === 'Desktop') return <Monitor className="w-5 h-5" />;
        return <Globe className="w-5 h-5" />;
    };

    const handlePasswordChange = async (e) => {
        // ... (existing code, unchanged) ...
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("New passwords do not match");
        }
        if (passwords.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        const success = await changePassword({
            oldPassword: passwords.oldPassword,
            newPassword: passwords.newPassword
        });

        if (success) {
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to PERMANENTLY delete your account? This action cannot be undone.")) {
            setIsDeleting(true);
            await deleteAccount();
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Change Password Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <Lock className="w-5 h-5 text-telegram-blue" />
                    <h3>Change Password</h3>
                </div>

                <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type={showPasswords ? "text" : "password"}
                            placeholder="Old Password"
                            value={passwords.oldPassword}
                            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                            className="telegram-input w-full pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="New Password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="telegram-input w-full"
                        required
                    />

                    <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="telegram-input w-full"
                        required
                    />

                    <button type="submit" className="telegram-button w-full">
                        Update Password
                    </button>
                </form>
            </div>

            <hr className="border-slate-800" />

            {/* Active Sessions Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <ShieldAlert className="w-5 h-5 text-emerald-500" />
                        <h3>Active Sessions</h3>
                    </div>
                    {sessions.length > 1 && (
                        <button
                            onClick={handleTerminateOthers}
                            className="text-xs text-red-500 hover:underline font-medium"
                        >
                            Terminate all other sessions
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {loadingSessions ? (
                        <div className="flex justify-center p-4">
                            <div className="w-6 h-6 border-2 border-telegram-blue border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-slate-500 py-4 italic">No active sessions found.</p>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session._id}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${session.isCurrent ? 'bg-telegram-blue/5 border-telegram-blue/20' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'}`}
                            >
                                <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-telegram-blue text-white' : 'bg-slate-700 text-slate-300'}`}>
                                    {getDeviceIcon(session.userAgent)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white truncate">
                                            {parseUserAgent(session.userAgent)}
                                        </span>
                                        {session.isCurrent && (
                                            <span className="text-[10px] bg-telegram-blue/20 text-telegram-blue px-1.5 py-0.5 rounded uppercase font-bold">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                        <span>{session.ip}</span>
                                        <span>•</span>
                                        <span>Last active: {new Date(session.lastActive).toLocaleString()}</span>
                                    </div>
                                </div>

                                {!session.isCurrent && (
                                    <button
                                        onClick={() => handleTerminateSession(session._id)}
                                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                        title="Terminate session"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <hr className="border-slate-800" />

            {/* Danger Zone */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3>Danger Zone</h3>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout from this device</span>
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-500"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>{isDeleting ? "Deleting..." : "Delete Account"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
