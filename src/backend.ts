/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DEFAULT_BRANDING, DEFAULT_MODELS, INITIAL_CONTAINERS_DATA } from "./constants";
import type { AIModel, Branding, Container, KnowledgeFile } from "./types";

// NOTE: This file is a client-side simulation of a backend for development purposes.
// It helps initialize the app's state if a real backend is not available.

const APP_STATE_KEY = 'appState';
const KNOWLEDGE_FILES_CONTENT_KEY = 'knowledgeFilesContent';


interface AppStatePayload {
    containers: Container[];
    branding: Branding;
    availableModels: AIModel[];
}

/**
 * Loads the entire application state from the backend.
 *
 * This is a simulation that uses localStorage. If no state is found,
 * it initializes the app with default data from constants.
 */
export async function loadAppState(): Promise<AppStatePayload> {
    console.log("Simulating API call to load app state...");
    await new Promise(resolve => setTimeout(resolve, 100));

    const savedStateJSON = localStorage.getItem(APP_STATE_KEY);
    if (savedStateJSON) {
        try {
            const parsed = JSON.parse(savedStateJSON);
            if (parsed && Array.isArray(parsed.containers) && parsed.branding && Array.isArray(parsed.availableModels)) {
                // MIGRATION: Ensure knowledgeBase files have IDs and no content.
                // This cleans up state from older versions of the app.
                parsed.containers.forEach((container: Container) => {
                    if (Array.isArray(container.knowledgeBase)) {
                         container.knowledgeBase = container.knowledgeBase.map((file: any) => ({
                            id: file.id || `file-${Date.now()}-${Math.random().toString(36).substring(2)}`,
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            uploadDate: file.uploadDate,
                        }));
                    } else {
                        container.knowledgeBase = [];
                    }
                });
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse state from localStorage, initializing with defaults.", e);
            localStorage.removeItem(APP_STATE_KEY);
            localStorage.removeItem(KNOWLEDGE_FILES_CONTENT_KEY);
        }
    }

    // If no valid state is in localStorage, create the initial state.
    console.log("No valid saved state found, creating initial state from constants.");
    const initialContainers: Container[] = INITIAL_CONTAINERS_DATA.map((c, index) => ({
        ...c,
        id: `cont-${Date.now()}-${index}`,
        chats: [],
        activeChatId: null,
        knowledgeBase: [], // knowledgeBase is now metadata-only and managed via API
    }));

    // Initialize an empty content store for files.
    if (!localStorage.getItem(KNOWLEDGE_FILES_CONTENT_KEY)) {
        localStorage.setItem(KNOWLEDGE_FILES_CONTENT_KEY, JSON.stringify({}));
    }

    return {
        containers: initialContainers,
        branding: DEFAULT_BRANDING,
        availableModels: DEFAULT_MODELS,
    };
}

/**
 * Saves the entire application state to the backend.
 * This client-side simulation only saves the main application state.
 * File content is now managed by dedicated API endpoints.
 */
export async function saveAppState(appState: AppStatePayload): Promise<void> {
    console.log("Simulating API call to save app state...");
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
        // Deep clone to avoid modifying the original state object
        const stateToSave = JSON.parse(JSON.stringify(appState));

        // Ensure no base64 content is ever saved in the main state object
        stateToSave.containers.forEach((container: Container) => {
            if (container.knowledgeBase) {
                container.knowledgeBase = container.knowledgeBase.map((file: KnowledgeFile) => ({
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadDate: file.uploadDate,
                }));
            }
        });

        const jsonState = JSON.stringify(stateToSave);
        localStorage.setItem(APP_STATE_KEY, jsonState);
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
}