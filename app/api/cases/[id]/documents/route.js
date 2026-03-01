import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/cases/[id]/documents - Upload a document to a case
export async function POST(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get('file');
        const documentType = formData.get('documentType') || 'OTHER';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Verify case access
        const caseRecord = await prisma.case.findUnique({ where: { id } });
        if (!caseRecord) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

        // Save file to uploads directory
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', id);
        await mkdir(uploadsDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);
        await writeFile(filePath, buffer);

        // Save document record
        const document = await prisma.document.create({
            data: {
                caseId: id,
                uploadedById: user.userId,
                fileName: file.name,
                fileUrl: `/uploads/${id}/${fileName}`,
                fileSize: buffer.length,
                mimeType: file.type || 'application/octet-stream',
                documentType
            }
        });

        // Timeline event
        await prisma.timelineEvent.create({
            data: {
                caseId: id,
                createdById: user.userId,
                eventDescription: `Document uploaded: ${file.name}`,
                eventType: 'DOCUMENT_UPLOAD'
            }
        });

        return NextResponse.json({ document }, { status: 201 });
    } catch (error) {
        console.error('Upload document error:', error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}

// GET /api/cases/[id]/documents - List documents for a case
export async function GET(request, { params }) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const documents = await prisma.document.findMany({
            where: { caseId: id },
            include: { uploadedBy: { select: { id: true, name: true, role: true } } },
            orderBy: { uploadedAt: 'desc' }
        });

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Get documents error:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}
