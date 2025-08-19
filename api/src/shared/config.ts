/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Safely loads and exposes environment variables for the backend functions.
 * Throws an error if a required variable is missing.
 */

function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const config = {
    app: {
        uri: getRequiredEnv('APP_URI'),
    },
    msal: {
        clientId: getRequiredEnv('MSAL_CLIENT_ID'),
        tenantId: getRequiredEnv('MSAL_TENANT_ID'),
        clientSecret: getRequiredEnv('MSAL_CLIENT_SECRET'),
    },
    gemini: {
        apiKey: getRequiredEnv('GEMINI_API_KEY'),
    },
    session: {
        secret: getRequiredEnv('SESSION_SECRET'),
        cookieName: 'HUB_SESSION',
    }
};