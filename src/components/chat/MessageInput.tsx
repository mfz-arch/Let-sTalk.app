'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Smile, X, Mic, Trash2, CornerUpLeft } from 'lucide-react';
import Image from 'next/image';
import { Message } from '../../types/chat';

interface MessageInputProps {
  onSend: (text: string, mediaUrl?: string, type?: 'text' | 'image' | 'audio', replyTo?: Message['replyTo']) => Promise<void>;
  replyingToMessage?: Message | null;
  onCancelReply?: () => void;
  otherParticipantName?: string;
  disabled?: boolean;
}

const EMOJI_LIST = ['👍', '❤️', '🔥', '😂', '🎉', '👋', '🚀', '😍', '🙌', '✨'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  replyingToMessage,
  onCancelReply,
  otherParticipantName = 'User',
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setMediaPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recording access error:', err);
      alert('Unable to access microphone. Please check browser permissions.');
    }
  };

  const stopAndCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const audioBase64 = reader.result as string;
        if (audioBase64) {
          setIsSending(true);
          try {
            const replyObj = replyingToMessage
              ? {
                  id: replyingToMessage.id,
                  senderName: replyingToMessage.replyTo?.senderName || otherParticipantName,
                  content: replyingToMessage.content || 'Voice message',
                  mediaUrl: replyingToMessage.mediaUrl,
                  type: replyingToMessage.type,
                }
              : undefined;

            await onSend('🎙️ Voice message', audioBase64, 'audio', replyObj);
            if (onCancelReply) onCancelReply();
          } finally {
            setIsSending(false);
          }
        }
      };
      reader.readAsDataURL(audioBlob);

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingSeconds(0);
    };

    mediaRecorderRef.current.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !mediaPreview) || isSending || disabled) return;

    setIsSending(true);
    try {
      const type = mediaPreview ? 'image' : 'text';
      const replyObj = replyingToMessage
        ? {
            id: replyingToMessage.id,
            senderName: replyingToMessage.replyTo?.senderName || otherParticipantName,
            content: replyingToMessage.content || (replyingToMessage.type === 'image' ? '📷 Photo' : 'Voice message'),
            mediaUrl: replyingToMessage.mediaUrl,
            type: replyingToMessage.type,
          }
        : undefined;

      await onSend(text.trim(), mediaPreview || undefined, type, replyObj);
      setText('');
      setMediaPreview(null);
      setShowEmojiPicker(false);
      if (onCancelReply) onCancelReply();
    } finally {
      setIsSending(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative p-3 glass-panel border-t border-zinc-800">
      {/* WhatsApp Style Quoted Reply Preview Bar */}
      {replyingToMessage && !isRecording && (
        <div className="mb-2.5 p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-1.5 h-9 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 text-xs font-bold text-indigo-400">
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span className="truncate">Replying to {replyingToMessage.replyTo?.senderName || otherParticipantName}</span>
              </div>
              <p className="text-xs text-zinc-300 truncate">
                {replyingToMessage.type === 'audio'
                  ? '🎙️ Voice message'
                  : replyingToMessage.type === 'image'
                  ? '📷 Photo'
                  : replyingToMessage.content}
              </p>
            </div>
          </div>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors ml-2"
              title="Cancel Reply"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Emoji Quick Picker Dropdown */}
      {showEmojiPicker && !isRecording && (
        <div className="absolute bottom-full left-4 mb-2 p-2.5 glass-panel rounded-2xl border border-zinc-800 shadow-2xl flex items-center space-x-2 z-20">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-lg p-1.5 hover:bg-zinc-800 rounded-lg transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Media Attachment Preview Box */}
      {mediaPreview && !isRecording && (
        <div className="mb-2 relative inline-block">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-700 relative">
            <Image src={mediaPreview} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => setMediaPreview(null)}
            className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Recording Controls Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-zinc-900 border border-rose-500/40 rounded-2xl px-4 py-2.5 shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Recording {formatTimer(recordingSeconds)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={stopAndCancelRecording}
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-xl transition-colors"
              title="Cancel recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={stopAndSendRecording}
              disabled={isSending}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all flex items-center space-x-1"
              title="Send voice message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800/60 rounded-xl transition-colors"
            title="Attach Photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-colors ${
              showEmojiPicker ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
            title="Emojis"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Voice Record Mic Button */}
          <button
            type="button"
            onClick={startRecording}
            className="p-2.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 rounded-xl transition-colors"
            title="Record Voice Message"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Main Text Input */}
          <input
            type="text"
            placeholder={replyingToMessage ? `Replying to ${replyingToMessage.replyTo?.senderName || otherParticipantName}...` : 'Write a message...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            className="flex-1 glass-input px-4 py-2.5 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 outline-none border border-zinc-800 focus:border-indigo-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!text.trim() && !mediaPreview) || isSending || disabled}
            className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
