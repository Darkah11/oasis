import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const chats = await Chat.find({
      participants: decoded.id,
    })
      .populate('participants', 'name email avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Format chat names for direct chats
    const formattedChats = chats.map((chat: any) => {
      if (chat.type === 'direct') {
        const otherParticipant = chat.participants.find((p: any) => {
          if (!p) return false;
          const pId = (p._id || p).toString();
          return pId !== decoded.id;
        });

        return {
          id: chat._id,
          name: otherParticipant?.name || 'Unknown User',
          avatar: otherParticipant?.avatar || '',
          type: chat.type,
          participants: chat.participants,
          lastMessage: chat.lastMessage,
          unreadCount: 0,
        };
      }
      return {
        id: chat._id,
        name: chat.name,
        avatar: chat.avatar,
        type: chat.type,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        unreadCount: 0,
      };
    });

    return NextResponse.json({ chats: formattedChats });
  } catch (error: any) {
    console.error('Fetch chats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const { participantId } = await req.json();

    const token = authHeader?.split(' ')[1];
    const decoded: any = verifyToken(token!);

    await connectDB();

    // Check if direct chat already exists
    let chat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [decoded.id, participantId] },
    });

    if (!chat) {
      chat = await Chat.create({
        type: 'direct',
        participants: [decoded.id, participantId],
      });
    }

    const populatedChat = await Chat.findById(chat._id).populate('participants', 'name email avatar status');

    let chatName = '';
    let chatAvatar = '';

    if (populatedChat.type === 'direct') {
      const otherParticipant = populatedChat.participants.find((p: any) => p._id.toString() !== decoded.id);
      chatName = otherParticipant?.name || 'Unknown User';
      chatAvatar = otherParticipant?.avatar || '';
    }

    const formattedChat = {
      id: populatedChat._id,
      name: chatName || populatedChat.name,
      avatar: chatAvatar || populatedChat.avatar,
      type: populatedChat.type,
      participants: populatedChat.participants,
      unreadCount: 0,
    };

    return NextResponse.json({ chat: formattedChat });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
