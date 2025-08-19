import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getSession } from "../shared/session";
import { deleteKnowledgeFile } from "../shared/knowledge";

interface DeleteRequestBody {
    containerId: string;
    fileId: string;
}

export async function knowledgeDelete(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const session = getSession(request);
    if (!session) {
        return { status: 401, body: "Unauthorized: No valid session." };
    }

    try {
        const body = await request.json() as DeleteRequestBody;
        if (!body.containerId || !body.fileId) {
            return { status: 400, body: "Bad Request: 'containerId' and 'fileId' are required." };
        }

        context.log("Request to delete knowledge file.", {
            userId: session.homeAccountId,
            containerId: body.containerId,
            fileId: body.fileId
        });

        await deleteKnowledgeFile(body.containerId, body.fileId);

        return { status: 200, body: "File deleted successfully." };

    } catch (error) {
        context.error("Error in knowledgeDelete function.", { 
            userId: session.homeAccountId,
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
        return { status: 500, body: "Internal server error." };
    }
}

app.http('knowledgeDelete', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: knowledgeDelete,
    route: 'knowledge/delete'
});