import React, { useState } from 'react';
import { userAuthStore } from '../store/userAuthStore';
import { Lock, LogOut, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
    const { changePassword, deleteAccount, logout } = userAuthStore();
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handlePasswordChange = async (e) => {
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
