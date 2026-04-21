import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { generateInitialGuidance, generateFollowUp } from '@/lib/ai-engine';
import { NextResponse } from 'next/server';

// POST /api/cases/[id]/chat - Send message and get AI response
export async function POST(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const { message } = await request.json();
        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        // Get case with category
        const caseData = await prisma.case.findUnique({
            where: { id },
            include: { category: true }
        });
        if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

        // Save user message
        const userMessage = await prisma.caseMessage.create({
            data: {
                caseId: id,
                senderId: user.userId,
                senderRole: user.role,
                senderName: user.name,
                content: message,
                messageType: 'QUESTION'
            }
        });

        // Generate AI response
        const prevAiMessages = await prisma.caseMessage.count({
            where: { caseId: id, senderRole: 'AI' }
        });

        let aiResponseText;
        if (prevAiMessages === 0) {
            aiResponseText = generateInitialGuidance(
                caseData.category.name,
                message,
                caseData.category.proceduralSteps,
                caseData.category.documentChecklist
            );
        } else {
            aiResponseText = generateFollowUp(caseData.category.name, message);
        }

        // Save AI response
        const aiResponse = await prisma.caseMessage.create({
            data: {
                caseId: id,
                senderRole: 'AI',
                senderName: 'JurisNode AI',
                content: aiResponseText,
                messageType: 'GUIDANCE'
            }
        });

        // Log to timeline
        await prisma.timelineEvent.create({
            data: {
                caseId: id,
                eventDescription: 'AI provided guidance to user',
                eventType: 'AI_GUIDANCE'
            }
        });

        return NextResponse.json({ userMessage, aiResponse });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
    }
}
