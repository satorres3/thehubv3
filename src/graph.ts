/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { fileToBase64 } from './utils';
import type { FileForUpload } from './types';

/**
 * A generic fetch wrapper for calling our backend Graph proxy.
 * @param endpoint The Graph API endpoint to call (e.g., '/sites?search=*').
 * @param rawResponse If true, returns the raw Response object for handling blobs.
 */
async function graphFetch(endpoint: string, rawResponse: boolean = false): Promise<any> {
    const response = await fetch(`/api/graph?path=${encodeURIComponent(endpoint)}`);

    if (!response.ok) {
        try {
            const error = await response.json();
            console.error("Graph API Proxy Error:", error);
            throw new Error(`Graph API request failed: ${error.error?.message || response.statusText}`);
        } catch (e) {
            throw new Error(`Graph API request failed with status: ${response.status}`);
        }
    }

    if (rawResponse) {
        return response;
    }

    return response.json();
}

export async function getSharePointSites() {
    const data = await graphFetch('/sites?search=*');
    return data.value.map((site: any) => ({
        id: site.id,
        name: site.displayName,
        url: site.webUrl
    }));
}

export async function getDriveItems(siteId: string, itemId: string = 'root') {
    const data = await graphFetch(`/sites/${siteId}/drive/items/${itemId}/children?$select=id,name,webUrl,file,folder,size`);
    return data.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        isFolder: !!item.folder,
        size: item.size,
        mimeType: item.file?.mimeType
    }));
}

export async function getDriveItemContent(siteId: string, itemId: string): Promise<string> {
    const response: Response = await graphFetch(`/sites/${siteId}/drive/items/${itemId}/content`, true);
    const blob = await response.blob();
    return fileToBase64(new File([blob], "temp"));
}

export async function downloadSharePointFile(siteId: string, itemId: string, name: string, mimeType: string, size: number): Promise<FileForUpload> {
    const base64Content = await getDriveItemContent(siteId, itemId);
    return {
        name,
        type: mimeType,
        size,
        base64Content,
    };
}