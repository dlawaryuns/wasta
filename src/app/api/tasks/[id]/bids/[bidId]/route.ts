import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { client: true },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.clientId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (task.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Task is not in pending state' },
        { status: 400 }
      );
    }

    const bid = await prisma.bid.findUnique({
      where: { id: params.bidId },
    });

    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    if (bid.taskId !== params.id) {
      return NextResponse.json(
        { error: 'Bid does not belong to this task' },
        { status: 400 }
      );
    }

    // Update bid status
    await prisma.bid.update({
      where: { id: params.bidId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      },
    });

    // If bid is accepted, update task status and reject other bids
    if (action === 'accept') {
      await prisma.$transaction([
        prisma.task.update({
          where: { id: params.id },
          data: { status: 'ACCEPTED' },
        }),
        prisma.bid.updateMany({
          where: {
            taskId: params.id,
            id: { not: params.bidId },
          },
          data: { status: 'REJECTED' },
        }),
      ]);
    }

    // Fetch updated task with all related data
    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
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
    console.error('Error updating bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 