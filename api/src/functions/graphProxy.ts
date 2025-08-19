import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getSession, acquireTokenOnBehalfOf } from "../shared/session";

const GRAPH_ENDPOINT_BASE = 'https://graph.microsoft.com/v1.0';

export async function graphProxy(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const session = getSession(request);
    if (!session) {
        return { status: 401, body: "Unauthorized: No valid session." };
    }

    const path = request.query.get('path');
    if (!path) {
        return { status: 400, body: "Bad Request: 'path' query parameter is required." };
    }

    try {
        const accessToken = await acquireTokenOnBehalfOf(session.homeAccountId);
        if (!accessToken) {
            return { status: 401, body: "Unauthorized: Could not acquire token." };
        }
        
        const graphUrl = `${GRAPH_ENDPOINT_BASE}${path}`;
        context.log("Proxying request to Microsoft Graph.", {
            userId: session.homeAccountId,
            path: path
        });

        const graphResponse = await fetch(graphUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });
        
        context.log("Received response from Microsoft Graph.", {
            userId: session.homeAccountId,
            path: path,
            status: graphResponse.status
        });

        const responseBody = await graphResponse.blob();

        return {
            status: graphResponse.status,
            headers: {
                'Content-Type': graphResponse.headers.get('Content-Type') || 'application/octet-stream',
            },
            body: await responseBody.arrayBuffer(),
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        context.error("Error in Graph proxy.", {
            userId: session.homeAccountId,
            path: path,
            error: errorMessage
        });
        if (typeof error === 'object' && error !== null && (error as any).name === 'InteractionRequiredError') {
             return { status: 401, body: "Interaction required for authentication." };
        }
        return { status: 500, body: "Internal server error while calling Graph API." };
    }
}

app.http('graphProxy', {
    methods: ['GET'],
    authLevel: 'anonymous', // We use cookie-based session auth
    handler: graphProxy,
    // Define a route that captures the rest of the path
    route: 'graph'
});