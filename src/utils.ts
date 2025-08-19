/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { state } from './state';
import { DEFAULT_BRANDING, DEFAULT_MODELS } from './constants';
import { loadAppState as apiLoad, saveAppState as apiSave } from './backend';

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const markdownToHtml = (md: string): string => {
    let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return html.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^\s*[\*-] (.*$)/gim, '<li>$1</li>').replace(/(<\/li>\s*<li>)/g, '</li><li>')
        .replace(/((<li>.*<\/li>)+)/gs, '<ul>$1</ul>').replace(/\n/g, '<br />').replace(/<br \/>\s*<h[1-3]>/g, '<h$1>')
        .replace(/<\/h[1-3]>\s*<br \/>/g, '</h3>').replace(/<br \/>\s*<ul>/g, '<ul>').replace(/<\/ul>\s*<br \/>/g, '</ul>');
};

export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

export const saveState = async () => {
    try {
        const appState = {
            containers: state.containers,
            branding: state.branding,
            availableModels: state.availableModels
        };
        await apiSave(appState);
    } catch (error) {
        console.error("Could not save state to backend:", error);
    }
};

export const loadState = async () => {
    try {
        // Check if state was already loaded (e.g., from initial data)
        const isFirstLoad = localStorage.getItem('appState') === null;
        const parsedState = await apiLoad();

        state.containers = parsedState.containers || [];
        // Deep merge branding to handle new properties gracefully
        state.branding = {
            ...DEFAULT_BRANDING,
            ...(parsedState.branding || {}),
            integrations: {
                ...DEFAULT_BRANDING.integrations,
                ...(parsedState.branding?.integrations || {}),
            }
        };
        state.availableModels = parsedState.availableModels || [...DEFAULT_MODELS];

        // If this was the very first load (no data in localStorage),
        // save the initial state back to the 'backend'
        if (isFirstLoad) {
            await saveState();
        }
    } catch (error) {
        console.error("Could not load state from backend:", error);
        // Fallback to defaults
        state.containers = [];
        state.branding = { ...DEFAULT_BRANDING };
        state.availableModels = [...DEFAULT_MODELS];
    }
};