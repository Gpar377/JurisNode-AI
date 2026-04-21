import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (Model 1.5 Pro because we need strict adherence to non-hallucination)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

const SYSTEM_INSTRUCTION = `You are JurisNode AI, an unbiased Indian legal navigator designed to help rural and underserved populations.
Your tone must be empathetic, highly professional, and perfectly neutral.
CRITICAL RULES:
1. This is procedural triage, not legal advice. You must never guarantee legal outcomes.
2. You must never invent or hallucinate dates, fees, or forms. Rely strictly on general Indian Penal Code (BNS) and standardized Indian Legal Procedure.
3. ALWAYS format your response beautifully using Markdown with logical spacing and relevant emojis (e.g., 🔴 for critical urgency, 🟢 for normal steps).
4. Do not offer opinions on guilt or innocence.
5. End every single response with: "⚠️ *This is general procedural information, not legal advice. For specific guidance, please consult a qualified lawyer.*"`;

export async function detectLegalCategory(message) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on the following user message, identify the most appropriate legal category from this strict list:
- Criminal Law
- Family Law
- Property & Land
- Consumer Rights
- Labour & Employment
- Cyber Crime
- Constitutional Rights
- Banking & Finance
- Tenant & Rental

If none match, reply exactly with "Unknown". Reply ONLY with the exact category name and nothing else.

User Message: "${message}"`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const validCategories = ['Criminal Law', 'Family Law', 'Property & Land', 'Consumer Rights', 'Labour & Employment', 'Cyber Crime', 'Constitutional Rights', 'Banking & Finance', 'Tenant & Rental'];
        return validCategories.includes(responseText) ? responseText : null;
    } catch (error) {
        console.error("Gemini classification error:", error);
        return null;
    }
}

export async function generateLegalGuidance(message, categoryName, proceduralSteps, documentChecklist, chatHistory = []) {
    try {
        // Use Gemini 1.5 Pro for deep reasoning and zero hallucination
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Build the chat history for Gemini
        const formattedHistory = chatHistory.map((msg) => ({
            role: msg.senderRole === 'AI' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const contextInjection = `[SYSTEM CONTEXT]: ${SYSTEM_INSTRUCTION}\n
[CASE CONTEXT]: The user's matter falls under the category of **${categoryName}**. 
Here are the official JurisNode predefined procedural steps for this category:
${proceduralSteps || 'None stored. Rely on general Indian procedure.'}

Here is the document checklist required for this category:
${documentChecklist || 'None stored. Rely on general Indian requirements.'}

INSTRUCTIONS FOR THIS RESPONSE:
Address the user's latest message based on the accumulated chat history. Address their question or concern directly. Structure your response into clear Markdown sections to maximize readability for a stressed user.
[END CONTEXT]\n\nUser Message: ${message}`;

        formattedHistory.push({
            role: 'user',
            parts: [{ text: contextInjection }]
        });

        const result = await model.generateContent({ contents: formattedHistory });
        return result.response.text();
    } catch (error) {
        console.error("Gemini guidance error:", error);
        throw new Error('AI Engine failed to generate guidance.');
    }
}
