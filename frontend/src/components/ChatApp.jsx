import React, { useState } from 'react';
import { userAuthStore } from '../store/userAuthStore';
import { useChatStore } from '../store/useChatStore';
import { Toaster } from 'react-hot-toast';
import ChatsList from './ChatsList';
import CreateGroupModal from './CreateGroupModal';
import ChatContainer from './ChatContainer';
import NoSelectedUserPlaceHolder from './NoSelectedUserPlaceHolder';
import SettingsPage from './SettingsPage';

import { useEffect } from 'react';

function ChatApp() {
  const { authUser } = userAuthStore();
  const {
    selectedUser,
    selectedChat,
    searchContacts,
    searchMessages,
    searchResults,
    isSearchLoading,
    clearSearchResults,
    setSelectedUser,
    setSelectedChat
  } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Search Debounce Logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayDebounceFn = setTimeout(() => {
        searchContacts(searchQuery);
        searchMessages(searchQuery);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      clearSearchResults();
    }
  }, [searchQuery, searchContacts, searchMessages, clearSearchResults]);

  return (
    <div className="h-screen flex bg-telegram-dark overflow-hidden">
      {/* Telegram Desktop Layout - Three Columns */}
      <div className="flex h-full w-full">
        {/* Left Sidebar - Folders and Navigation (Telegram style) - Desktop Only */}
        <div className="hidden lg:flex w-80 telegram-sidebar flex-col">
          {/* User Profile Section */}
          <div className="telegram-header">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowSettings(true)}
              >
                <span className="text-white font-semibold">
                  {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-title text-slate-100">{authUser?.name || 'User'}</h3>
                <p className="text-caption text-slate-400">Active now</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="telegram-icon-button"
                  title="New Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button className="telegram-icon-button" title="Search">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Folders */}
          <div className="flex-1 overflow-y-auto">
            {/* All Chats Folder */}
            <div className="telegram-chat-item telegram-chat-item-active">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-telegram-blue rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-subtitle text-slate-100">All Chats</h4>
                  <p className="text-caption text-slate-400">Your conversations</p>
                </div>
              </div>
            </div>

            {/* Personal Folder */}
            <div className="telegram-chat-item">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-subtitle text-slate-100">Personal</h4>
                  <p className="text-caption text-slate-400">Private chats</p>
                </div>
              </div>
            </div>

            {/* Groups Folder */}
            <div className="telegram-chat-item">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-subtitle text-slate-100">Groups</h4>
                  <p className="text-caption text-slate-400">Group chats</p>
                </div>
              </div>
            </div>

            {/* Archive */}
            <div className="telegram-chat-item">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-subtitle text-slate-100">Archive</h4>
                  <p className="text-caption text-slate-400">Archived chats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="telegram-header border-t border-telegram-sidebar">
            <button
              onClick={() => setShowSettings(true)}
              className="telegram-chat-item w-full"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="text-subtitle text-slate-100">Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Middle Column - Chat List */}
        <div className={`${selectedUser || selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 telegram-chat-list flex-col`}>
          {/* Chat List Header */}
          <div className="telegram-header">
            <div className="flex items-center gap-3">
              <h2 className="text-title text-slate-100 flex-1">Chats</h2>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="telegram-icon-button"
                title="New Chat"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {/* Search Bar */}
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="telegram-input w-full"
              />
            </div>
          </div>

          {/* Chat List Content */}
          <div className="flex-1 overflow-y-auto relative">
            {searchQuery.trim().length > 1 ? (
              <div className="absolute inset-0 bg-telegram-dark z-10 flex flex-col">
                {/* Search Results */}
                {isSearchLoading ? (
                  <div className="p-4 text-center text-slate-400">Searching...</div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-2">
                    {/* People & Groups */}
                    {(searchResults.users.length > 0 || searchResults.groups.length > 0) && (
                      <div className="mb-4">
                        <h3 className="text-[11px] font-bold text-telegram-blue uppercase tracking-wider px-3 mb-2">People & Groups</h3>
                        {searchResults.users.map(user => (
                          <div
                            key={user._id}
                            onClick={() => { setSelectedUser(user); setSearchQuery(''); }}
                            className="telegram-chat-item flex items-center gap-3 cursor-pointer"
                          >
                            <img src={user.profilePic || "/vite.svg"} className="w-10 h-10 rounded-full object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-subtitle text-slate-100 truncate">{user.name}</p>
                              <p className="text-caption text-slate-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        ))}
                        {searchResults.groups.map(group => (
                          <div
                            key={group._id}
                            onClick={() => { setSelectedChat(group); setSearchQuery(''); }}
                            className="telegram-chat-item flex items-center gap-3 cursor-pointer"
                          >
                            <img src={group.groupImage || "/vite.svg"} className="w-10 h-10 rounded-full object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-subtitle text-slate-100 truncate">{group.groupName}</p>
                              <p className="text-caption text-slate-400 truncate">Group</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Messages */}
                    {searchResults.messages.length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-bold text-telegram-blue uppercase tracking-wider px-3 mb-2">Messages</h3>
                        {searchResults.messages.map(msg => (
                          <div
                            key={msg._id}
                            onClick={() => {
                              if (msg.chatId.type === 'group') {
                                setSelectedChat(msg.chatId);
                              } else {
                                // Handle direct message context if needed (finding the other member)
                                // For now just select the chat if chatId is populated
                                setSelectedChat(msg.chatId);
                              }
                              setSearchQuery('');
                            }}
                            className="telegram-chat-item flex flex-col gap-1 cursor-pointer"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-subtitle text-slate-100 font-medium">{msg.senderId?.name}</span>
                              <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-caption text-slate-400 line-clamp-2 italic">"{msg.text}"</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.users.length === 0 && searchResults.groups.length === 0 && searchResults.messages.length === 0 && (
                      <div className="p-4 text-center text-slate-400">No results found</div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
            <ChatsList />
          </div>
        </div>

        {/* Right Column - Chat Area */}
        <div className={`${selectedUser || selectedChat ? 'flex' : 'hidden lg:flex'} flex-1 telegram-chat-area flex-col`}>
          {selectedUser || selectedChat ? (
            <ChatContainer />
          ) : (
            <NoSelectedUserPlaceHolder />
          )}
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#252528',
            color: '#f3f4f6',
            border: '1px solid #2c2c30',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#0088cc',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Modals */}
      {showCreateGroupModal && (
        <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} />
      )}

      {showSettings && (
        <SettingsPage onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default ChatApp;
