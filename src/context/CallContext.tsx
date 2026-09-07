'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User } from '../types/user';
import { useAuth } from './AuthContext';

interface ActiveCallData {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  callType: 'audio' | 'video';
  offer?: any;
  answer?: any;
  status: 'ringing' | 'connected' | 'ended' | 'declined';
}

interface CallContextType {
  activeCall: ActiveCallData | null;
  callRole: 'caller' | 'receiver' | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
  initiateCall: (targetUser: User, callType: 'audio' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState<ActiveCallData | null>(null);
  const [callRole, setCallRole] = useState<'caller' | 'receiver' | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up streams & peer connection
  const cleanupCallState = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setActiveCall(null);
    setCallRole(null);
    setCallSeconds(0);
    setIsMuted(false);
    setIsVideoOff(false);

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, [localStream]);

  // Duration Timer when call is connected
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      if (!durationTimerRef.current) {
        durationTimerRef.current = setInterval(() => {
          setCallSeconds((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
  }, [activeCall?.status]);

  // Global listener for incoming calls or answer status updates
  useEffect(() => {
    if (!user) return;

    const pollCallSignal = async () => {
      try {
        const res = await fetch('/api/calls/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'poll',
            userId: user.id,
            callId: activeCall?.id,
          }),
        });

        if (!res.ok) return;
        const data = await res.json();
        const call: ActiveCallData | null = data.activeCall;

        if (call) {
          // 1. Incoming Call received
          if (!activeCall && call.receiverId === user.id && call.status === 'ringing') {
            setActiveCall(call);
            setCallRole('receiver');
          }

          // 2. Caller detects recipient answered
          if (activeCall && callRole === 'caller' && call.status === 'connected' && activeCall.status === 'ringing') {
            setActiveCall(call);
            if (call.answer && peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'stable') {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(call.answer));
            }
          }

          // 3. Call ended or declined by other side
          if (activeCall && (call.status === 'ended' || call.status === 'declined')) {
            cleanupCallState();
          }
        } else if (activeCall && activeCall.status !== 'ringing') {
          // Call no longer exists on server
          cleanupCallState();
        }
      } catch (err) {
        console.error('Call Signal Poll Error:', err);
      }
    };

    pollTimerRef.current = setInterval(pollCallSignal, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [user, activeCall, callRole, cleanupCallState]);

  // INITIATE CALL (Caller)
  const initiateCall = async (targetUser: User, callType: 'audio' | 'video') => {
    if (!user) return;

    try {
      // 1. Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
      setLocalStream(stream);

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote stream tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Create SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send Call signal
      const res = await fetch('/api/calls/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call',
          userId: user.id,
          callerName: user.name,
          callerAvatar: user.avatar,
          targetUserId: targetUser.id,
          callType,
          offer,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveCall(data.call);
        setCallRole('caller');

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            fetch('/api/calls/signal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'ice_candidate',
                callId: data.callId,
                userId: user.id,
                candidate: event.candidate,
              }),
            }).catch(console.error);
          }
        };
      }
    } catch (err: any) {
      console.error('Initiate Call Error:', err);
      alert(`Could not start call: ${err.message || 'Microphone/Camera permission denied'}`);
      cleanupCallState();
    }
  };

  // ACCEPT INCOMING CALL (Receiver)
  const acceptCall = async () => {
    if (!user || !activeCall) return;

    try {
      // 1. Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: activeCall.callType === 'video',
      });
      setLocalStream(stream);

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Set remote description (Caller's Offer)
      if (activeCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(activeCall.offer));
      }

      // Create Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send Answer signal
      await fetch('/api/calls/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          callId: activeCall.id,
          userId: user.id,
          answer,
        }),
      });

      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch('/api/calls/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ice_candidate',
              callId: activeCall.id,
              userId: user.id,
              candidate: event.candidate,
            }),
          }).catch(console.error);
        }
      };
    } catch (err: any) {
      console.error('Accept Call Error:', err);
      alert(`Could not answer call: ${err.message || 'Permission denied'}`);
      declineCall();
    }
  };

  // DECLINE CALL
  const declineCall = async () => {
    if (activeCall) {
      fetch('/api/calls/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          callId: activeCall.id,
        }),
      }).catch(console.error);
    }
    cleanupCallState();
  };

  // END CALL
  const endCall = async () => {
    if (activeCall) {
      fetch('/api/calls/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          callId: activeCall.id,
        }),
      }).catch(console.error);
    }
    cleanupCallState();
  };

  // MUTE / UNMUTE MICROPHONE
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // TOGGLE CAMERA VIDEO
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        callRole,
        localStream,
        remoteStream,
        callSeconds,
        isMuted,
        isVideoOff,
        initiateCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
