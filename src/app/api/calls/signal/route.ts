import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CallSignal } from '@/models/CallSignal';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action, userId, targetUserId, callType, offer, answer, candidate, callId } = body;

    // 1. INITIATE CALL (Caller creates offer in MongoDB Atlas)
    if (action === 'call') {
      if (!userId || !targetUserId || !offer) {
        return NextResponse.json({ message: 'Missing parameters for call initiation' }, { status: 400 });
      }

      // Cleanup any active ringing calls for caller or target user
      await CallSignal.deleteMany({
        $or: [{ callerId: userId }, { receiverId: userId }, { callerId: targetUserId }, { receiverId: targetUserId }],
        status: 'ringing',
      });

      const id = `call_${userId}_${targetUserId}_${Date.now()}`;
      const newCall = await CallSignal.create({
        callId: id,
        callerId: userId,
        callerName: body.callerName || 'User',
        callerAvatar: body.callerAvatar || '',
        receiverId: targetUserId,
        callType: callType || 'audio',
        offer,
        callerCandidates: [],
        receiverCandidates: [],
        status: 'ringing',
      });

      return NextResponse.json({ success: true, callId: id, call: newCall });
    }

    // 2. POLL ACTIVE CALL & REMOTE ICE CANDIDATES
    if (action === 'poll') {
      if (!userId) {
        return NextResponse.json({ message: 'User ID required' }, { status: 400 });
      }

      // Find ringing or connected call involving user
      let call = null;
      if (callId) {
        call = await CallSignal.findOne({ callId });
      }

      if (!call) {
        // Find latest active call where user is receiver or caller
        call = await CallSignal.findOne({
          $or: [{ receiverId: userId }, { callerId: userId }],
          status: { $in: ['ringing', 'connected'] },
        }).sort({ createdAt: -1 });
      }

      if (call) {
        const isCaller = call.callerId === userId;
        const isReceiver = call.receiverId === userId;

        return NextResponse.json({
          activeCall: {
            id: call.callId,
            callerId: call.callerId,
            callerName: call.callerName,
            callerAvatar: call.callerAvatar,
            receiverId: call.receiverId,
            callType: call.callType,
            offer: call.offer,
            answer: call.answer,
            status: call.status,
          },
          role: isCaller ? 'caller' : 'receiver',
          remoteCandidates: isCaller ? call.receiverCandidates : call.callerCandidates,
        });
      }

      return NextResponse.json({ activeCall: null });
    }

    // 3. ANSWER CALL (Receiver saves answer in MongoDB)
    if (action === 'answer') {
      if (!callId || !answer) {
        return NextResponse.json({ message: 'Call ID and answer required' }, { status: 400 });
      }

      const call = await CallSignal.findOneAndUpdate(
        { callId },
        { answer, status: 'connected' },
        { new: true }
      );

      if (call) {
        return NextResponse.json({ success: true, call });
      }
      return NextResponse.json({ message: 'Call not found' }, { status: 404 });
    }

    // 4. ADD ICE CANDIDATE
    if (action === 'ice_candidate') {
      if (!callId || !candidate || !userId) {
        return NextResponse.json({ message: 'Call ID, candidate, and userId required' }, { status: 400 });
      }

      const call = await CallSignal.findOne({ callId });
      if (call) {
        if (call.callerId === userId) {
          await CallSignal.updateOne({ callId }, { $push: { callerCandidates: candidate } });
        } else {
          await CallSignal.updateOne({ callId }, { $push: { receiverCandidates: candidate } });
        }
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ message: 'Call not found' }, { status: 404 });
    }

    // 5. END / DECLINE CALL
    if (action === 'end' || action === 'decline') {
      if (callId) {
        await CallSignal.findOneAndUpdate(
          { callId },
          { status: action === 'decline' ? 'declined' : 'ended' }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Call Signal API Error:', error);
    return NextResponse.json({ message: error.message || 'Call signal error' }, { status: 500 });
  }
}
