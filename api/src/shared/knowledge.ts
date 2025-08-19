/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { AIModel, Branding, Container, KnowledgeFile } from "./types";

// NOTE: This file simulates a database for the knowledge base.
// The data is stored in-memory and is NOT PERSISTENT. It will reset
// whenever the Azure Function worker restarts. This is for demonstration
// purposes of the API architecture. In a real application, this would be
// replaced with a persistent storage solution like Azure Blob Storage and Cosmos DB.

interface AppStatePayload {
    containers: Container[];
    branding: Branding;
    availableModels: AIModel[];
}

interface KnowledgeFileWithContent extends KnowledgeFile {
    base64Content: string;
}

// In-memory store
let appState: AppStatePayload | null = null;
let knowledgeFilesContent: Record<string, string> = {}; // { [fileId]: "base64..." }

// Simulate loading initial state into memory once
function _ensureStateLoaded() {
    if (appState) return;

    // In a real app, you would load this from a database.
    // For this simulation, we'll just keep it in memory.
    // We don't have access to the client's localStorage, so we can't initialize
    // with the same data. The backend state will be independent.
    console.log("Initializing in-memory backend state for the first time.");
    appState = {
        containers: [],
        branding: {} as Branding,
        availableModels: [] as AIModel[],
    };
    knowledgeFilesContent = {};
}

// Helper to find a container
function _getContainer(containerId: string): Container | undefined {
    _ensureStateLoaded();
    return appState!.containers.find(c => c.id === containerId);
}

// Public API for knowledge management
export async function listKnowledgeFiles(containerId: string): Promise<KnowledgeFile[]> {
    const container = _getContainer(containerId);
    return container ? container.knowledgeBase : [];
}

export async function addKnowledgeFile(
    containerId: string,
    fileData: { name: string; type: string; size: number; base64Content: string }
): Promise<KnowledgeFile> {
    const container = _getContainer(containerId);
    if (!container) {
        throw new Error(`Container with ID ${containerId} not found.`);
    }

    const newFile: KnowledgeFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        uploadDate: new Date().toISOString(),
    };

    container.knowledgeBase.push(newFile);
    knowledgeFilesContent[newFile.id] = fileData.base64Content;

    return newFile;
}

export async function deleteKnowledgeFile(containerId: string, fileId: string): Promise<void> {
    const container = _getContainer(containerId);
    if (container) {
        container.knowledgeBase = container.knowledgeBase.filter(f => f.id !== fileId);
        delete knowledgeFilesContent[fileId];
    }
}

export async function getKnowledgeFilesWithContent(containerId: string): Promise<KnowledgeFileWithContent[]> {
    const container = _getContainer(containerId);
    if (!container) return [];

    return container.knowledgeBase.map(fileMeta => ({
        ...fileMeta,
        base64Content: knowledgeFilesContent[fileMeta.id] || "",
    }));
}

// This function would be used by a state management endpoint if we had one.
// For now, it's unused but shows how the state would be managed.
export function initializeState(initialState: AppStatePayload) {
    console.log("Backend in-memory state is being re-initialized.");
    appState = JSON.parse(JSON.stringify(initialState)); // Deep clone
    knowledgeFilesContent = {}; // Clear file content on re-init
}