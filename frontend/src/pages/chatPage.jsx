import React from 'react'
import { useChatStore } from '../store/useChatStore'
import ProfileHeader from '../components/ProfileHeader'
import ActiveTabSwitch from '../components/ActiveTabSwitch'
import ChatsList from '../components/ChatsList'
import ContactsList from '../components/ContactsList'
import ChatContainer from '../components/ChatContainer'
import NoSelectedUserPlaceHolder from '../components/NoSelectedUserPlaceHolder'


function chatPage() {

    const { activeTab, selectedUser } = useChatStore();
    return (
        <div className='relative w-full max-w-6xl h- [600px]'>
            {/* LEFT SIDE  */}
            <div className='w-80 flex flex-col backdrop-blur-sm bg-slate-500/10'>
                <ProfileHeader />
                <ActiveTabSwitch />
                <div className='flex-1 overflow-y-auto p-4 space-y-2 '>
                    {
                        activeTab === 'chats' ? <ChatsList /> : <ContactsList />
                    }

                </div>

            </div>
            {/* RIGHT SIDE */}
            <div className='flex flex-1 bg-slate-500/50 backdrop-blur-sm'>

                {selectedUser ? <ChatContainer /> : <NoSelectedUserPlaceHolder />}

            </div>

        </div>
    )
}

export default chatPage
