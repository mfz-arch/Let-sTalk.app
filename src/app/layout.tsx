import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { ChatProvider } from '../context/ChatContext';
import { CallProvider } from '../context/CallContext';
import { StoryProvider } from '../context/StoryContext';
import { GlobalCallOverlay } from '../components/chat/GlobalCallOverlay';

export const metadata: Metadata = {
  title: "Let'sTalk — Real-Time Social Messaging & Story-Sharing Platform",
  description: "Private real-time social messaging app to chat with friends and share temporary stories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>
              <StoryProvider>
                <CallProvider>
                  {children}
                  <GlobalCallOverlay />
                </CallProvider>
              </StoryProvider>
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
