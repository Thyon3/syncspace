import React, { useState } from 'react';
import { Search, Filter, Calendar, User, FileText, Image, Video, Music, X } from 'lucide-react';
import { axiosInstance } from '../lib/axios';

function AdvancedSearchFilters({ onSearch, onClose }) {
    const [filters, setFilters] = useState({
        query: '',
        messageType: 'all',
        dateRange: 'all',
        fromDate: '',
        toDate: '',
        sender: '',
        hasAttachment: false,
        attachmentType: 'all'
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const messageTypes = [
        { key: 'all', label: 'All Messages', icon: FileText },
        { key: 'text', label: 'Text Only', icon: FileText },
        { key: 'media', label: 'With Media', icon: Image },
        { key: 'files', label: 'With Files', icon: FileText }
    ];

    const dateRanges = [
        { key: 'all', label: 'All Time' },
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'custom', label: 'Custom Range' }
    ];

    const attachmentTypes = [
        { key: 'all', label: 'All Types', icon: FileText },
        { key: 'image', label: 'Images', icon: Image },
        { key: 'video', label: 'Videos', icon: Video },
        { key: 'audio', label: 'Audio', icon: Music },
        { key: 'document', label: 'Documents', icon: FileText }
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const performSearch = async () => {
        if (!filters.query.trim()) return;
        
        setLoading(true);
        try {
            const searchParams = {
                q: filters.query,
                type: filters.messageType !== 'all' ? filters.messageType : undefined,
                dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
                sender: filters.sender || undefined,
                hasAttachment: filters.hasAttachment || undefined,
                attachmentType: filters.attachmentType !== 'all' ? filters.attachmentType : undefined
            };

            // Remove undefined values
            Object.keys(searchParams).forEach(key => 
                searchParams[key] === undefined && delete searchParams[key]
            );

            const res = await axiosInstance.get('/messages/search', { params: searchParams });
            setResults(res.data.messages);
            
            if (onSearch) {
                onSearch(res.data.messages, filters);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            query: '',
            messageType: 'all',
            dateRange: 'all',
            fromDate: '',
            toDate: '',
            sender: '',
            hasAttachment: false,
            attachmentType: 'all'
        });
        setResults([]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-300 text-black">$1</mark>');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg w-full max-w-4xl h-5/6 flex" onClick={(e) => e.stopPropagation()}>
                {/* Filters Panel */}
                <div className="w-80 border-r border-slate-700 p-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Filter size={20} />
                            Advanced Search
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Search Query */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Search Query</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={filters.query}
                                onChange={(e) => handleFilterChange('query', e.target.value)}
                                placeholder="Enter search terms..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                            />
                        </div>
                    </div>

                    {/* Message Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Message Type</label>
                        <div className="space-y-2">
                            {messageTypes.map(type => {
                                const Icon = type.icon;
                                return (
                                    <label key={type.key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="messageType"
                                            value={type.key}
                                            checked={filters.messageType === type.key}
                                            onChange={(e) => handleFilterChange('messageType', e.target.value)}
                                            className="text-blue-500"
                                        />
                                        <Icon size={16} />
                                        <span className="text-sm">{type.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Date Range</label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                        >
                            {dateRanges.map(range => (
                                <option key={range.key} value={range.key}>{range.label}</option>
                            ))}
                        </select>

                        {filters.dateRange === 'custom' && (
                            <div className="mt-2 space-y-2">
                                <input
                                    type="date"
                                    value={filters.fromDate}
                                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                    className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                    placeholder="From date"
                                />
                                <input
                                    type="date"
                                    value={filters.toDate}
                                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                    className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                    placeholder="To date"
                                />
                            </div>
                        )}
                    </div>

                    {/* Sender Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">From User</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={filters.sender}
                                onChange={(e) => handleFilterChange('sender', e.target.value)}
                                placeholder="Username or name..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Attachment Filters */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                                type="checkbox"
                                checked={filters.hasAttachment}
                                onChange={(e) => handleFilterChange('hasAttachment', e.target.checked)}
                                className="text-blue-500"
                            />
                            <span className="text-sm font-medium">Has Attachments</span>
                        </label>

                        {filters.hasAttachment && (
                            <div className="ml-4 space-y-2">
                                {attachmentTypes.map(type => {
                                    const Icon = type.icon;
                                    return (
                                        <label key={type.key} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="attachmentType"
                                                value={type.key}
                                                checked={filters.attachmentType === type.key}
                                                onChange={(e) => handleFilterChange('attachmentType', e.target.value)}
                                                className="text-blue-500"
                                            />
                                            <Icon size={14} />
                                            <span className="text-sm">{type.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={performSearch}
                            disabled={!filters.query.trim() || loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            onClick={clearFilters}
                            className="w-full py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="font-semibold">
                            Search Results {results.length > 0 && `(${results.length})`}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="text-center py-8">Searching...</div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                {filters.query ? 'No messages found' : 'Enter a search query to begin'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((message) => (
                                    <div key={message._id} className="bg-slate-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={message.senderId?.profilePic || '/default-avatar.png'}
                                                    alt={message.senderId?.name}
                                                    className="w-6 h-6 rounded-full"
                                                />
                                                <span className="font-medium text-sm">
                                                    {message.senderId?.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {formatDate(message.createdAt)}
                                            </span>
                                        </div>

                                        {message.text && (
                                            <p 
                                                className="text-sm mb-2"
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightText(message.text, filters.query)
                                                }}
                                            />
                                        )}

                                        {message.image && (
                                            <img
                                                src={message.image}
                                                alt="Message attachment"
                                                className="max-w-xs rounded-lg mb-2"
                                            />
                                        )}

                                        {message.fileUrl && (
                                            <div className="flex items-center gap-2 text-sm text-blue-400">
                                                <FileText size={16} />
                                                <span>{message.fileName}</span>
                                            </div>
                                        )}

                                        <div className="text-xs text-slate-500 mt-2">
                                            In: {message.chatId?.groupName || 'Direct Message'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdvancedSearchFilters;