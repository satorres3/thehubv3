import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function publicConfig(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Providing public configuration to client.');

    // --- DIAGNOSTIC LOGGING ---
    context.log('--- DIAGNOSTIC LOG ---');
    context.log(`MSAL_CLIENT_ID from process.env: ${process.env.MSAL_CLIENT_ID}`);
    context.log(`MSAL_TENANT_ID from process.env: ${process.env.MSAL_TENANT_ID}`);
    context.log(`MSAL_CLIENT_SECRET is set: ${!!process.env.MSAL_CLIENT_SECRET}`);
    context.log('----------------------');
    // --------------------------

    // Check for the presence of essential MSAL variables without throwing an error
    const isMicrosoftConfigured = !!(
        process.env.MSAL_CLIENT_ID &&
        process.env.MSAL_CLIENT_ID !== 'YOUR_MSAL_CLIENT_ID' &&
        process.env.MSAL_TENANT_ID &&
        process.env.MSAL_TENANT_ID !== 'YOUR_MSAL_TENANT_ID' &&
        process.env.MSAL_CLIENT_SECRET &&
        process.env.MSAL_CLIENT_SECRET !== 'YOUR_MSAL_CLIENT_SECRET'
    );
    
    // NOTE: Google login is a client-side mock. A real implementation would require a server-side
    // OAuth flow similar to MSAL, and this flag would check for GOOGLE_* env vars.
    // For now, we report it as not configured from the server's perspective to align with security best practices.
    const isGoogleConfigured = false; 

    return {
        jsonBody: {
            auth: {
                isMicrosoftConfigured,
                isGoogleConfigured
            },
        },
    };
};

app.http('publicConfig', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: publicConfig,
    route: 'config'
});