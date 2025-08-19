import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getSession } from "../shared/session";
import { addKnowledgeFile } from "../shared/knowledge";

interface UploadRequestBody {
    containerId: string;
    file: {
        name: string;
        type: string;
        size: number;
        base64Content: string;
    };
}

export async function knowledgeUpload(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const session = getSession(request);
    if (!session) {
        return { status: 401, body: "Unauthorized: No valid session." };
    }

    try {
        const body = await request.json() as UploadRequestBody;
        if (!body.containerId || !body.file) {
            return { status: 400, body: "Bad Request: 'containerId' and 'file' object are required." };
        }

        context.log("Request to upload knowledge file.", {
            userId: session.homeAccountId,
            containerId: body.containerId,
            fileName: body.file.name
        });

        const newFileMetadata = await addKnowledgeFile(body.containerId, body.file);

        return { status: 201, jsonBody: newFileMetadata };

    } catch (error) {
        context.error("Error in knowledgeUpload function.", { 
            userId: session.homeAccountId,
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
        return { status: 500, body: "Internal server error during file upload." };
    }
}

app.http('knowledgeUpload', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: knowledgeUpload,
    route: 'knowledge/upload'
});