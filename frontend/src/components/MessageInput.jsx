import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import {
    Send,
    Smile,
    Paperclip,
    X,
    Mic,
    Image as ImageIcon,
    Sticker,
    Check,
    BellOff
} from "lucide-react";

function MessageInput() {
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [file, setFile] = useState(null); // Generic file
    const [isDragging, setIsDragging] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showSendMenu, setShowSendMenu] = useState(false);
    const [sendMenuPos, setSendMenuPos] = useState({ x: 0, y: 0 });

    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const {
        sendMessage,
        isSendinMessageLoading,
        selectedUser,
        selectedChat,
        emitTyping,
        replyingTo,
        editingMessage,
        setReplyingTo,
        setEditingMessage,
        editMessage,
        drafts,
        saveDraft
    } = useChatStore();
    const typingTimeoutRef = useRef(null);
    const draftTimeoutRef = useRef(null);

    useEffect(() => {
        // Auto-resize textarea
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }, [text]);

    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.text || "");
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        } else {
            // Load draft for selected chat
            const chatId = selectedChat?._id || selectedUser?._id; // Use userId as fallback for 1:1
            if (chatId && drafts[chatId]) {
                setText(drafts[chatId]);
            } else {
                setText("");
            }
        }
    }, [editingMessage, selectedChat, selectedUser, drafts]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
        };
    }, []);

    const handleInputChange = (e) => {
        const newText = e.target.value;
        setText(newText);

        if (selectedUser || selectedChat) {
            // 1. Typing indicator
            emitTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                emitTyping(false);
            }, 3000);

            // 2. Draft saving (Debounced)
            if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
            draftTimeoutRef.current = setTimeout(() => {
                const chatId = selectedChat?._id || selectedUser?._id;
                if (chatId) {
                    saveDraft(chatId, newText);
                }
            }, 1500); // Save draft after 1.5s of inactivity
        }
    };

    const handleSendMessage = async (e, options = {}) => {
        if (e) e.preventDefault();

        if (!text.trim() && !image && !file) return;

        try {
            if (editingMessage) {
                await editMessage(editingMessage._id, text.trim());
            } else {
                await sendMessage({
                    text: text.trim(),
                    image: image,
                    fileUrl: file,
                    fileType: file ? 'file' : (image ? 'image' : 'text'),
                    fileName: file?.name,
                    fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : null,
                    receiverId: selectedUser?._id,
                    isSilent: options.isSilent || false,
                });
            }

            // Clear draft when sent
            const chatId = selectedChat?._id || selectedUser?._id;
            if (chatId) {
                saveDraft(chatId, ""); // Clear backend draft
            }

            setText("");
            setImage(null);
            setImagePreview(null);
            setFile(null);

            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            toast.error("Failed to send: " + error.message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleSendContextMenu = (e) => {
        e.preventDefault();
        if (!text.trim() && !image && !file) return;

        // Show menu above the send button
        const rect = e.currentTarget.getBoundingClientRect();
        setSendMenuPos({ x: rect.left, y: rect.top });
        setShowSendMenu(true);
    };

    const sendSilently = (e) => {
        handleSendMessage(e, { isSilent: true });
        setShowSendMenu(false);
    };

    const handleImageUpload = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
            setImage(e.target.result); // Base64 for image
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = (selectedFile) => {
        if (!selectedFile) return;

        if (selectedFile.type.startsWith('image/')) {
            handleImageUpload(selectedFile);
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error("File size should be less than 10MB");
            return;
        }

        setFile(selectedFile);
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

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const removeAttachment = () => {
        setImage(null);
        setImagePreview(null);
        setFile(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
                handleSendVoice(audioFile);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSendVoice = async (audioFile) => {
        if (!(selectedUser || selectedChat) || !audioFile) return;

        try {
            await sendMessage({
                fileUrl: audioFile,
                fileType: 'audio',
                fileName: 'Voice Message',
                fileSize: `${(audioFile.size / 1024).toFixed(2)} KB`,
            });
        } catch (error) {
            toast.error("Failed to send voice message");
        }
    };

    const handleVoiceRecord = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="border-t border-telegram-sidebar bg-telegram-sidebar relative">
            {/* Reply / Edit Preview */}
            {(replyingTo || editingMessage) && (
                <div className="px-4 py-2 border-b border-telegram-sidebar bg-telegram-hover/30 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                    <div className="w-1 self-stretch bg-telegram-blue rounded-full"></div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-telegram-blue uppercase tracking-wider mb-0.5">
                            {editingMessage ? "Edit Message" : `Reply to ${replyingTo.senderId?.name || "User"}`}
                        </p>
                        <p className="text-sm text-slate-300 truncate italic">
                            {editingMessage ? editingMessage.text : replyingTo.text}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (editingMessage) setEditingMessage(null);
                            else setReplyingTo(null);
                        }}
                        className="telegram-icon-button p-1 hover:bg-slate-700/50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image/File Preview */}
            {(imagePreview || file) && (
                <div className="px-4 py-2 border-b border-telegram-sidebar flex items-center gap-2">
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Upload preview"
                                className="max-w-xs h-32 object-cover rounded-lg"
                            />
                            <button
                                onClick={removeAttachment}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative flex items-center gap-3 bg-telegram-dark p-2 rounded-lg pr-8">
                            <div className="bg-telegram-blue p-2 rounded-full">
                                <Paperclip className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{file?.name}</p>
                                <p className="text-xs text-slate-400">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={removeAttachment}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Input Area */}
            <form
                onSubmit={handleSendMessage}
                className={`p-3 ${isDragging ? 'bg-telegram-hover' : ''} transition-colors duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex items-end gap-2">
                    {/* Attach Button */}
                    {!isRecording && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="telegram-icon-button p-2"
                            title="Attach file"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                    )}

                    {/* Text Input or Recording Status */}
                    {isRecording ? (
                        <div className="flex-1 flex items-center justify-center p-2 h-[40px] text-red-400 font-medium animate-pulse gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Recording Audio... (Click mic to stop and send)
                        </div>
                    ) : (
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                placeholder="Type a message..."
                                value={text}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                rows={1}
                                className="telegram-input w-full resize-none min-h-[40px] max-h-[120px] py-2 px-3 pr-10"
                            />

                            {/* Emoji Button */}
                            <button
                                type="button"
                                className="absolute right-2 bottom-2 telegram-icon-button p-1"
                                title="Add emoji"
                            >
                                <Smile className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        {!text.trim() && !image && !file ? (
                            <button
                                type="button"
                                onClick={handleVoiceRecord}
                                className={`telegram-icon-button p-2 ${isRecording ? 'text-red-500' : ''}`}
                                title={isRecording ? "Stop recording" : "Record voice"}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSendinMessageLoading || (!text.trim() && !image && !file)}
                                className="telegram-button p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Send message (Right click for options)"
                                onContextMenu={handleSendContextMenu}
                            >
                                {isSendinMessageLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    editingMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Send Options Menu */}
                {showSendMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowSendMenu(false)}
                        />
                        <div
                            className="absolute z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[160px] animate-in slide-in-from-bottom-2"
                            style={{
                                left: `${sendMenuPos.x - 140}px`,
                                top: `${sendMenuPos.y - 70}px`
                            }}
                        >
                            <button
                                type="button"
                                onClick={sendSilently}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                            >
                                <BellOff className="w-4 h-4 text-slate-400" />
                                Send Silently
                            </button>
                        </div>
                    </>
                )}

                {/* Drag Overlay */}
                {isDragging && (
                    <div className="absolute inset-0 bg-telegram-blue/10 border-2 border-dashed border-telegram-blue rounded-lg flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-telegram-blue mx-auto mb-2" />
                            <p className="text-sm text-slate-300">Drop files here</p>
                        </div>
                    </div>
                )}
            </form>

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Quick Actions Bar */}
            <div className="px-4 py-1.5 border-t border-telegram-sidebar flex items-center gap-4">
                <button className="telegram-icon-button p-1" title="Stickers">
                    <Sticker className="w-4 h-4" />
                </button>
                <button className="telegram-icon-button p-1" title="GIFs">
                    <span className="text-[10px] font-bold text-slate-400 border border-slate-500 px-0.5 rounded leading-none">GIF</span>
                </button>
                <button className="telegram-icon-button p-1" title="Commands">
                    <span className="text-xs font-bold text-slate-400">/</span>
                </button>
            </div>
        </div>
    );
}

export default MessageInput;
