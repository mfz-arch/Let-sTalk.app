'use client';

import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';
import Image from 'next/image';

interface MessageInputProps {
  onSend: (text: string, mediaUrl?: string) => Promise<void>;
  disabled?: boolean;
}

const EMOJI_LIST = ['👍', '❤️', '🔥', '😂', '🎉', '👋', '🚀', '😍', '🙌', '✨'];

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !mediaPreview) || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(text.trim(), mediaPreview || undefined);
      setText('');
      setMediaPreview(null);
      setShowEmojiPicker(false);
    } finally {
      setIsSending(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  return (
    <div className="relative p-3 glass-panel border-t border-zinc-800">
      {/* Emoji Quick Picker Dropdown */}
      {showEmojiPicker && (
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
      {mediaPreview && (
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

        {/* Main Text Input */}
        <input
          type="text"
          placeholder="Write a message..."
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
    </div>
  );
};
