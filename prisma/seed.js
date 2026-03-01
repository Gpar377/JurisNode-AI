require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const LEGAL_CATEGORIES = [
    {
        id: uuidv4(),
        name: 'Motor Vehicle & Accident',
        icon: '🚗',
        description: 'Road accidents, hit-and-run, DUI, traffic violations, insurance claims, and Motor Accident Claims Tribunal (MACT) proceedings.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Ensure Safety', description: 'Move to a safe location if possible. Call emergency services (112) if there are injuries.', urgency: 'CRITICAL', timeLimit: 'Immediately' },
            { step: 2, title: 'File FIR', description: 'File a First Information Report at the nearest police station. This is generally required within 24 hours.', urgency: 'HIGH', timeLimit: '24 hours' },
            { step: 3, title: 'Medical Documentation', description: 'Get a medical examination report. This is commonly needed even for minor injuries for legal records.', urgency: 'HIGH', timeLimit: '24-48 hours' },
            { step: 4, title: 'Collect Evidence', description: 'Take photographs of the accident scene, vehicle damage, and injuries. Get contact details of witnesses.', urgency: 'MEDIUM', timeLimit: 'As soon as possible' },
            { step: 5, title: 'Notify Insurance', description: 'Inform your insurance company about the incident. Most policies generally require notification within a certain period.', urgency: 'MEDIUM', timeLimit: '7 days typically' },
            { step: 6, title: 'Obtain FIR Copy', description: 'Get a certified copy of the FIR for your records and insurance claim.', urgency: 'MEDIUM', timeLimit: '1-2 weeks' },
            { step: 7, title: 'Consult Local Lawyer', description: 'If the accident occurred outside your home state, consider consulting a local lawyer familiar with that jurisdiction.', urgency: 'MEDIUM', timeLimit: '1-2 weeks' },
            { step: 8, title: 'MACT Application', description: 'If there are significant injuries or damages, a Motor Accident Claims Tribunal application may generally be filed.', urgency: 'LOW', timeLimit: '6 months typically' }
        ]),
        documentChecklist: JSON.stringify([
            'FIR Copy', 'Medical Reports & Bills', 'Vehicle Registration Certificate',
            'Driving License', 'Insurance Policy', 'Photographs of accident scene',
            'Witness statements', 'Hospital admission records', 'Vehicle repair estimates'
        ]),
        urgencyRules: JSON.stringify({ level: 'HIGH', reason: 'Time-sensitive evidence and FIR filing', criticalWindow: '24 hours' })
    },
    {
        id: uuidv4(),
        name: 'Property & Real Estate',
        icon: '🏠',
        description: 'Tenant disputes, land encroachment, property fraud, inheritance issues, illegal construction, title disputes, and eviction matters.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Gather Property Documents', description: 'Collect all relevant property documents including sale deed, title deed, property tax receipts, and mutation records.', urgency: 'HIGH', timeLimit: 'Immediately' },
            { step: 2, title: 'Verify Ownership', description: 'Get an encumbrance certificate and verify the property title through sub-registrar office records.', urgency: 'HIGH', timeLimit: '1 week' },
            { step: 3, title: 'Send Legal Notice', description: 'A legal notice is commonly the first step in property disputes. It formally communicates your grievance.', urgency: 'MEDIUM', timeLimit: '2 weeks' },
            { step: 4, title: 'Attempt Mediation', description: 'Before filing a suit, mediation is generally encouraged to resolve disputes amicably.', urgency: 'MEDIUM', timeLimit: '1 month' },
            { step: 5, title: 'File Civil Suit', description: 'If mediation fails, a civil suit may be filed in the appropriate court based on property location.', urgency: 'LOW', timeLimit: 'Within limitation period' },
            { step: 6, title: 'Apply for Injunction', description: 'If there is immediate threat to the property, an injunction order may generally be sought.', urgency: 'HIGH', timeLimit: 'If urgent' }
        ]),
        documentChecklist: JSON.stringify([
            'Sale Deed / Title Deed', 'Property Tax Receipts', 'Encumbrance Certificate',
            'Mutation Records', 'Survey Map', 'Building Approval Plans',
            'Rent Agreement (if tenant dispute)', 'Photographs of property', 'Previous correspondence'
        ]),
        urgencyRules: JSON.stringify({ level: 'MEDIUM', reason: 'Evidence preservation and limitation periods', criticalWindow: '30 days for possession issues' })
    },
    {
        id: uuidv4(),
        name: 'Family & Matrimonial',
        icon: '👨‍👩‍👧',
        description: 'Divorce, child custody, maintenance/alimony, domestic violence, marriage registration, and adoption matters.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Document the Situation', description: 'Record dates, incidents, and circumstances with as much detail as possible in writing.', urgency: 'HIGH', timeLimit: 'Immediately' },
            { step: 2, title: 'Seek Immediate Protection (if DV)', description: 'In cases of domestic violence, protection under the Domestic Violence Act can generally be sought immediately.', urgency: 'CRITICAL', timeLimit: 'Immediately' },
            { step: 3, title: 'Consult a Family Lawyer', description: 'Family law varies significantly by personal law (Hindu, Muslim, Christian, Special Marriage Act). A lawyer can guide based on applicable law.', urgency: 'HIGH', timeLimit: '1 week' },
            { step: 4, title: 'Attempt Counseling/Mediation', description: 'Courts generally encourage counseling before proceeding with divorce petitions.', urgency: 'MEDIUM', timeLimit: '2-4 weeks' },
            { step: 5, title: 'File Petition', description: 'Based on the specific issue, the appropriate petition (divorce, custody, maintenance) may be filed.', urgency: 'LOW', timeLimit: 'As advised by lawyer' },
            { step: 6, title: 'Interim Orders', description: 'Interim maintenance or custody orders may generally be sought while the case is pending.', urgency: 'MEDIUM', timeLimit: 'After filing' }
        ]),
        documentChecklist: JSON.stringify([
            'Marriage Certificate', 'ID Proofs of both parties', 'Income documents',
            'Evidence of domestic violence (if applicable)', 'Children birth certificates',
            'Property documents', 'Bank statements', 'Medical records', 'Photographs/communications'
        ]),
        urgencyRules: JSON.stringify({ level: 'HIGH', reason: 'Domestic violence cases need immediate attention', criticalWindow: 'Immediate for DV' })
    },
    {
        id: uuidv4(),
        name: 'Consumer Protection',
        icon: '🛒',
        description: 'Product defects, service fraud, overcharging, misleading advertisements, e-commerce disputes, and warranty issues.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Preserve Evidence', description: 'Keep the defective product, bills, receipts, warranty cards, and any communication with the seller/service provider.', urgency: 'HIGH', timeLimit: 'Immediately' },
            { step: 2, title: 'Send Written Complaint', description: 'Write a formal complaint to the company/service provider. Keep proof of sending (registered post/email).', urgency: 'MEDIUM', timeLimit: '1 week' },
            { step: 3, title: 'Wait for Response', description: 'Companies generally have 15-30 days to respond to a formal complaint.', urgency: 'LOW', timeLimit: '30 days' },
            { step: 4, title: 'File Consumer Complaint', description: 'If no satisfactory response, a complaint may be filed on the National Consumer Helpline (1800-11-4000) or consumer forum.', urgency: 'MEDIUM', timeLimit: 'Within 2 years of cause of action' },
            { step: 5, title: 'Choose Right Forum', description: 'District Forum (up to ₹1 crore), State Commission (₹1-10 crore), National Commission (above ₹10 crore).', urgency: 'LOW', timeLimit: 'Per limitation' }
        ]),
        documentChecklist: JSON.stringify([
            'Purchase receipt/invoice', 'Warranty card', 'Product photographs',
            'Written complaint to company', 'Company response (if any)',
            'Bank/payment transaction records', 'Advertisement screenshots', 'Witness statements'
        ]),
        urgencyRules: JSON.stringify({ level: 'LOW', reason: '2-year limitation period', criticalWindow: '2 years' })
    },
    {
        id: uuidv4(),
        name: 'Employment & Labor',
        icon: '💼',
        description: 'Wrongful termination, workplace harassment, wage disputes, POSH violations, contract issues, and PF/ESI matters.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Document Everything', description: 'Save all employment-related documents: offer letter, salary slips, appraisals, emails, and termination letter.', urgency: 'HIGH', timeLimit: 'Immediately' },
            { step: 2, title: 'Internal Complaint (if harassment)', description: 'File a complaint with the Internal Complaints Committee (ICC) under POSH Act.', urgency: 'HIGH', timeLimit: '3 months of incident' },
            { step: 3, title: 'Send Legal Notice', description: 'A legal notice to the employer is commonly the first formal step in disputes.', urgency: 'MEDIUM', timeLimit: '2 weeks' },
            { step: 4, title: 'Approach Labor Commissioner', description: 'For wage disputes and termination issues, the Labor Commissioner can generally be approached for conciliation.', urgency: 'MEDIUM', timeLimit: '1 month' },
            { step: 5, title: 'File Case', description: 'If conciliation fails, approach the Labour Court or Industrial Tribunal as applicable.', urgency: 'LOW', timeLimit: 'Within limitation period' }
        ]),
        documentChecklist: JSON.stringify([
            'Offer/Appointment Letter', 'Employment Contract', 'Salary Slips (last 6 months)',
            'Termination Letter', 'Email correspondence', 'Performance reviews',
            'PF/ESI records', 'POSH complaint (if applicable)', 'Witness information'
        ]),
        urgencyRules: JSON.stringify({ level: 'MEDIUM', reason: 'Evidence preservation and POSH timeline', criticalWindow: '3 months for POSH' })
    },
    {
        id: uuidv4(),
        name: 'Corporate & Commercial',
        icon: '🏢',
        description: 'Contract breaches, partnership disputes, intellectual property, startup legal issues, tax disputes, and NCLT matters.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Review Contracts', description: 'Examine all relevant agreements, contracts, and MOUs. Note dispute resolution clauses (arbitration/jurisdiction).', urgency: 'HIGH', timeLimit: 'Immediately' },
            { step: 2, title: 'Send Legal Notice', description: 'A formal legal notice under the appropriate section is commonly the first step.', urgency: 'MEDIUM', timeLimit: '1-2 weeks' },
            { step: 3, title: 'Attempt Negotiation', description: 'Direct negotiation or mediation is generally preferred before litigation in commercial disputes.', urgency: 'MEDIUM', timeLimit: '2-4 weeks' },
            { step: 4, title: 'Initiate Arbitration (if clause exists)', description: 'If the contract has an arbitration clause, arbitration proceedings may need to be initiated.', urgency: 'MEDIUM', timeLimit: 'Per contract terms' },
            { step: 5, title: 'File Suit/Application', description: 'Depending on the nature, approach Civil Court, NCLT, or other appropriate forum.', urgency: 'LOW', timeLimit: 'Within limitation' }
        ]),
        documentChecklist: JSON.stringify([
            'Contracts/Agreements', 'MOUs', 'Board Resolutions', 'Financial Records',
            'Correspondence (emails, letters)', 'Company Registration documents',
            'Tax Returns', 'Bank Statements', 'IP registration certificates'
        ]),
        urgencyRules: JSON.stringify({ level: 'MEDIUM', reason: 'Contractual deadlines and limitation periods', criticalWindow: 'Varies by contract' })
    },
    {
        id: uuidv4(),
        name: 'Cybercrime & Digital',
        icon: '💻',
        description: 'Online fraud, identity theft, cyberstalking, data breaches, social media harassment, and IT Act violations.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Preserve Digital Evidence', description: 'Take screenshots, save URLs, download emails, and preserve all digital evidence. Do not delete anything.', urgency: 'CRITICAL', timeLimit: 'Immediately' },
            { step: 2, title: 'Report on Cybercrime Portal', description: 'File a complaint on the National Cybercrime Reporting Portal (cybercrime.gov.in) or call 1930.', urgency: 'HIGH', timeLimit: '24-48 hours' },
            { step: 3, title: 'File FIR', description: 'File an FIR at the nearest police station or cyber cell. Carry all digital evidence.', urgency: 'HIGH', timeLimit: '48 hours' },
            { step: 4, title: 'Block & Report Accounts', description: 'Report abusive accounts on social media platforms and block them.', urgency: 'MEDIUM', timeLimit: 'Immediately' },
            { step: 5, title: 'Consult Cyber Lawyer', description: 'A lawyer specializing in IT Act and cybercrime can guide on specific provisions applicable.', urgency: 'MEDIUM', timeLimit: '1 week' },
            { step: 6, title: 'Bank Notification (if financial)', description: 'If financial fraud is involved, immediately notify your bank and request transaction reversal.', urgency: 'CRITICAL', timeLimit: 'Immediately' }
        ]),
        documentChecklist: JSON.stringify([
            'Screenshots of incident', 'URL/website details', 'Email headers and content',
            'Bank transaction records', 'FIR copy', 'Cybercrime portal complaint number',
            'Social media profile links', 'Phone call records', 'Device logs'
        ]),
        urgencyRules: JSON.stringify({ level: 'HIGH', reason: 'Digital evidence can be deleted quickly', criticalWindow: '24-48 hours' })
    },
    {
        id: uuidv4(),
        name: 'Criminal Law',
        icon: '⚖️',
        description: 'Theft, assault, cheating, fraud, defamation, anticipatory bail, and other criminal matters under IPC/BNS.',
        proceduralSteps: JSON.stringify([
            { step: 1, title: 'Ensure Safety', description: 'If in immediate danger, call 112 and move to a safe location.', urgency: 'CRITICAL', timeLimit: 'Immediately' },
            { step: 2, title: 'File FIR/NCR', description: 'File FIR for cognizable offenses. For non-cognizable offenses, file a Non-Cognizable Report (NCR).', urgency: 'HIGH', timeLimit: 'As soon as possible' },
            { step: 3, title: 'Medical Examination', description: 'If there is physical harm, get a medical examination done at a government hospital.', urgency: 'HIGH', timeLimit: '24 hours' },
            { step: 4, title: 'Consult Criminal Lawyer', description: 'Consult a lawyer immediately, especially if you are accused or need bail.', urgency: 'CRITICAL', timeLimit: 'Immediately if accused' },
            { step: 5, title: 'Bail Application', description: 'If arrested, a bail application may generally be filed before the Magistrate or Sessions Court.', urgency: 'CRITICAL', timeLimit: 'Immediately after arrest' },
            { step: 6, title: 'Gather Evidence', description: 'Collect and preserve all evidence including CCTV footage, witness details, and documents.', urgency: 'HIGH', timeLimit: '1 week' }
        ]),
        documentChecklist: JSON.stringify([
            'FIR Copy', 'Medical Report', 'ID Proof', 'CCTV footage',
            'Witness details and statements', 'Photographs of injuries/scene',
            'Previous complaints (if any)', 'Character certificates', 'Bail bond documents'
        ]),
        urgencyRules: JSON.stringify({ level: 'HIGH', reason: 'Criminal matters often need immediate legal action', criticalWindow: 'Immediate' })
    }
];

async function main() {
    console.log('🌱 Seeding LexLink database...\n');

    // Create categories
    for (const cat of LEGAL_CATEGORIES) {
        await prisma.legalCategory.upsert({
            where: { name: cat.name },
            update: cat,
            create: cat
        });
        console.log(`  ✅ Category: ${cat.icon} ${cat.name}`);
    }

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const citizen1 = await prisma.user.upsert({
        where: { email: 'rahul@example.com' },
        update: {},
        create: {
            name: 'Rahul Sharma',
            email: 'rahul@example.com',
            password: hashedPassword,
            role: 'CITIZEN',
            phone: '9876543210',
            state: 'Delhi',
            city: 'New Delhi'
        }
    });
    console.log(`\n  👤 Citizen: ${citizen1.name}`);

    const citizen2 = await prisma.user.upsert({
        where: { email: 'priya@example.com' },
        update: {},
        create: {
            name: 'Priya Patel',
            email: 'priya@example.com',
            password: hashedPassword,
            role: 'CITIZEN',
            phone: '9876543211',
            state: 'Maharashtra',
            city: 'Mumbai'
        }
    });
    console.log(`  👤 Citizen: ${citizen2.name}`);

    // Create lawyers
    const lawyers = [
        { name: 'Adv. Meera Krishnan', email: 'meera@example.com', state: 'Tamil Nadu', city: 'Chennai', spec: 'Motor Vehicle & Accident', years: 12 },
        { name: 'Adv. Vikram Singh', email: 'vikram@example.com', state: 'Delhi', city: 'New Delhi', spec: 'Criminal Law', years: 15 },
        { name: 'Adv. Sunita Reddy', email: 'sunita@example.com', state: 'Telangana', city: 'Hyderabad', spec: 'Family & Matrimonial', years: 8 },
        { name: 'Adv. Arjun Nair', email: 'arjun@example.com', state: 'Kerala', city: 'Kochi', spec: 'Property & Real Estate', years: 20 },
        { name: 'Adv. Fatima Khan', email: 'fatima@example.com', state: 'Maharashtra', city: 'Mumbai', spec: 'Corporate & Commercial', years: 10 },
        { name: 'Adv. Ravi Desai', email: 'ravi@example.com', state: 'Gujarat', city: 'Ahmedabad', spec: 'Consumer Protection', years: 6 },
        { name: 'Adv. Kavitha Iyer', email: 'kavitha@example.com', state: 'Karnataka', city: 'Bangalore', spec: 'Cybercrime & Digital', years: 5 },
        { name: 'Adv. Rohit Jha', email: 'rohit@example.com', state: 'Bihar', city: 'Patna', spec: 'Employment & Labor', years: 14 },
    ];

    for (const l of lawyers) {
        const user = await prisma.user.upsert({
            where: { email: l.email },
            update: {},
            create: {
                name: l.name,
                email: l.email,
                password: hashedPassword,
                role: 'LAWYER',
                phone: '9800000000',
                state: l.state,
                city: l.city
            }
        });

        await prisma.lawyerProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                specializations: JSON.stringify([l.spec]),
                barCouncilId: `BC/${l.state.substring(0, 3).toUpperCase()}/${Math.floor(1000 + Math.random() * 9000)}`,
                state: l.state,
                city: l.city,
                yearsExperience: l.years,
                verified: true,
                bio: `Experienced ${l.spec.toLowerCase()} lawyer based in ${l.city}, ${l.state} with ${l.years} years of practice.`,
                rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
            }
        });
        console.log(`  ⚖️ Lawyer: ${l.name} (${l.spec})`);
    }

    // Create a sample case
    const accidentCategory = await prisma.legalCategory.findUnique({ where: { name: 'Motor Vehicle & Accident' } });

    if (accidentCategory) {
        const sampleCase = await prisma.case.create({
            data: {
                userId: citizen1.id,
                categoryId: accidentCategory.id,
                title: 'Road accident in Chennai',
                description: 'I was involved in a road accident while traveling in Chennai. The other driver ran a red light and hit my car. I have minor injuries and significant vehicle damage.',
                stateOfIncident: 'Tamil Nadu',
                city: 'Chennai',
                status: 'OPEN',
                isUrgent: true,
                lawyerMode: 'SELF'
            }
        });

        // Add some timeline events
        await prisma.timelineEvent.createMany({
            data: [
                {
                    caseId: sampleCase.id,
                    createdById: citizen1.id,
                    eventDescription: 'Case created by Rahul Sharma',
                    eventType: 'STATUS_CHANGE',
                },
                {
                    caseId: sampleCase.id,
                    eventDescription: 'AI provided initial guidance for motor vehicle accident procedures',
                    eventType: 'AI_GUIDANCE',
                }
            ]
        });

        // Add AI messages
        await prisma.caseMessage.createMany({
            data: [
                {
                    caseId: sampleCase.id,
                    senderId: citizen1.id,
                    senderRole: 'CITIZEN',
                    senderName: 'Rahul Sharma',
                    content: 'I was in a road accident in Chennai. The other driver ran a red light.',
                    messageType: 'QUESTION'
                },
                {
                    caseId: sampleCase.id,
                    senderRole: 'AI',
                    senderName: 'LexLink AI',
                    content: 'I understand you\'ve been in a road accident in Chennai. Here are the immediate steps you should generally take:\n\n1. 🔴 Ensure your safety and seek medical attention if needed\n2. 🔴 File an FIR at the nearest police station (generally within 24 hours)\n3. 🟡 Document the scene - take photos of vehicle damage, road conditions, and any injuries\n4. 🟡 Collect witness contact details\n5. 🟢 Notify your insurance company\n\n⚠️ Since this happened in Tamil Nadu and you\'re from Delhi, you may want to consider connecting with a local lawyer familiar with Tamil Nadu jurisdiction.\n\nDisclaimer: This is general procedural information, not legal advice.',
                    messageType: 'GUIDANCE'
                }
            ]
        });

        console.log(`\n  📁 Sample case: ${sampleCase.title}`);
    }

    console.log('\n✅ Seeding complete!\n');
    console.log('📧 Sample logins (password: password123):');
    console.log('   Citizen: rahul@example.com');
    console.log('   Citizen: priya@example.com');
    console.log('   Lawyer:  meera@example.com (or any lawyer email)');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
