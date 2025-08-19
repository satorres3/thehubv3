import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { GoogleGenAI } from "@google/genai";
import { getSession } from "../shared/session";
import { config } from "../shared/config";
import { getKnowledgeFilesWithContent } from "../shared/knowledge";

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

interface GeminiRequest {
    stream?: boolean;
    params: {
        model: string;
        containerId: string;
        contents: any;
        config?: any;
    };
}

export async function geminiProxy(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const session = getSession(request);
    if (!session) {
        return { status: 401, body: "Unauthorized: No valid session." };
    }

    try {
        const body = await request.json() as GeminiRequest;

        if (!body || typeof body !== 'object' || !body.params) {
            return { status: 400, jsonBody: { error: "Bad Request: Missing or invalid 'params' in request body." } };
        }
        
        const { stream, params } = body;
        const { containerId, contents } = params;

        if (!containerId) {
            return { status: 400, jsonBody: { error: "Bad Request: 'containerId' is required in params." } };
        }

        context.log("Gemini request received.", {
            userId: session.homeAccountId,
            containerId,
            model: params?.model,
            isStreaming: !!stream
        });

        const knowledgeFiles = await getKnowledgeFilesWithContent(containerId);
        const knowledgeParts = knowledgeFiles.map(file => ({
            inlineData: {
                mimeType: file.type,
                data: file.base64Content.split(',')[1]
            }
        }));

        const finalContents = {
            ...contents,
            parts: [...knowledgeParts, ...contents.parts]
        };
        
        const finalParams = { ...params, contents: finalContents };
        delete (finalParams as any).containerId; // Remove containerId before sending to Google

        if (stream) {
            const streamResult = await ai.models.generateContentStream(finalParams);
            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of streamResult) {
                            controller.enqueue(JSON.stringify(chunk) + '\n');
                        }
                        controller.close();
                    } catch (streamError) {
                        context.error("Error during stream processing:", streamError);
                        controller.error(streamError);
                    }
                }
            });
            return { status: 200, headers: { 'Content-Type': 'application/x-ndjson' }, body: readableStream };
        } else {
            const result = await ai.models.generateContent(finalParams);
            return { status: 200, jsonBody: result };
        }

    } catch (error) {
        context.error("Error in Gemini proxy.", { 
            userId: session.homeAccountId, 
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
        return {
            status: 500,
            jsonBody: {
                error: "Internal server error while calling Gemini API.",
                details: error instanceof Error ? error.message : "An unknown error occurred"
            }
        };
    }
}

app.http('geminiProxy', {
    methods: ['POST'],
    authLevel: 'anonymous', // We use cookie-based session auth
    route: 'gemini',
    handler: geminiProxy
});