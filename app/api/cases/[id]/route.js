import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/cases/[id] - Get full case details
export async function GET(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const caseData = await prisma.case.findUnique({
            where: { id },
            include: {
                category: true,
                user: { select: { id: true, name: true, email: true, state: true, city: true } },
                messages: { orderBy: { timestamp: 'asc' } },
                documents: { include: { uploadedBy: { select: { name: true } } }, orderBy: { uploadedAt: 'desc' } },
                timeline: { include: { createdBy: { select: { name: true } } }, orderBy: { timestamp: 'desc' } },
                assignments: {
                    include: { lawyer: { include: { user: { select: { id: true, name: true, email: true } } } } }
                }
            }
        });

        if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

        // Authorization: check if user owns the case or is an assigned lawyer
        const isOwner = caseData.userId === user.userId;
        const isAssigned = caseData.assignments.some(a =>
            a.lawyer.userId === user.userId && a.status === 'ACCEPTED'
        );
        const isPending = caseData.assignments.some(a =>
            a.lawyer.userId === user.userId && a.status === 'PENDING'
        );

        if (!isOwner && !isAssigned && !isPending) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ case: caseData, access: { isOwner, isAssigned, isPending } });
    } catch (error) {
        console.error('Get case error:', error);
        return NextResponse.json({ error: 'Failed to fetch case' }, { status: 500 });
    }
}

// PUT /api/cases/[id] - Update case
export async function PUT(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const existing = await prisma.case.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        if (existing.userId !== user.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();
        const updated = await prisma.case.update({
            where: { id },
            data: {
                status: body.status || existing.status,
                lawyerMode: body.lawyerMode || existing.lawyerMode,
                isUrgent: body.isUrgent !== undefined ? body.isUrgent : existing.isUrgent,
                aiSummary: body.aiSummary || existing.aiSummary,
            }
        });

        if (body.status && body.status !== existing.status) {
            await prisma.timelineEvent.create({
                data: {
                    caseId: id,
                    createdById: user.userId,
                    eventDescription: `Case status changed from ${existing.status} to ${body.status}`,
                    eventType: 'STATUS_CHANGE'
                }
            });
        }

        return NextResponse.json({ case: updated });
    } catch (error) {
        console.error('Update case error:', error);
        return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
    }
}
