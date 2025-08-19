import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getSession, acquireTokenOnBehalfOf } from "../shared/session";

const GRAPH_ENDPOINTS = {
    ME: "https://graph.microsoft.com/v1.0/me",
    PHOTO: "https://graph.microsoft.com/v1.0/me/photo/$value"
};

async function fetchWithToken(url: string, token: string) {
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error(`Graph API call failed for ${url} with status ${response.status}`);
    }
    return response;
}


export async function userProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("UserProfile function invoked. Received cookies:", request.headers.get('cookie'));
    const session = getSession(request);

    if (!session) {
        return { status: 401, body: "Unauthorized: No session found." };
    }

    try {
        context.log("User profile request received.", { userId: session.homeAccountId });
        const accessToken = await acquireTokenOnBehalfOf(session.homeAccountId);
        if (!accessToken) {
             return { status: 401, body: "Unauthorized: Could not acquire token." };
        }

        // Fetch profile and photo in parallel
        const [profileResponse, photoResponse] = await Promise.all([
            fetchWithToken(GRAPH_ENDPOINTS.ME, accessToken),
            fetchWithToken(GRAPH_ENDPOINTS.PHOTO, accessToken).catch(() => null) // Ignore photo errors
        ]);

        const profileData = await profileResponse.json();
        let avatarUrl = '';
        if (photoResponse?.ok) {
            const blob = await photoResponse.blob();
            const buffer = Buffer.from(await blob.arrayBuffer());
            avatarUrl = `data:${blob.type};base64,${buffer.toString('base64')}`;
        }
        
        const user = {
            firstName: profileData.givenName || '',
            lastName: profileData.surname || '',
            email: profileData.userPrincipalName || '',
            avatarUrl: avatarUrl
        };

        context.log("Successfully fetched user profile.", {
            userId: session.homeAccountId,
            email: user.email
        });

        return { jsonBody: user };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        context.error("Error fetching user profile.", {
            userId: session.homeAccountId,
            error: errorMessage
        });
         if (typeof error === 'object' && error !== null && (error as any).name === 'InteractionRequiredError') {
             return { status: 401, body: "Interaction required for authentication." };
        }
        return { status: 500, body: "Failed to fetch user profile." };
    }
};

app.http('userProfile', {
    methods: ['GET'],
    authLevel: 'anonymous', // We use cookie-based session auth
    handler: userProfile,
    route: 'user/profile'
});