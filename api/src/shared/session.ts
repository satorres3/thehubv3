import { HttpRequest } from "@azure/functions";
import * as crypto from "crypto";
import * as cookie from "cookie";
import * as msal from "@azure/msal-node";
import { config } from "./config";
import { getMsalClient } from "./msal";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY = crypto.createHash('sha256').update(String(config.session.secret)).digest();

interface SessionData {
    homeAccountId: string;
}

function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

function decrypt(encryptedText: string): string {
    const data = Buffer.from(encryptedText, 'hex');
    const iv = data.slice(0, IV_LENGTH);
    const authTag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
}

export function createSessionCookie(homeAccountId: string): string {
    const sessionData: SessionData = { homeAccountId };
    const encryptedSession = encrypt(JSON.stringify(sessionData));

    return cookie.serialize(config.session.cookieName, encryptedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        path: "/",
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export function getSession(request: HttpRequest): SessionData | null {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    const sessionCookie = cookies[config.session.cookieName];

    if (!sessionCookie) {
        return null;
    }

    try {
        const decrypted = decrypt(sessionCookie);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error("Failed to decrypt session cookie:", error);
        return null;
    }
}

export function clearSessionCookie(): string {
    return cookie.serialize(config.session.cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: 'lax',
        expires: new Date(0),
    });
}


export async function acquireTokenOnBehalfOf(homeAccountId: string): Promise<string | null> {
    const msalClient = getMsalClient();
    try {
        const account = await msalClient.getTokenCache().getAccountByHomeId(homeAccountId);
        if (!account) {
            console.warn(`Could not find account in cache for homeAccountId: ${homeAccountId}`);
            return null;
        }

        const silentRequest = {
            account: account,
            scopes: ["User.Read", "Files.Read.All", "offline_access"],
        };
        
        const response = await msalClient.acquireTokenSilent(silentRequest);
        return response?.accessToken || null;

    } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
             console.warn("Silent token acquisition failed, interaction required.", error);
             // Propagate the error to let the caller know re-authentication is needed.
             throw { name: 'InteractionRequiredError', message: error.errorMessage };
        }
        console.error("Error in acquireTokenOnBehalfOf:", error);
        return null;
    }
}