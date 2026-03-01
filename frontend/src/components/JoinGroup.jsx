import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useChatStore } from "../store/useChatStore";
import PageLoader from "./page_loader";
import { Users, ArrowRight, X } from "lucide-react";

function JoinGroup() {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const { joinGroupByInvite, isChatLoading } = useChatStore();
    const [status, setStatus] = React.useState("joining"); // joining, success, error
    const [errorMsg, setErrorMsg] = React.useState("");

    useEffect(() => {
        const join = async () => {
            try {
                const chat = await joinGroupByInvite(inviteCode);
                if (chat) {
                    setStatus("success");
                    // Auto redirect after 2 seconds
                    setTimeout(() => navigate("/"), 2000);
                } else {
                    setStatus("error");
                    setErrorMsg("Invalid or expired invite link");
                }
            } catch (err) {
                setStatus("error");
                setErrorMsg(err.message || "Failed to join group");
            }
        };

        if (inviteCode) join();
    }, [inviteCode, joinGroupByInvite, navigate]);

    return (
        <div className="fixed inset-0 z-[200] bg-telegram-dark flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-telegram-sidebar rounded-2xl border border-slate-700 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-telegram-blue/10 rounded-full flex items-center justify-center mx-auto">
                    {status === "joining" && <Users className="w-10 h-10 text-telegram-blue animate-pulse" />}
                    {status === "success" && <Users className="w-10 h-10 text-green-400" />}
                    {status === "error" && <X className="w-10 h-10 text-red-400" />}
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-100">
                        {status === "joining" && "Joining Group..."}
                        {status === "success" && "Welcome to the Group!"}
                        {status === "error" && "Oops! Something went wrong"}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {status === "joining" && "Taking you to the conversation..."}
                        {status === "success" && "You have successfully joined via invite link."}
                        {status === "error" && errorMsg}
                    </p>
                </div>

                {status === "error" && (
                    <button
                        onClick={() => navigate("/")}
                        className="telegram-button w-full"
                    >
                        Back to Chats
                    </button>
                )}

                {status === "success" && (
                    <div className="flex items-center justify-center gap-2 text-telegram-blue text-sm font-medium animate-bounce pt-4">
                        Redirecting <ArrowRight className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default JoinGroup;
