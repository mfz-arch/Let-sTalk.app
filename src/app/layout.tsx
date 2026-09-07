import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import { CallProvider } from '../context/CallContext';
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
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <ChatProvider>
            <StoryProvider>
              <CallProvider>
                {children}
                <GlobalCallOverlay />
              </CallProvider>
            </StoryProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
