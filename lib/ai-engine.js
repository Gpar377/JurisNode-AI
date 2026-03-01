// LexLink AI Engine - Multi-category legal navigation with safe language
// This is the rule-based engine for V0 MVP. Upgradable to Gemini API for V1.

const KEYWORDS = {
    'Motor Vehicle & Accident': ['accident', 'crash', 'hit and run', 'hit-and-run', 'road', 'vehicle', 'car', 'bike', 'truck', 'dui', 'drunk driving', 'traffic', 'collision', 'insurance claim', 'mact'],
    'Property & Real Estate': ['property', 'land', 'house', 'flat', 'apartment', 'tenant', 'landlord', 'rent', 'eviction', 'encroachment', 'title', 'deed', 'mutation', 'possession', 'real estate', 'construction', 'builder'],
    'Family & Matrimonial': ['divorce', 'custody', 'child', 'marriage', 'domestic violence', 'alimony', 'maintenance', 'husband', 'wife', 'matrimonial', 'dowry', 'protection order', 'family'],
    'Consumer Protection': ['consumer', 'product', 'defect', 'refund', 'warranty', 'complaint', 'overcharged', 'fraud', 'seller', 'e-commerce', 'online shopping', 'service', 'misleading'],
    'Employment & Labor': ['employer', 'employee', 'fired', 'terminated', 'salary', 'wages', 'harassment', 'workplace', 'posh', 'pf', 'provident fund', 'labor', 'labour', 'job', 'dismissal'],
    'Corporate & Commercial': ['company', 'contract', 'breach', 'partnership', 'startup', 'trademark', 'copyright', 'patent', 'nclt', 'arbitration', 'business', 'shareholder', 'director'],
    'Cybercrime & Digital': ['cyber', 'online', 'hack', 'hacked', 'phishing', 'identity theft', 'data', 'social media', 'stalking', 'trolling', 'otp', 'scam', 'upi', 'digital'],
    'Criminal Law': ['theft', 'stolen', 'assault', 'attack', 'cheating', 'fraud', 'defamation', 'bail', 'arrest', 'fir', 'police', 'criminal', 'murder', 'kidnap', 'threat', 'extortion']
};

export function classifyIssue(text) {
    const lower = text.toLowerCase();
    const scores = {};

    for (const [category, keywords] of Object.entries(KEYWORDS)) {
        scores[category] = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) scores[category] += 1;
        }
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (sorted[0][1] > 0) return sorted[0][0];
    return null;
}

export function generateInitialGuidance(category, userMessage, proceduralSteps, documentChecklist) {
    const steps = JSON.parse(proceduralSteps || '[]');
    const docs = JSON.parse(documentChecklist || '[]');

    const criticalSteps = steps.filter(s => s.urgency === 'CRITICAL' || s.urgency === 'HIGH');
    const otherSteps = steps.filter(s => s.urgency !== 'CRITICAL' && s.urgency !== 'HIGH');

    let response = `I understand you're dealing with a **${category.toLowerCase()}** matter. Here's what people generally do in similar situations:\n\n`;

    if (criticalSteps.length > 0) {
        response += `### ⚡ Immediate Priority Steps\n`;
        criticalSteps.forEach((s, i) => {
            const icon = s.urgency === 'CRITICAL' ? '🔴' : '🟡';
            response += `${i + 1}. ${icon} **${s.title}** — ${s.description}`;
            if (s.timeLimit) response += ` *(${s.timeLimit})*`;
            response += '\n';
        });
        response += '\n';
    }

    if (otherSteps.length > 0) {
        response += `### 📋 Follow-up Steps\n`;
        otherSteps.forEach((s, i) => {
            response += `${criticalSteps.length + i + 1}. 🟢 **${s.title}** — ${s.description}`;
            if (s.timeLimit) response += ` *(${s.timeLimit})*`;
            response += '\n';
        });
        response += '\n';
    }

    if (docs.length > 0) {
        response += `### 📄 Documents You'll Generally Need\n`;
        docs.forEach(d => { response += `- ${d}\n`; });
        response += '\n';
    }

    response += `---\n`;
    response += `💡 **Would you like me to help you find a lawyer** who handles ${category.toLowerCase()} matters in your area?\n\n`;
    response += `⚠️ *This is general procedural information, not legal advice. For specific guidance on your situation, please consult a qualified lawyer.*`;

    return response;
}

export function generateFollowUp(category, question) {
    const lower = question.toLowerCase();

    if (lower.includes('lawyer') || lower.includes('find') || lower.includes('connect') || lower.includes('help me find')) {
        return `I can help you find a lawyer who handles **${category.toLowerCase()}** matters. You can:\n\n1. Go to the **Lawyer Discovery** page to search by location and specialization\n2. I can suggest lawyers based on your case location\n\nWould you like me to show you available lawyers?\n\n⚠️ *This is general information, not legal advice.*`;
    }

    if (lower.includes('document') || lower.includes('upload') || lower.includes('file')) {
        return `You can upload documents directly to this case file. Here's how:\n\n1. Click the **Documents** tab above\n2. Upload relevant documents (photos, reports, receipts, notices)\n3. I'll help organize and tag them for easy access\n\nAll documents are stored securely and accessible to you and any assigned lawyers.\n\n⚠️ *This is general information, not legal advice.*`;
    }

    if (lower.includes('deadline') || lower.includes('time') || lower.includes('how long') || lower.includes('when')) {
        return `Timelines generally vary based on the specific circumstances. Here are some common timeframes people typically encounter:\n\n- **FIR filing**: Generally done as soon as possible\n- **Insurance notification**: Commonly within 7-15 days\n- **Legal notices**: Usually sent within 30 days\n- **Court filing**: Subject to limitation periods that vary by case type\n\nA lawyer can provide specific guidance on deadlines applicable to your situation.\n\n⚠️ *This is general information, not legal advice.*`;
    }

    if (lower.includes('cost') || lower.includes('fee') || lower.includes('money') || lower.includes('charge') || lower.includes('expensive')) {
        return `Legal costs generally vary significantly based on complexity, location, and lawyer experience. Here's what people commonly encounter:\n\n- **Consultation**: Many lawyers offer initial consultations\n- **Legal notice**: Generally involves lawyer fees\n- **Court filing**: Court fees vary by claim amount and jurisdiction\n- **Overall costs**: Depend heavily on case complexity\n\nI'd recommend discussing fee structures directly with potential lawyers.\n\n⚠️ *This is general information, not legal advice.*`;
    }

    return `I understand your question about your **${category.toLowerCase()}** matter.\n\nFor the most accurate guidance on your specific situation, I'd recommend:\n1. Reviewing the procedural steps listed above\n2. Uploading any relevant documents for better context\n3. Connecting with a lawyer who specializes in this area\n\nIs there anything specific about the general procedures I can help clarify?\n\n⚠️ *This is general information, not legal advice.*`;
}
