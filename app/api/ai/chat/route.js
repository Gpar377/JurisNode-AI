import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { detectLegalCategory, generateLegalGuidance } from '@/lib/ai-engine';
import { NextResponse } from 'next/server';

// POST /api/ai/chat - AI Chat for a case using GenAI
export async function POST(request) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { caseId, message } = await request.json();
        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        // Save user message immediately if caseId exists
        if (caseId) {
            await prisma.caseMessage.create({
                data: {
                    caseId,
                    senderId: user.userId,
                    senderRole: user.role,
                    senderName: user.name,
                    content: message,
                    messageType: 'QUESTION' // Marking it as user question
                }
            });
        }

        let aiResponse;
        let detectedCategory = null;

        if (caseId) {
            // Existing Case Chat
            const caseData = await prisma.case.findUnique({
                where: { id: caseId },
                include: { category: true }
            });

            if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

            // Fetch previous chat history
            // We fetch all messages for context. The AI needs to see what was previously discussed.
            const prevMessages = await prisma.caseMessage.findMany({
                where: { caseId },
                orderBy: { createdAt: 'asc' }
            });

            // The 'message' is already the last element in prevMessages since we just created it.
            // But generateLegalGuidance appends the 'message' explicitly with SYSTEM context.
            // So we must remove the VERY LAST message (the one we just saved above) from the history passed to Gemini, 
            // so we don't accidentally duplicate the user's latest prompt.
            const historyForAI = prevMessages.slice(0, -1);

            aiResponse = await generateLegalGuidance(
                message,
                caseData.category.name,
                caseData.category.proceduralSteps,
                caseData.category.documentChecklist,
                historyForAI
            );

            // Save the newly generated AI response
            await prisma.caseMessage.create({
                data: {
                    caseId,
                    senderRole: 'AI',
                    senderName: 'JurisNode AI (Gemini)',
                    content: aiResponse,
                    messageType: 'GUIDANCE'
                }
            });

            // Log AI action to the Case Timeline
            await prisma.timelineEvent.create({
                data: {
                    caseId,
                    eventDescription: 'AI provided unbiased procedural guidance via GenAI Engine',
                    eventType: 'AI_GUIDANCE'
                }
            });
        } else {
            // Intake Chat (No case yet) - Identify category from pure text!
            detectedCategory = await detectLegalCategory(message);
            if (detectedCategory) {
                const category = await prisma.legalCategory.findUnique({ where: { name: detectedCategory } });
                if (category) {
                    aiResponse = await generateLegalGuidance(
                        message,
                        category.name,
                        category.proceduralSteps,
                        category.documentChecklist,
                        [] // No history for intake
                    );
                }
            }

            if (!aiResponse) {
                // If Gemini couldn't detect a legal category, fall back to safe probing.
                aiResponse = `I'd like to help you navigate your legal situation. Could you describe your issue in more detail? I need to understand exactly what happened so I can identify the correct legal procedures.\n\n` +
                    `⚠️ *This is general information, not legal advice.*`;
            }
        }

        return NextResponse.json({
            response: aiResponse,
            detectedCategory,
        });
    } catch (error) {
        console.error('AI chat error:', error);
        return NextResponse.json({ error: 'AI Engine failed to compute guidance' }, { status: 500 });
    }
}
