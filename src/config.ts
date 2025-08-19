/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Logger } from './logger';

interface PublicConfig {
    auth: {
        isMicrosoftConfigured: boolean;
        isGoogleConfigured: boolean;
    };
}

// Default config, assuming nothing is configured until we hear from the server.
export let publicConfig: PublicConfig = {
    auth: {
        isMicrosoftConfigured: false,
        isGoogleConfigured: false,
    }
};

/**
 * Fetches the public configuration from the server and stores it.
 * This should be called once on application startup.
 */
export async function loadPublicConfig() {
    try {
        Logger.log("Fetching public configuration from server...");
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        const data = await response.json();
        publicConfig = data;
        Logger.log("Public configuration loaded.", publicConfig);
    } catch (error) {
        Logger.error("Could not load server configuration. Auth providers may be disabled.", error);
        // Stick with the default (all false) config.
    }
}
