import React, { useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X as XIcon, Image as ImageIcon, Send as SendIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function MessageInput() {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
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
            toast.error('Please select an image');
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

    return (
        <div className="w-full p-4 bg-slate-900 flex flex-col space-y-2">
            {/* Image Preview */}
            {image && (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden mx-auto">
                    <img src={image} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-slate-700 rounded-full p-1 hover:bg-slate-600 transition"
                    >
                        <XIcon className="w-4 h-4 text-white" />
                    </button>
                </div>
            )}
            {/* Input + Buttons */}
            <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2"
            >
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-400 outline-none"
                />

                {/* Image Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-slate-700 transition"
                >
                    <ImageIcon className="w-5 h-5 text-slate-200" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={isSendinMessageLoading}
                    className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SendIcon className="w-5 h-5 text-white" />
                </button>
            </form>
        </div>
    );
}

export default MessageInput;
