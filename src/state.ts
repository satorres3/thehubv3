/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Container, Branding, AIModel, DraftNewContainer, AppFunction, ItemToDelete, User } from './types';
import { DEFAULT_BRANDING, DEFAULT_MODELS } from './constants';

interface AppState {
    containers: Container[];
    branding: Branding;
    availableModels: AIModel[];
    draftBranding: Branding | null;
    draftAvailableModels: AIModel[] | null;
    currentContainerId: string | null;
    currentSettingsContainerId: string | null;
    draftSettingsContainer: Container | null;
    attachedFile: { name: string; type: string; base64: string } | null;
    draftNewContainer: DraftNewContainer | null;
    currentRunningFunction: AppFunction | null;
    itemToDelete: ItemToDelete;
    currentUser: User | null;
    knowledgeBaseSourcePage: 'chat' | 'settings' | null;
}

export const state: AppState = {
    containers: [],
    branding: { ...DEFAULT_BRANDING },
    availableModels: [...DEFAULT_MODELS],
    draftBranding: null,
    draftAvailableModels: null,
    currentContainerId: null,
    currentSettingsContainerId: null,
    draftSettingsContainer: null,
    attachedFile: null,
    draftNewContainer: null,
    currentRunningFunction: null,
    itemToDelete: null,
    currentUser: null,
    knowledgeBaseSourcePage: null,
};