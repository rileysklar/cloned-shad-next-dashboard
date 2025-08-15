import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clerk = await clerkClient();
    const userListRaw = await clerk.users.getUserList();
    const userList = userListRaw.data.map((user: any) => ({
      id: user.id,
      name:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.username ||
        user.id,
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl
    }));
    return NextResponse.json(userList);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
