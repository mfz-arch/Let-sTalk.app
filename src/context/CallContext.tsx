'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User } from '../types/user';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { chatService } from '../services/chatService';

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

// Robust STUN + TURN relay servers for distant mobile networks & corporate firewalls
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
        'stun:stun.services.mozilla.com',
        'stun:stun.cloudflare.com:3478',
      ],
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay',
    },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 10,
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
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
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const processedCandidatesRef = useRef<Set<string>>(new Set());
  const missCountRef = useRef<number>(0);

  // Clean up WebRTC peer connection, media streams & timers
  const cleanupCallState = useCallback(() => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (err) {
        console.error('Error closing peer connection:', err);
      }
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
    pendingIceCandidatesRef.current = [];
    processedCandidatesRef.current.clear();
    missCountRef.current = 0;

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, [localStream]);

  // Buffer ICE candidates until setRemoteDescription completes
  const addOrBufferIceCandidate = useCallback(async (candidate: any) => {
    if (!candidate) return;
    const candStr = JSON.stringify(candidate);
    if (processedCandidatesRef.current.has(candStr)) return;
    processedCandidatesRef.current.add(candStr);

    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE Candidate directly:', err);
      }
    } else {
      pendingIceCandidatesRef.current.push(candidate);
    }
  }, []);

  // Flush queued ICE candidates once remote description is set
  const flushPendingIceCandidates = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) return;

    while (pendingIceCandidatesRef.current.length > 0) {
      const cand = pendingIceCandidatesRef.current.shift();
      if (cand) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.error('Error flushing pending ICE Candidate:', err);
        }
      }
    }
  }, []);

  // Timer for connected calls
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

  // REAL-TIME SOCKET.IO SIGNALING LISTENERS (Instant delivery <50ms)
  useEffect(() => {
    if (!socket || !user) return;

    const handleIncomingCall = (call: ActiveCallData) => {
      if (!activeCall && call.receiverId === user.id) {
        setActiveCall(call);
        setCallRole('receiver');
      }
    };

    const handleCallAccepted = async (data: { callId: string; answer: any }) => {
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'stable') {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushPendingIceCandidates();
        } catch (err) {
          console.error('Error setting remote answer from socket:', err);
        }
      }
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected', answer: data.answer } : null));
    };

    const handleReceiveIceCandidate = async (data: { candidate: any }) => {
      await addOrBufferIceCandidate(data.candidate);
    };

    const handleCallEndedOrDeclined = () => {
      cleanupCallState();
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('receive_ice_candidate', handleReceiveIceCandidate);
    socket.on('call_declined', handleCallEndedOrDeclined);
    socket.on('call_ended', handleCallEndedOrDeclined);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('receive_ice_candidate', handleReceiveIceCandidate);
      socket.off('call_declined', handleCallEndedOrDeclined);
      socket.off('call_ended', handleCallEndedOrDeclined);
    };
  }, [socket, user, activeCall, cleanupCallState, addOrBufferIceCandidate, flushPendingIceCandidates]);

  // HTTP POLLING SIGNALING FALLBACK (Runs every 1.5s - 2.5s)
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
        const remoteCandidates: any[] = data.remoteCandidates || [];

        if (call) {
          missCountRef.current = 0;

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
              await flushPendingIceCandidates();
            }
          }

          // 3. Process remote ICE candidates
          if (remoteCandidates.length > 0) {
            for (const candidate of remoteCandidates) {
              await addOrBufferIceCandidate(candidate);
            }
          }

          // 4. Call ended or declined
          if (activeCall && (call.status === 'ended' || call.status === 'declined')) {
            cleanupCallState();
          }
        } else if (activeCall && activeCall.status !== 'ringing') {
          // Require 3 consecutive misses before cleaning up active call to prevent network hiccup drop
          missCountRef.current += 1;
          if (missCountRef.current >= 3) {
            cleanupCallState();
          }
        }
      } catch (err) {
        console.error('Call Signal Poll Error:', err);
      }
    };

    // Fast poll (1.5s) when ringing/calling, slower (2.5s) when connected/idle
    const pollInterval = activeCall ? 1500 : 2500;
    pollTimerRef.current = setInterval(pollCallSignal, pollInterval);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [user, activeCall, callRole, cleanupCallState, addOrBufferIceCandidate, flushPendingIceCandidates]);

  // INITIATE CALL (Caller)
  const initiateCall = async (targetUser: User, callType: 'audio' | 'video') => {
    if (!user) return;

    // Immediately display "Calling..." ringing state on Caller's screen (<10ms UI latency)
    const tempCallId = `call_${user.id}_${targetUser.id}_${Date.now()}`;
    const initialCallData: ActiveCallData = {
      id: tempCallId,
      callerId: user.id,
      callerName: user.name,
      callerAvatar: user.avatar,
      receiverId: targetUser.id,
      callType,
      status: 'ringing',
    };

    setActiveCall(initialCallData);
    setCallRole('caller');

    try {
      // 1. Request local audio / video permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      setLocalStream(stream);

      // 2. Create RTCPeerConnection with STUN + TURN servers
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      let realCallId = tempCallId;

      // Handle incoming remote media tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else {
          setRemoteStream((prev) => {
            const newStream = prev || new MediaStream();
            newStream.addTrack(event.track);
            return newStream;
          });
        }
      };

      // Register ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Emit via Socket.io for instant delivery
          if (socket) {
            socket.emit('send_ice_candidate', {
              targetUserId: targetUser.id,
              candidate: event.candidate,
              callId: realCallId,
            });
          }

          // Fallback to HTTP API
          fetch('/api/calls/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ice_candidate',
              callId: realCallId,
              userId: user.id,
              candidate: event.candidate,
            }),
          }).catch(console.error);
        }
      };

      // Add local media tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Create SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Post SDP Offer to API
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
        realCallId = data.callId;
        const callObj = { ...data.call, id: data.callId };
        setActiveCall(callObj);

        // Emit call event over Socket.io
        if (socket) {
          socket.emit('call_user', {
            targetUserId: targetUser.id,
            call: callObj,
          });
        }
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
      // 1. Request local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: activeCall.callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      setLocalStream(stream);

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      const callerUserId = activeCall.callerId;

      pc.onicecandidate = (event) => {
        if (event.candidate && activeCall.id) {
          if (socket) {
            socket.emit('send_ice_candidate', {
              targetUserId: callerUserId,
              candidate: event.candidate,
              callId: activeCall.id,
            });
          }

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

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else {
          setRemoteStream((prev) => {
            const newStream = prev || new MediaStream();
            newStream.addTrack(event.track);
            return newStream;
          });
        }
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Set remote description (Caller's Offer)
      if (activeCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(activeCall.offer));
        await flushPendingIceCandidates();
      }

      // Create SDP Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send Answer over Socket.io & HTTP API
      if (socket) {
        socket.emit('accept_call', {
          targetUserId: callerUserId,
          callId: activeCall.id,
          answer,
        });
      }

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
    } catch (err: any) {
      console.error('Accept Call Error:', err);
      alert(`Could not answer call: ${err.message || 'Permission denied'}`);
      declineCall();
    }
  };

  // Log call history to chat
  const logCallToChat = async (statusText: string) => {
    if (!user || !activeCall) return;
    try {
      const conv = await chatService.getOrCreateConversation(
        user.id,
        callRole === 'caller' ? activeCall.receiverId : activeCall.callerId,
        user
      );
      if (conv) {
        await chatService.sendMessage(
          conv.id,
          user.id,
          callRole === 'caller' ? activeCall.receiverId : activeCall.callerId,
          statusText,
          'text'
        );
      }
    } catch (err) {
      console.error('Log Call Error:', err);
    }
  };

  // DECLINE CALL
  const declineCall = async () => {
    if (activeCall) {
      const targetUserId = callRole === 'caller' ? activeCall.receiverId : activeCall.callerId;

      if (socket) {
        socket.emit('decline_call', { targetUserId, callId: activeCall.id });
      }

      logCallToChat(`` + (activeCall.callType === 'video' ? '📹 Video' : '📞 Voice') + ` Call Declined / Missed`);

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
      const targetUserId = callRole === 'caller' ? activeCall.receiverId : activeCall.callerId;

      if (socket) {
        socket.emit('end_call', { targetUserId, callId: activeCall.id });
      }

      const formatMin = Math.floor(callSeconds / 60);
      const formatSec = callSeconds % 60;
      const durationStr = `${formatMin}:${formatSec.toString().padStart(2, '0')}`;
      logCallToChat(`📞 ${activeCall.callType === 'video' ? 'Video' : 'Voice'} Call (${durationStr})`);

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
