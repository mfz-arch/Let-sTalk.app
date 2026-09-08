'use client';

import React, { useEffect, useRef } from 'react';
import { PhoneOff, PhoneIncoming, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCall } from '../../context/CallContext';
import { Avatar } from '../common/Avatar';

export const GlobalCallOverlay: React.FC = () => {
  const {
    activeCall,
    callRole,
    localStream,
    remoteStream,
    callSeconds,
    isMuted,
    isVideoOff,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamically update remote video stream whenever remoteStream arrives or updates
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => console.log('Remote video play error:', err));
    }
  }, [remoteStream]);

  // Dynamically update remote audio stream
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => console.log('Remote audio play error:', err));
    }
  }, [remoteStream]);

  // Dynamically update local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => console.log('Local video play error:', err));
    }
  }, [localStream]);

  // Ref callbacks for initial mounting
  const setLocalVideoNode = (node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && localStream) {
      node.srcObject = localStream;
      node.play().catch(console.error);
    }
  };

  const setRemoteVideoNode = (node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteStream) {
      node.srcObject = remoteStream;
      node.play().catch(console.error);
    }
  };

  const setRemoteAudioNode = (node: HTMLAudioElement | null) => {
    remoteAudioRef.current = node;
    if (node && remoteStream) {
      node.srcObject = remoteStream;
      node.play().catch(console.error);
    }
  };

  if (!activeCall) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const isVideo = activeCall.callType === 'video';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Audio element for remote audio stream during voice/video call */}
        <audio ref={setRemoteAudioNode} autoPlay playsInline className="hidden" />

        {/* INCOMING CALL MODAL (For Receiver when Ringing) */}
        {callRole === 'receiver' && activeCall.status === 'ringing' ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-sm h-[480px] glass-panel rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/40 flex flex-col justify-between p-6 text-center"
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Incoming {isVideo ? 'Video' : 'Audio'} Call
              </span>
              <p className="text-xs text-zinc-300 font-semibold animate-pulse">
                {activeCall.callerName} is calling you...
              </p>
            </div>

            {/* Caller Avatar & Ringing Waves */}
            <div className="flex flex-col items-center justify-center space-y-4 my-auto">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="absolute w-28 h-28 rounded-full bg-indigo-500/30 animate-pulse" />
                <Avatar
                  src={activeCall.callerAvatar || ''}
                  alt={activeCall.callerName}
                  size="2xl"
                  className="ring-4 ring-emerald-500 shadow-2xl relative z-10"
                />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">{activeCall.callerName}</h3>
                <p className="text-xs text-zinc-400">Let'sTalk {isVideo ? 'Video' : 'Voice'} Call</p>
              </div>
            </div>

            {/* Accept / Decline Action Buttons */}
            <div className="flex items-center justify-around pt-4">
              <button
                onClick={declineCall}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="p-4 bg-rose-600 group-hover:bg-rose-500 text-white rounded-full shadow-lg shadow-rose-600/30 transition-transform active:scale-95">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-zinc-400 group-hover:text-rose-400">Decline</span>
              </button>

              <button
                onClick={acceptCall}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="p-4 bg-emerald-600 group-hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 animate-bounce">
                  <PhoneIncoming className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-emerald-400 font-bold">Accept Call</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE / CALLING OVERLAY MODAL */
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-sm h-[520px] glass-panel rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col justify-between p-6 text-center"
          >
            {/* Real-time Video Canvas background if Video Call */}
            {isVideo && (
              <video
                ref={setRemoteVideoNode}
                autoPlay
                playsInline
                className={`absolute inset-0 w-full h-full object-cover z-0 rounded-3xl transition-opacity duration-300 ${
                  remoteStream ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {/* Small Local Video Pip Preview */}
            {isVideo && localStream && (
              <div className="absolute top-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-zinc-900">
                <video
                  ref={setLocalVideoNode}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Overlay Gradient for Text readability */}
            {isVideo && remoteStream && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-10 pointer-events-none" />
            )}

            {/* Header Call Status */}
            <div className="relative z-20 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Let'sTalk {isVideo ? 'Video' : 'Audio'} Call
              </span>
              <p className="text-xs text-zinc-300 font-medium">
                {activeCall.status === 'ringing'
                  ? 'Calling... Waiting for answer'
                  : formatTimer(callSeconds)}
              </p>
            </div>

            {/* Avatar (shown if Audio call or before video connects) */}
            {(!isVideo || !remoteStream) && (
              <div className="relative z-20 flex flex-col items-center justify-center space-y-4 my-auto">
                <div className="relative flex items-center justify-center">
                  {activeCall.status === 'ringing' && (
                    <>
                      <div className="absolute w-36 h-36 rounded-full bg-indigo-600/20 animate-ping" />
                      <div className="absolute w-28 h-28 rounded-full bg-violet-600/30 animate-pulse" />
                    </>
                  )}
                  <Avatar
                    src={activeCall.callerAvatar || ''}
                    alt={activeCall.callerName}
                    size="2xl"
                    className="ring-4 ring-indigo-500/50 shadow-2xl relative z-10"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-white">{activeCall.callerName}</h3>
                  <p className="text-xs text-zinc-400">
                    {activeCall.status === 'ringing' ? 'Ringing...' : 'Connected'}
                  </p>
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="relative z-20 flex items-center justify-center space-x-5 pt-4">
              {/* Mute Mic */}
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-full transition-colors ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Toggle Video */}
              {isVideo ? (
                <button
                  onClick={toggleVideo}
                  className={`p-3.5 rounded-full transition-colors ${
                    isVideoOff ? 'bg-amber-500 text-white' : 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              ) : (
                <button
                  className="p-3.5 bg-zinc-800/90 text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
                  title="Speaker"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
