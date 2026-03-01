import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { classifyIssue, generateInitialGuidance } from '@/lib/ai-engine';

// GET /api/cases - List cases for the current user
export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        let cases;
        if (user.role === 'CITIZEN') {
            cases = await prisma.case.findMany({
                where: { userId: user.userId },
                include: {
                    category: true,
                    assignments: { include: { lawyer: { include: { user: true } } } },
                    _count: { select: { messages: true, documents: true, timeline: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Lawyer sees cases they're assigned to
            const profile = await prisma.lawyerProfile.findUnique({ where: { userId: user.userId } });
            if (!profile) return NextResponse.json({ cases: [] });

            const assignments = await prisma.lawyerAssignment.findMany({
                where: { lawyerId: profile.id, status: { in: ['PENDING', 'ACCEPTED'] } },
                include: {
                    case: {
                        include: {
                            category: true,
                            user: { select: { id: true, name: true, email: true, state: true, city: true } },
                            assignments: { include: { lawyer: { include: { user: true } } } },
                            _count: { select: { messages: true, documents: true, timeline: true } }
                        }
                    }
                }
            });
            cases = assignments.map(a => ({ ...a.case, assignmentStatus: a.status, assignmentRole: a.roleType }));
        }

        return NextResponse.json({ cases });
    } catch (error) {
        console.error('Get cases error:', error);
        return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
    }
}

// POST /api/cases - Create a new case
export async function POST(request) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'CITIZEN') return NextResponse.json({ error: 'Only citizens can create cases' }, { status: 403 });

    try {
        const { title, description, categoryId, stateOfIncident, city, isUrgent } = await request.json();

        if (!title || !description || !categoryId) {
            return NextResponse.json({ error: 'Title, description, and category are required' }, { status: 400 });
        }

        // Get the category for AI classification
        const category = await prisma.category.findUnique({ where: { id: categoryId } });

        const newCase = await prisma.case.create({
            data: {
                userId: user.userId,
                categoryId,
                title,
                description,
                stateOfIncident: stateOfIncident || '',
                city: city || '',
                isUrgent: isUrgent || false,
                status: 'OPEN',
                lawyerMode: 'SELF'
            },
            include: { category: true }
        });

        // Auto-create timeline event
        await prisma.timelineEvent.create({
            data: {
                caseId: newCase.id,
                createdById: user.userId,
                eventDescription: `Case created: ${title}`,
                eventType: 'STATUS_CHANGE'
            }
        });

        // Auto-generate AI initial guidance
        try {
            const categoryName = category ? category.name : classifyIssue(description);
            const aiGuidance = generateInitialGuidance(categoryName, description);

            // Save user's description as first message
            await prisma.message.create({
                data: {
                    caseId: newCase.id,
                    senderType: 'USER',
                    senderId: user.userId,
                    content: description
                }
            });

            // Save AI guidance as response
            await prisma.message.create({
                data: {
                    caseId: newCase.id,
                    senderType: 'AI',
                    content: aiGuidance
                }
            });

            // Summary timeline
            await prisma.timelineEvent.create({
                data: {
                    caseId: newCase.id,
                    createdById: user.userId,
                    eventDescription: 'AI analyzed the case and provided initial guidance',
                    eventType: 'AI_RESPONSE'
                }
            });
        } catch (aiErr) {
            console.error('AI auto-guidance error (non-fatal):', aiErr);
        }

        return NextResponse.json({ case: newCase }, { status: 201 });
    } catch (error) {
        console.error('Create case error:', error);
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
    }
}
