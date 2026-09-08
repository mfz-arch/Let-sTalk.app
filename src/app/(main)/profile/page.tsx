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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Banner Cover */}
        <div className="h-36 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 relative">
          <div className="absolute inset-0 bg-black/10" />
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
              className="ring-4 ring-white shadow-md"
            />

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                leftIcon={<Edit3 className="w-4 h-4 text-emerald-600" />}
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
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
              <p className="text-xs text-emerald-700 font-semibold">@{user.username}</p>
            </div>

            {user.bio && (
              <p className="text-xs md:text-sm text-slate-600 max-w-lg leading-relaxed">
                {user.bio}
              </p>
            )}

            <div className="flex items-center space-x-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user.countryCode} {user.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified User</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'stories'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>My Stories</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Account Information
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'stories' ? (
        <div className="space-y-3">
          {!myStoryGroup || myStoryGroup.slides.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2 shadow-xs">
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-800 font-semibold">No active stories posted</p>
              <p className="text-xs text-slate-500">Share your first story with your friends using the Share Story button!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {myStoryGroup.slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => openStoryViewer(myStoryGroup, idx)}
                  className="relative h-48 rounded-xl overflow-hidden cursor-pointer group border border-slate-200"
                >
                  <Image src={slide.mediaUrl} alt="My story slide" fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="text-[11px] font-medium truncate">{slide.caption || 'Story slide'}</p>
                    <span className="text-[9px] text-slate-300">{slide.viewsCount} views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Credentials</h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">User ID</span>
              <span className="font-mono text-slate-800">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Country Code</span>
              <span className="font-semibold text-slate-800">{user.countryCode}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Registered Phone</span>
              <span className="font-semibold text-slate-800">{user.phoneNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Joined Date</span>
              <span className="text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
}
