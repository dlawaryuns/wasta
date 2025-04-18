import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Bid {
  userId: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status || !['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        bids: {
          where: {
            status: 'ACCEPTED',
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to update task status
    const isClient = task.clientId === session.user.id;
    const isTasker = task.bids.some((bid: Bid) => bid.userId === session.user.id);

    if (!isClient && !isTasker) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate status transitions
    if (isClient) {
      if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Only taskers can update task to this status' },
          { status: 403 }
        );
      }
    }

    if (isTasker) {
      if (status === 'PENDING' || status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Only clients can update task to this status' },
          { status: 403 }
        );
      }

      if (status === 'IN_PROGRESS' && task.status !== 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Task must be accepted before starting' },
          { status: 400 }
        );
      }

      if (status === 'COMPLETED' && task.status !== 'IN_PROGRESS') {
        return NextResponse.json(
          { error: 'Task must be in progress before completing' },
          { status: 400 }
        );
      }
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { status },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 