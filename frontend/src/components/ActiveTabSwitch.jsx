import React from 'react'
import { useChatStore } from '../store/useChatStore.js';

function ActiveTabSwitch() {
    // get the active tab and also the active tab setter 
    const { activeTab, setActiveTab } = useChatStore();


    return (
        <div className="flex justify-around gap-3 bg-transparent p-3 rounded-xl w-fit mx-auto">
            <button
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${activeTab === "chats"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400 shadow-md"
                    : "bg-base-200 text-slate-300 hover:bg-base-100"
                    }`}
                onClick={() => setActiveTab("chats")}
            >
                Chats
            </button>

            <button
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${activeTab === "contacts"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400 shadow-md"
                    : "bg-base-200 text-slate-300 hover:bg-base-100"
                    }`}
                onClick={() => setActiveTab("contacts")}
            >
                Contacts
            </button>
        </div>


    )
}

export default ActiveTabSwitch
