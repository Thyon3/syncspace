import React, { useState, useRef } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';

function VoiceRecorder({ onSend }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            clearInterval(timerRef.current);
            setIsRecording(false);

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                onSend(audioBlob);
            };
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            clearInterval(timerRef.current);
            setIsRecording(false);
            audioChunksRef.current = [];
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isRecording) {
        return (
            <div className="flex items-center gap-3 bg-red-600/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                </div>
                <button
                    onClick={cancelRecording}
                    className="p-2 hover:bg-slate-700 rounded transition"
                >
                    <X size={20} />
                </button>
                <button
                    onClick={stopRecording}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                    <Send size={20} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={startRecording}
            className="p-2 hover:bg-slate-700 rounded transition"
            title="Record voice message"
        >
            <Mic size={20} />
        </button>
    );
}

export default VoiceRecorder;
