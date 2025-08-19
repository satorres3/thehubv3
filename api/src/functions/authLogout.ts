import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getMsalClient } from "../shared/msal";
import { clearSessionCookie, getSession } from "../shared/session";
import { config } from "../shared/config";

export async function authLogout(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const session = getSession(request);
    
    if (session) {
        try {
            const msalClient = getMsalClient();
            const account = await msalClient.getTokenCache().getAccountByHomeId(session.homeAccountId);
            if (account) {
                await msalClient.getTokenCache().removeAccount(account);
                context.log(`MSAL account removed from cache for homeAccountId: ${session.homeAccountId}`);
            }
        } catch (error) {
            context.error("Error removing account from MSAL cache during logout:", error);
        }
    }

    return {
        status: 302,
        headers: {
            "Location": config.app.uri,
            "Set-Cookie": clearSessionCookie()
        },
        body: "Logging out..."
    };
}

app.http('authLogout', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: authLogout,
    route: 'auth/logout'
});