'use client';

import React, { useEffect, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types/user';
import { Avatar } from '../common/Avatar';

interface CallOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User;
  callType: 'audio' | 'video';
}

export const CallOverlayModal: React.FC<CallOverlayModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  callType,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCallState('ringing');
      setSeconds(0);
      return;
    }

    // Simulate answer after 2.5s
    const answerTimer = setTimeout(() => {
      setCallState('connected');
    }, 2500);

    return () => clearTimeout(answerTimer);
  }, [isOpen]);

  useEffect(() => {
    if (callState !== 'connected' || !isOpen) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState, isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Call Modal Box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative z-10 w-full max-w-sm h-[500px] glass-panel rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col justify-between p-6 text-center"
        >
          {/* Header Status */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
              Let'sTalk {callType === 'video' ? 'Video' : 'Audio'} Call
            </span>
            <p className="text-xs text-zinc-400 font-medium">
              {callState === 'ringing' ? 'Calling...' : formatTimer(seconds)}
            </p>
          </div>

          {/* Participant Avatar & Ringing Animation */}
          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="relative flex items-center justify-center">
              {callState === 'ringing' && (
                <div className="absolute w-32 h-32 rounded-full bg-indigo-600/30 animate-ping" />
              )}
              <Avatar
                src={targetUser.avatar}
                alt={targetUser.name}
                size="2xl"
                className="ring-4 ring-indigo-500/50 shadow-2xl relative z-10"
              />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">{targetUser.name}</h3>
              <p className="text-xs text-zinc-400">@{targetUser.username}</p>
            </div>
          </div>

          {/* Call Action Controls */}
          <div className="flex items-center justify-center space-x-5 pt-4">
            {/* Mute Mic */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full transition-colors ${
                isMuted ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={onClose}
              className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Toggle Video (if video call) */}
            {callType === 'video' ? (
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-full transition-colors ${
                  isVideoOff ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            ) : (
              <button
                className="p-3.5 bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
                title="Speaker"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
