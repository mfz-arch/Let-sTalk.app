import { NextResponse } from 'next/server';

// In-memory call signaling store for active WebRTC calls
interface ActiveCall {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  callType: 'audio' | 'video';
  offer?: any;
  answer?: any;
  callerCandidates: any[];
  receiverCandidates: any[];
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  updatedAt: number;
}

// Global active calls map
const activeCalls = new Map<string, ActiveCall>();

// Cleanup stale calls (> 2 minutes)
function cleanupStaleCalls() {
  const now = Date.now();
  for (const [id, call] of activeCalls.entries()) {
    if (now - call.updatedAt > 120000 || call.status === 'ended' || call.status === 'declined') {
      activeCalls.delete(id);
    }
  }
}

export async function POST(request: Request) {
  try {
    cleanupStaleCalls();
    const body = await request.json();
    const { action, userId, targetUserId, callType, offer, answer, candidate, callId } = body;

    // 1. INITIATE CALL (Caller sends offer)
    if (action === 'call') {
      if (!userId || !targetUserId || !offer) {
        return NextResponse.json({ message: 'Missing parameters for call initiation' }, { status: 400 });
      }

      const id = `${userId}_${targetUserId}_${Date.now()}`;
      const newCall: ActiveCall = {
        id,
        callerId: userId,
        callerName: body.callerName || 'User',
        callerAvatar: body.callerAvatar || '',
        receiverId: targetUserId,
        callType: callType || 'audio',
        offer,
        callerCandidates: [],
        receiverCandidates: [],
        status: 'ringing',
        updatedAt: Date.now(),
      };

      activeCalls.set(id, newCall);
      return NextResponse.json({ success: true, callId: id, call: newCall });
    }

    // 2. CHECK FOR INCOMING CALL OR ACTIVE CALL STATUS
    if (action === 'poll') {
      if (!userId) {
        return NextResponse.json({ message: 'User ID required' }, { status: 400 });
      }

      // Check if user is receiver of a ringing call or participant in active call
      for (const call of activeCalls.values()) {
        const isCaller = call.callerId === userId;
        const isReceiver = call.receiverId === userId;

        if (isReceiver && call.status === 'ringing') {
          return NextResponse.json({
            activeCall: call,
            role: 'receiver',
            remoteCandidates: call.callerCandidates,
          });
        }
        if ((isCaller || isReceiver) && callId && call.id === callId) {
          return NextResponse.json({
            activeCall: call,
            role: isCaller ? 'caller' : 'receiver',
            remoteCandidates: isCaller ? call.receiverCandidates : call.callerCandidates,
          });
        }
      }

      return NextResponse.json({ activeCall: null });
    }

    // 3. ANSWER CALL (Receiver sends answer)
    if (action === 'answer') {
      if (!callId || !answer) {
        return NextResponse.json({ message: 'Call ID and answer required' }, { status: 400 });
      }

      const call = activeCalls.get(callId);
      if (call) {
        call.answer = answer;
        call.status = 'connected';
        call.updatedAt = Date.now();
        return NextResponse.json({ success: true, call });
      }
      return NextResponse.json({ message: 'Call not found' }, { status: 404 });
    }

    // 4. ADD ICE CANDIDATE
    if (action === 'ice_candidate') {
      if (!callId || !candidate || !userId) {
        return NextResponse.json({ message: 'Call ID, candidate, and userId required' }, { status: 400 });
      }

      const call = activeCalls.get(callId);
      if (call) {
        if (call.callerId === userId) {
          call.callerCandidates.push(candidate);
        } else {
          call.receiverCandidates.push(candidate);
        }
        call.updatedAt = Date.now();
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ message: 'Call not found' }, { status: 404 });
    }

    // 5. END / DECLINE CALL
    if (action === 'end' || action === 'decline') {
      if (callId && activeCalls.has(callId)) {
        const call = activeCalls.get(callId)!;
        call.status = action === 'decline' ? 'declined' : 'ended';
        call.updatedAt = Date.now();
        setTimeout(() => activeCalls.delete(callId), 3000);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Call Signal API Error:', error);
    return NextResponse.json({ message: error.message || 'Call signal error' }, { status: 500 });
  }
}
