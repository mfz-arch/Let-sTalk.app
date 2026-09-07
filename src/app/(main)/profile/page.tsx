'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Edit3, Phone, ShieldCheck, LogOut, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useStories } from '../../../context/StoryContext';
import { Avatar } from '../../../components/common/Avatar';
import { Button } from '../../../components/common/Button';
import { EditProfileModal } from '../../../components/profile/EditProfileModal';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { stories, openStoryViewer } = useStories();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'settings'>('stories');

  if (!user) return null;

  const myStoryGroup = stories.find((s) => s.userId === user.id);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Profile Header Banner Card */}
      <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Banner Cover */}
        <div className="h-36 bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-950 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-4">
            <Avatar
              src={user.avatar}
              alt={user.name}
              size="2xl"
              showStatus
              onlineStatus={user.onlineStatus}
              className="ring-4 ring-zinc-950 shadow-2xl"
            />

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                leftIcon={<Edit3 className="w-4 h-4 text-indigo-400" />}
              >
                Edit Profile
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => logout()}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Log Out
              </Button>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
              <p className="text-xs text-indigo-400 font-semibold">@{user.username}</p>
            </div>

            {user.bio && (
              <p className="text-xs md:text-sm text-zinc-300 max-w-lg leading-relaxed">
                {user.bio}
              </p>
            )}

            <div className="flex items-center space-x-4 pt-2 text-xs text-zinc-400">
              <div className="flex items-center space-x-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.countryCode} {user.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified User</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800/80 pb-2">
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'stories'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>My Stories</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Account Information
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'stories' ? (
        <div className="space-y-3">
          {!myStoryGroup || myStoryGroup.slides.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl border border-zinc-800 text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-300 font-semibold">No active stories posted</p>
              <p className="text-xs text-zinc-500">Share your first story with your friends using the Share Story button!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {myStoryGroup.slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => openStoryViewer(myStoryGroup, idx)}
                  className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group border border-zinc-800"
                >
                  <Image src={slide.mediaUrl} alt="My story slide" fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="text-[11px] font-medium truncate">{slide.caption || 'Story slide'}</p>
                    <span className="text-[9px] text-zinc-400">{slide.viewsCount} views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Account Credentials</h3>
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500 font-medium">User ID</span>
              <span className="font-mono text-zinc-200">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500 font-medium">Country Code</span>
              <span className="font-semibold text-zinc-200">{user.countryCode}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500 font-medium">Registered Phone</span>
              <span className="font-semibold text-zinc-200">{user.phoneNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-500 font-medium">Joined Date</span>
              <span className="text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
}
