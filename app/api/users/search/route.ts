import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = verifyToken(token!);

    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!query) return NextResponse.json({ users: [] });

    await connectDB();

    const users = await User.find({
      $and: [
        { _id: { $ne: decoded.id } },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    }).select('name email avatar status').limit(10);

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
