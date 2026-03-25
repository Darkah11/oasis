import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Chat from '@/models/Chat';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = verifyToken(token!);

    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(50); // Pagination simplified

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const authHeader = req.headers.get('authorization');
    const { content, type, fileUrl, fileName } = await req.json();

    const token = authHeader?.split(' ')[1];
    const decoded: any = verifyToken(token!);

    await connectDB();

    const message = await Message.create({
      chatId,
      senderId: decoded.id,
      content,
      type: type || 'text',
      fileUrl,
      fileName,
    });

    // Update last message in Chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
