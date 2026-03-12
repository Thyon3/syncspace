import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function CallInterface({ call, onEndCall, socket }) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(call?.type === 'video');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [callStatus, setCallStatus] = useState(call?.status || 'connecting');
    const [callDuration, setCallDuration] = useState(0);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (call) {
            initializeCall();
        }

        return () => {
            cleanup();
        };
    }, [call]);

    useEffect(() => {
        let interval;
        if (callStatus === 'connected' && startTimeRef.current) {
            interval = setInterval(() => {
                setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const initializeCall = async () => {
        try {
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: call.type === 'video',
                audio: true
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Initialize WebRTC peer connection
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            peerConnectionRef.current = peerConnection;

            // Add local stream to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                const [remoteStream] = event.streams;
                setRemoteStream(remoteStream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            };

            // Handle connection state changes
            peerConnection.onconnectionstatechange = () => {
                if (peerConnection.connectionState === 'connected') {
                    setCallStatus('connected');
                    startTimeRef.current = Date.now();
                }
            };

            setCallStatus('ready');
        } catch (error) {
            console.error('Error initializing call:', error);
            toast.error('Failed to access camera/microphone');
            onEndCall();
        }
    };

    const answerCall = async () => {
        try {
            await axiosInstance.post(`/calls/${call._id}/answer`);
            setCallStatus('connected');
            startTimeRef.current = Date.now();
        } catch (error) {
            toast.error('Failed to answer call');
        }
    };

    const declineCall = async () => {
        try {
            await axiosInstance.post(`/calls/${call._id}/decline`);
            onEndCall();
        } catch (error) {
            toast.error('Failed to decline call');
        }
    };

    const endCall = async () => {
        try {
            await axiosInstance.post(`/calls/${call._id}/end`, {
                endReason: 'normal'
            });
            onEndCall();
        } catch (error) {
            toast.error('Failed to end call');
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !isVideoEnabled;
                setIsVideoEnabled(!isVideoEnabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isAudioEnabled;
                setIsAudioEnabled(!isAudioEnabled);
            }
        }
    };

    const cleanup = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!call) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-center">
                <h2 className="text-xl font-semibold">{call.caller?.name || 'Unknown'}</h2>
                <p className="text-slate-400 capitalize">{callStatus}</p>
                {callStatus === 'connected' && (
                    <p className="text-sm text-slate-500">{formatDuration(callDuration)}</p>
                )}
            </div>

            {/* Video Area */}
            <div className="flex-1 relative">
                {call.type === 'video' ? (
                    <>
                        {/* Remote Video */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Local Video */}
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute top-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white"
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">
                                    {call.caller?.name?.charAt(0) || '?'}
                                </span>
                            </div>
                            <h3 className="text-2xl font-semibold">{call.caller?.name}</h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-slate-900">
                <div className="flex justify-center gap-4">
                    {callStatus === 'incoming' ? (
                        <>
                            <button
                                onClick={declineCall}
                                className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition"
                            >
                                <PhoneOff size={24} />
                            </button>
                            <button
                                onClick={answerCall}
                                className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition"
                            >
                                <Phone size={24} />
                            </button>
                        </>
                    ) : (
                        <>
                            {call.type === 'video' && (
                                <button
                                    onClick={toggleVideo}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                                        isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                                </button>
                            )}
                            
                            <button
                                onClick={toggleAudio}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                                    isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>

                            <button className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition">
                                <Volume2 size={20} />
                            </button>

                            <button
                                onClick={endCall}
                                className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition"
                            >
                                <PhoneOff size={24} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CallInterface;