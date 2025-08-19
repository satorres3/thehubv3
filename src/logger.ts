/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const getTimestamp = () => new Date().toISOString();

/**
 * A simple logger utility to provide consistent, timestamped console output for debugging.
 */
export const Logger = {
    log: (message: string, ...optionalParams: any[]) => {
        console.log(`[${getTimestamp()}] HubApp Info: ${message}`, ...optionalParams);
    },
    warn: (message: string, ...optionalParams: any[]) => {
        console.warn(`[${getTimestamp()}] HubApp Warn: ${message}`, ...optionalParams);
    },
    error: (message: string, error?: any) => {
        console.error(`[${getTimestamp()}] HubApp Error: ${message}`, error);
    },
};
