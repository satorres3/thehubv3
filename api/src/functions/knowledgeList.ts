import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getSession } from "../shared/session";
import { listKnowledgeFiles } from "../shared/knowledge";

export async function knowledgeList(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const session = getSession(request);
    if (!session) {
        return { status: 401, body: "Unauthorized: No valid session." };
    }

    try {
        const containerId = request.query.get('containerId');
        if (!containerId) {
            return { status: 400, body: "Bad Request: 'containerId' query parameter is required." };
        }

        context.log("Request to list knowledge files.", {
            userId: session.homeAccountId,
            containerId: containerId
        });

        const files = await listKnowledgeFiles(containerId);

        return { jsonBody: files };

    } catch (error) {
        context.error("Error in knowledgeList function.", { 
            userId: session.homeAccountId,
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
        return { status: 500, body: "Internal server error." };
    }
}

app.http('knowledgeList', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: knowledgeList,
    route: 'knowledge/list'
});