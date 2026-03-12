import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function MediaGallery({ chatId, isOpen, onClose }) {
    const [media, setMedia] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const mediaTypes = [
        { key: 'all', label: 'All Media' },
        { key: 'image', label: 'Photos' },
        { key: 'video', label: 'Videos' },
        { key: 'audio', label: 'Audio' },
        { key: 'document', label: 'Documents' }
    ];

    useEffect(() => {
        if (isOpen && chatId) {
            fetchMedia();
        }
    }, [isOpen, chatId, selectedType]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const params = selectedType !== 'all' ? { type: selectedType } : {};
            const res = await axiosInstance.get(`/media/gallery/${chatId}`, { params });
            setMedia(res.data.media);
        } catch (error) {
            toast.error('Failed to load media');
        } finally {
            setLoading(false);
        }
    };

    const downloadMedia = async (mediaItem) => {
        try {
            const res = await axiosInstance.get(`/media/${mediaItem._id}/download`);
            const link = document.createElement('a');
            link.href = res.data.downloadUrl;
            link.download = res.data.fileName;
            link.click();
            toast.success('Download started');
        } catch (error) {
            toast.error('Failed to download media');
        }
    };

    const deleteMedia = async (mediaId) => {
        if (!confirm('Are you sure you want to delete this media?')) return;
        
        try {
            await axiosInstance.delete(`/media/${mediaId}`);
            setMedia(prev => prev.filter(m => m._id !== mediaId));
            toast.success('Media deleted');
        } catch (error) {
            toast.error('Failed to delete media');
        }
    };

    const openLightbox = (mediaItem, index) => {
        setSelectedMedia(mediaItem);
        setCurrentIndex(index);
    };

    const closeLightbox = () => {
        setSelectedMedia(null);
        setCurrentIndex(0);
    };

    const navigateLightbox = (direction) => {
        const newIndex = direction === 'next' 
            ? (currentIndex + 1) % media.length
            : (currentIndex - 1 + media.length) % media.length;
        
        setCurrentIndex(newIndex);
        setSelectedMedia(media[newIndex]);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-slate-800 rounded-lg w-full max-w-4xl h-3/4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Media Gallery</h2>
                        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex gap-2">
                            {mediaTypes.map(type => (
                                <button
                                    key={type.key}
                                    onClick={() => setSelectedType(type.key)}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${
                                        selectedType === type.key
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Media Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : media.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No media found</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {media.map((item, index) => (
                                    <div key={item._id} className="bg-slate-700 rounded-lg overflow-hidden group">
                                        <div className="aspect-square relative">
                                            {item.type === 'image' ? (
                                                <img
                                                    src={item.thumbnailUrl || item.url}
                                                    alt={item.originalName}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    onClick={() => openLightbox(item, index)}
                                                />
                                            ) : item.type === 'video' ? (
                                                <div className="w-full h-full bg-slate-600 flex items-center justify-center cursor-pointer"
                                                     onClick={() => openLightbox(item, index)}>
                                                    <span className="text-4xl">🎥</span>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                                    <span className="text-4xl">📄</span>
                                                </div>
                                            )}
                                            
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openLightbox(item, index)}
                                                    className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => downloadMedia(item)}
                                                    className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteMedia(item._id)}
                                                    className="p-2 bg-red-500/50 rounded-full hover:bg-red-500/70"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-3">
                                            <p className="text-sm font-medium truncate">{item.originalName}</p>
                                            <p className="text-xs text-slate-400">{formatFileSize(item.fileSize)}</p>
                                            <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {selectedMedia && (
                <div className="fixed inset-0 bg-black z-60 flex items-center justify-center">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 z-10"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={() => navigateLightbox('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={() => navigateLightbox('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 z-10"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="max-w-4xl max-h-full p-4">
                        {selectedMedia.type === 'image' ? (
                            <img
                                src={selectedMedia.url}
                                alt={selectedMedia.originalName}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : selectedMedia.type === 'video' ? (
                            <video
                                src={selectedMedia.url}
                                controls
                                className="max-w-full max-h-full"
                            />
                        ) : (
                            <div className="bg-slate-800 p-8 rounded-lg text-center">
                                <p className="text-xl mb-4">{selectedMedia.originalName}</p>
                                <button
                                    onClick={() => downloadMedia(selectedMedia)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    Download
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default MediaGallery;