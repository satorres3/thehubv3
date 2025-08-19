/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FUNCTION_ICONS, AVAILABLE_ICONS_WITH_DESC, CARD_IMAGE_OPTIONS } from './constants';
import type { AppFunction, ChatHistory, KnowledgeFile, Part } from "./types";

/**
 * Generic fetch function to proxy calls to the Gemini API through our secure backend.
 * @param stream - Whether to request a streaming response.
 * @param params - The parameters for the `generateContent` or `generateContentStream` call.
 * @returns For streaming, a ReadableStream; for non-streaming, the JSON response body.
 */
async function geminiFetch(stream: boolean, params: any): Promise<any> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream, params }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini proxy error:", errorText);
        throw new Error(`AI service request failed: ${response.statusText}`);
    }

    if (stream) {
        if (!response.body) {
            throw new Error("Stream request did not return a readable stream.");
        }
        return response.body;
    }

    return response.json();
}

export async function generateSuggestions(containerName: string, suggestionType: 'questions' | 'personas'): Promise<string[]> {
    const prompt = suggestionType === 'questions'
        ? `Based on a workspace named '${containerName}', generate 4 diverse and insightful 'quick questions' a user might ask an AI assistant in this context. Focus on actionable and common queries.`
        : `Based on a workspace named '${containerName}', generate 4 creative and distinct 'personas' for an AI assistant. Examples: 'Concise Expert', 'Friendly Guide', 'Data-driven Analyst', 'Creative Brainstormer'.`;

    try {
        const params = {
            model: 'gemini-2.5-flash', contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: 'OBJECT', properties: { suggestions: { type: 'ARRAY', items: { type: 'STRING' } } } } }
        };
        const response = await geminiFetch(false, params);
        return JSON.parse(response.text).suggestions || [];
    } catch (error) {
        console.error(`Error generating ${suggestionType}:`, error);
        throw new Error(`Sorry, I couldn't generate suggestions. Please try again.`);
    }
}

export async function generateFunction(userRequest: string): Promise<Omit<AppFunction, 'id' | 'enabled'>> {
    const prompt = `Based on the user request for a function: "${userRequest}", generate a configuration for it. The function should run inside a chat application. 
     - Define a short, clear 'name'.
     - Write a concise one-sentence 'description'.
     - Select a suitable SVG 'icon' from the provided list.
     - Define 1 to 3 input 'parameters' the user needs to provide (name, type, description). Parameter 'type' must be one of: 'string', 'number', 'textarea'.
     - Create a detailed 'promptTemplate' to be sent to another AI model. The prompt template must use placeholders like {parameterName} for each parameter defined.
    Available icons:\n${FUNCTION_ICONS.join('\n')}`;

    try {
        const params = {
            model: 'gemini-2.5-flash', contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        name: { type: 'STRING' }, description: { type: 'STRING' }, icon: { type: 'STRING' },
                        parameters: { type: 'ARRAY', items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, type: { type: 'STRING', enum: ['string', 'number', 'textarea'] }, description: { type: 'STRING' } }, required: ['name', 'type', 'description'] } },
                        promptTemplate: { type: 'STRING' }
                    },
                    required: ['name', 'description', 'icon', 'parameters', 'promptTemplate']
                }
            }
        };
        const response = await geminiFetch(false, params);
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error generating function:`, error);
        throw new Error(`Sorry, I couldn't generate the function. The model might have returned an invalid structure. Please try again with a different request.`);
    }
}

export async function generateContainerDetails(containerName: string, containerType: string, websiteUrl?: string) {
    const iconDescriptions = JSON.stringify(AVAILABLE_ICONS_WITH_DESC);
    const imageDescriptions = JSON.stringify(CARD_IMAGE_OPTIONS);
    let contextPrompt = `A user wants to create a new workspace in an application. The workspace is named "${containerName}" and is of the type "${containerType}".`;
    if (containerType === 'product' && websiteUrl) {
        contextPrompt += ` The product's website is ${websiteUrl}. Please analyze the website content to inform your suggestions, especially for the description, quick questions, and functions, making them highly relevant to the product. For example, a support bot for a software product might need functions to check system status or explain features.`;
    } else if (containerType === 'department') {
        contextPrompt += ` The workspace is for a corporate department. Tailor suggestions to a professional, internal-use context. For example, an HR workspace might need functions for leave policies or benefits lookup.`;
    }

    const prompt = `${contextPrompt}
Based on this context, generate a complete configuration:
- **description**: A concise, one-sentence summary of the workspace's purpose.
- **icon**: Choose the most appropriate SVG icon from the provided list by returning its exact SVG string.
- **cardImageUrl**: Choose the most thematically appropriate image URL from the provided list for a background card, paying close attention to the workspace's name ('${containerName}') and its purpose.
- **theme**: Suggest a complete color theme with nine hex color codes: userBg, userText, botBg, botText, bgGradientStart, bgGradientEnd, sidebarBg, sidebarText, and sidebarHighlightBg. Choose colors that are aesthetically pleasing, accessible (good contrast), and reflect the workspace's purpose (e.g., professional tones for 'Finance', creative colors for 'Design').
- **quickQuestions**: Generate an array of 4 diverse and insightful string 'quick questions' a user might ask.
- **availablePersonas**: Generate an array of 4 creative and distinct string 'personas' for the AI assistant.
- **functions**: Generate an array of 2-3 relevant 'functions' a user might need. For each function, provide: name, description, an icon from the function icon list, 1-2 parameters (name, type, description), and a detailed promptTemplate using placeholders like {parameterName}.
- **initialKnowledgeFile**: If a website URL was provided, generate a text file summarizing the key information from the site. This object must have a 'name' (e.g., "Website_Summary.txt") and 'content' (a plain-text summary). If no URL, return null for this field.

Available container icons: ${iconDescriptions}
Available card images: ${imageDescriptions}
Available function icons: ${FUNCTION_ICONS.join('\n')}`;

    try {
        const params = {
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        description: { type: 'STRING' },
                        icon: { type: 'STRING' },
                        cardImageUrl: { type: 'STRING' },
                        theme: {
                            type: 'OBJECT',
                            properties: { userBg: { type: 'STRING' }, userText: { type: 'STRING' }, botBg: { type: 'STRING' }, botText: { type: 'STRING' }, bgGradientStart: { type: 'STRING' }, bgGradientEnd: { type: 'STRING' }, sidebarBg: { type: 'STRING' }, sidebarText: { type: 'STRING' }, sidebarHighlightBg: { type: 'STRING' } },
                            required: ['userBg', 'userText', 'botBg', 'botText', 'bgGradientStart', 'bgGradientEnd', 'sidebarBg', 'sidebarText', 'sidebarHighlightBg']
                        },
                        quickQuestions: { type: 'ARRAY', items: { type: 'STRING' } },
                        availablePersonas: { type: 'ARRAY', items: { type: 'STRING' } },
                        functions: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    name: { type: 'STRING' }, description: { type: 'STRING' }, icon: { type: 'STRING' },
                                    parameters: { type: 'ARRAY', items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, type: { type: 'STRING', enum: ['string', 'number', 'textarea'] }, description: { type: 'STRING' } }, required: ['name', 'type', 'description'] } },
                                    promptTemplate: { type: 'STRING' }
                                },
                                required: ['name', 'description', 'icon', 'parameters', 'promptTemplate']
                            }
                        },
                        initialKnowledgeFile: { type: 'OBJECT', nullable: true, properties: { name: { type: 'STRING' }, content: { type: 'STRING' } } }
                    },
                    required: ['description', 'icon', 'cardImageUrl', 'theme', 'quickQuestions', 'availablePersonas', 'functions']
                }
            }
        };
        const response = await geminiFetch(false, params);
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating workspace details:", error);
        throw new Error("Could not generate suggestions. Please fill in manually.");
    }
}

export async function generateChatName(history: ChatHistory): Promise<string> {
    if (history.length < 2) return "New Conversation";
    const firstUserPart = history[0].parts.find(p => 'text' in p);
    const firstModelPart = history[1].parts.find(p => 'text' in p);
    if (!firstUserPart || !('text' in firstUserPart) || !firstModelPart || !('text' in firstModelPart)) return "New Conversation";

    const prompt = `Based on the following conversation, create a very short, concise title (max 5 words, and no quotes).\n\nConversation:\nUser: "${firstUserPart.text}"\nModel: "${firstModelPart.text}"`;
    try {
        const params = { model: 'gemini-2.5-flash', contents: prompt };
        const response = await geminiFetch(false, params);
        return response.text.trim().replace(/["']/g, ""); // Remove quotes from response
    } catch (error) {
        console.error("Error generating chat name:", error);
        return "New Conversation";
    }
}

export async function streamChatResponse(model: string, persona: string, containerId: string, userParts: Part[]) {
     const params = {
        model: model,
        containerId: containerId, // Pass containerId for the backend to fetch knowledge
        contents: {
            parts: userParts
        },
        config: {
            systemInstruction: `You are an AI assistant. Your current persona is: ${persona}.`
        }
    };

    const streamBody = await geminiFetch(true, params);
    const reader = streamBody.pipeThrough(new TextDecoderStream()).getReader();

    // Return an async iterator that parses the newline-delimited JSON stream
    return {
        async *[Symbol.asyncIterator]() {
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (buffer.length > 0) {
                        try { yield JSON.parse(buffer); } catch (e) { console.error("Error parsing final chunk in stream:", e, "Buffer:", buffer); }
                    }
                    break;
                }
                buffer += value;
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep the last partial line in buffer

                for (const line of lines) {
                    if (line.trim()) {
                        try { yield JSON.parse(line); } catch (e) { console.error("Error parsing chunk in stream:", e, "Line:", line); }
                    }
                }
            }
        }
    };
}

export async function generateQuestionsFromKnowledge(knowledgeBase: KnowledgeFile[]): Promise<string[]> {
    if (knowledgeBase.length === 0) return [];
    
    // This function now receives metadata; if we want to generate questions on the client,
    // we would need a way to fetch content. For now, this will generate based on filenames.
    const combinedText = knowledgeBase.map(file => file.name).join(', ').substring(0, 10000);

    const prompt = `Based on the following file names from a knowledge base, generate 4 insightful and relevant "quick questions" a user might ask an AI assistant. The questions should be diverse and cover key topics suggested by the file names.

<knowledge_base_files>
${combinedText}
</knowledge_base_files>

Generate only the questions.`;

    try {
        const params = {
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        questions: { type: 'ARRAY', items: { type: 'STRING' }, description: "An array of 4 generated questions." }
                    },
                    required: ["questions"]
                }
            }
        };
        const response = await geminiFetch(false, params);
        const result = JSON.parse(response.text);
        return result.questions || [];
    } catch (error) {
        console.error(`Error generating questions from knowledge:`, error);
        return [];
    }
}

// New Knowledge Base API functions
export async function listKnowledgeFiles(containerId: string): Promise<KnowledgeFile[]> {
    const response = await fetch(`/api/knowledge/list?containerId=${containerId}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Could not fetch knowledge files:", errorText);
        throw new Error("Could not fetch knowledge files.");
    }
    return response.json();
}

export async function uploadKnowledgeFile(containerId: string, file: { name: string; type: string; size: number; base64Content: string }): Promise<KnowledgeFile> {
    const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId, file }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("File upload failed:", errorText);
        throw new Error("File upload failed.");
    }
    return response.json();
}

export async function deleteKnowledgeFile(containerId: string, fileId: string): Promise<void> {
    const response = await fetch('/api/knowledge/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId, fileId }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("File deletion failed:", errorText);
        throw new Error("File deletion failed.");
    }
}