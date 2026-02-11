import React, { useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X as XIcon, Image as ImageIcon, Send as SendIcon, Paperclip, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

function MessageInput() {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const { sendMessage, isSendinMessageLoading } = useChatStore();

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!text.trim() && !image) return;

        sendMessage({ text: text.trim(), image });
        setText('');
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('Image size should be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image size should be less than 10MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    return (
        <div className="w-full p-4 glass-dark border-t border-slate-700/30">
            {/* Image Preview */}
            {image && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden mx-auto mb-3 glass border border-slate-700/50 slide-up">
                    <img src={image} alt="preview" className="w-full h-full object-cover" />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 shadow-lg"
                    >
                        <XIcon className="w-3 h-3 text-white" />
                    </button>
                </div>
            )}

            {/* Message Input */}
            <form
                onSubmit={handleSendMessage}
                className={`relative flex items-end gap-3 glass rounded-2xl p-3 border transition-all duration-200 ${isDragging
                        ? 'border-cyan-500 bg-cyan-500/5'
                        : 'border-slate-700/30 hover:border-slate-600/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Attachment Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
                    title="Attach image"
                >
                    <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                        className="w-full bg-transparent text-slate-100 placeholder-slate-400 outline-none resize-none max-h-32 py-2 text-sm"
                        style={{ fieldSizing: 'content' }}
                    />
                </div>

                {/* Emoji Button */}
                <button
                    type="button"
                    className="p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
                    title="Add emoji"
                >
                    <Smile className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                </button>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={isSendinMessageLoading || (!text.trim() && !image)}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                    {isSendinMessageLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <SendIcon className="w-4 h-4" />
                    )}
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                />
            </form>

            {/* Drag overlay */}
            {isDragging && (
                <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-sm rounded-2xl border-2 border-dashed border-cyan-500 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <p className="text-cyan-400 text-sm font-medium">Drop image here</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MessageInput;
