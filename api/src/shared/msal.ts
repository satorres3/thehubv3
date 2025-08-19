import * as msal from "@azure/msal-node";
import { config } from "./config";

let msalClient: msal.ConfidentialClientApplication | null = null;

export function getMsalClient(): msal.ConfidentialClientApplication {
    if (msalClient) {
        return msalClient;
    }

    const msalConfig: msal.Configuration = {
        auth: {
            clientId: config.msal.clientId,
            authority: `https://login.microsoftonline.com/${config.msal.tenantId}`,
            clientSecret: config.msal.clientSecret,
        },
        system: {
            loggerOptions: {
                loggerCallback(loglevel, message, containsPii) {
                    console.log(message);
                },
                piiLoggingEnabled: false,
                logLevel: msal.LogLevel.Verbose,
            }
        }
    };

    msalClient = new msal.ConfidentialClientApplication(msalConfig);
    return msalClient;
}