'use client';

import React from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Sidebar } from '../../components/navigation/Sidebar';
import { MobileHeader } from '../../components/navigation/MobileHeader';
import { MobileBottomNav } from '../../components/navigation/MobileBottomNav';
import { StoryViewerModal } from '../../components/stories/StoryViewerModal';
import { StoryCreateModal } from '../../components/stories/StoryCreateModal';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
        {/* Desktop Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {/* Mobile Header */}
          <MobileHeader />

          {/* Main Page Content */}
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>

      {/* Global Story Modals */}
      <StoryViewerModal />
      <StoryCreateModal />
    </AuthGuard>
  );
}
