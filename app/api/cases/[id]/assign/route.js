import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST /api/cases/[id]/assign - Request lawyer assignment
export async function POST(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const { lawyerId, roleType } = await request.json();
        if (!lawyerId) return NextResponse.json({ error: 'lawyerId required' }, { status: 400 });

        // Check if already assigned
        const existing = await prisma.lawyerAssignment.findFirst({
            where: { caseId: id, lawyerId, status: { in: ['PENDING', 'ACCEPTED'] } }
        });
        if (existing) return NextResponse.json({ error: 'Lawyer already assigned' }, { status: 409 });

        const assignment = await prisma.lawyerAssignment.create({
            data: {
                caseId: id,
                lawyerId,
                roleType: roleType || 'LOCAL',
                status: 'PENDING'
            }
        });

        // Update case lawyer mode
        const assignments = await prisma.lawyerAssignment.findMany({
            where: { caseId: id, status: { in: ['PENDING', 'ACCEPTED'] } }
        });
        const roles = assignments.map(a => a.roleType);
        let lawyerMode = 'SELF';
        if (roles.includes('PRIMARY') && roles.includes('LOCAL')) lawyerMode = 'BOTH';
        else if (roles.includes('PRIMARY')) lawyerMode = 'PRIMARY_ONLY';
        else if (roles.includes('LOCAL')) lawyerMode = 'LOCAL_ONLY';

        await prisma.case.update({ where: { id }, data: { lawyerMode, status: 'NEEDS_LAWYER' } });

        const lawyer = await prisma.lawyerProfile.findUnique({ where: { id: lawyerId }, include: { user: true } });
        await prisma.timelineEvent.create({
            data: {
                caseId: id,
                createdById: user.userId,
                eventDescription: `Lawyer assignment requested: ${lawyer?.user?.name || 'Unknown'} as ${roleType || 'LOCAL'}`,
                eventType: 'LAWYER_ASSIGNED'
            }
        });

        return NextResponse.json({ assignment }, { status: 201 });
    } catch (error) {
        console.error('Assignment error:', error);
        return NextResponse.json({ error: 'Failed to assign' }, { status: 500 });
    }
}
