import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import UsersLoadingSkeleton from './usersLoadinSkeleton';
import NoChatsFound from './noChatsFound';
function ChatsList() {
    const { isChatLoading, chats, getAllChats, setSelectedUser, isUserLoading } = useChatStore();

    useEffect(() => { getAllChats(); }, [getAllChats]);
    if (isChatLoading) {
        return <UsersLoadingSkeleton />;
    }
    if (chats.length === 0) {
        return <NoChatsFound />;
    }
    return (
        <>
            {
                chats.map((chat) => (
                    <div key={chat._id} className='bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover: caret-cyan-500/20 transition-colors' onClick={() => { setSelectedUser(chat) }}>
                        <div className='flex items-center gap-3 justify-items-center'>
                            <div className={`avatar-online`}>
                                <div className='size-12 rounded-full'>
                                    <img src={chat.profilePic || "/vite.svg"} alt={chat.name} />
                                </div>

                            </div>
                            {/* the user name section  */}
                            <div className='text-slate-200  truncate font-medium'>
                                <h4>{chat.name}</h4>
                            </div>
                        </div>
                    </div>
                ))
            }
        </>
    )
}

export default ChatsList
