import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import UsersLoadingSkeleton from './usersLoadinSkeleton';
import NoChatsFound from './noChatsFound';
function ContactsList() {
    const { isContactLoading, allContacts, getAllContacts, setSelectedUser, isUserLoading } = useChatStore();

    useEffect(() => { getAllContacts(); }, [getAllContacts]);
    if (isContactLoading) {
        return <UsersLoadingSkeleton />;
    }
    if (allContacts.length === 0) {
        return <NoChatsFound />;
    }
    return (
        <>
            {
                allContacts.map((contact) => (
                    <div key={contact._id} className='bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover: caret-cyan-500/20 transition-colors' onClick={() => { setSelectedUser(contact) }}>
                        <div className='flex items-center gap-3 justify-items-center'>
                            <div className={`avatar-online`}>
                                <div className='size-12 rounded-full'>
                                    <img src={contact.profilePic || "/vite.svg"} alt={contact.name} />
                                </div>

                            </div>
                            {/* the user name section  */}
                            <div className='text-slate-200  truncate font-medium'>
                                <h4>{contact.name}</h4>
                            </div>
                        </div>
                    </div>
                ))
            }
        </>
    )
}

export default ContactsList; 
