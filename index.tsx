/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DOM, reQueryDOM } from './src/dom';
import * as handlers from './src/handlers';
import { loadState, saveState } from './src/utils';
import { renderAllContainers, renderBranding, showPage, renderContainerSettings, renderBrandingSettings, renderModelManagementList, showToast, closeModal, updateBrandingPreview, checkForGlobalSettingChanges, renderKnowledgeFiles, setupImageUpload, renderModelPersonaSelectors, applyContainerTheme, applyTheme, renderUserProfile, renderAddContainerSuggestions, openSharePointPicker } from './src/ui';
import { state } from './src/state';
import { DEFAULT_THEME } from './src/constants';
import * as auth from './src/auth';
import { Logger } from './src/logger';
import { loadPublicConfig } from './src/config';

const bindEventListeners = () => {
    const root = document.getElementById('root');
    if (!root) return;

    // Global Click Listener for Popups
    document.body.addEventListener('click', () => handlers.handleCloseAllPopups());

    // Event Delegation from the root element
    root.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;

        // Navigation
        if (target.closest('#google-login')) await handlers.handleGoogleLogin();
        if (target.closest('#microsoft-login')) handlers.handleMicrosoftLogin();

        if (target.closest('#settings-btn')) await showPage('settingsHub');
        if (target.closest('#container-management-card')) await showPage('containerManagement');
        if (target.closest('#global-settings-card')) {
            await showPage('globalSettings');
            state.draftBranding = JSON.parse(JSON.stringify(state.branding));
            state.draftAvailableModels = JSON.parse(JSON.stringify(state.availableModels));
            renderBrandingSettings(state.draftBranding);
            renderModelManagementList();
            checkForGlobalSettingChanges(true);
        }
        if (target.closest('.back-to-hub-btn')) await showPage('hub');
        if (target.closest('#back-to-settings-hub-btn-1') || target.closest('#back-to-settings-hub-btn-2')) await showPage('settingsHub');
        if (target.closest('#back-to-container-management-btn')) await showPage('containerManagement');
        if (target.closest('#back-to-assistant-btn')) {
            const container = state.containers.find(c => c.id === state.currentContainerId);
            await showPage('department', container?.name || 'Assistant');
        }
        if (target.closest('#back-from-knowledge-btn')) {
             const container = state.containers.find(c => c.id === state.currentContainerId);
            if (state.knowledgeBaseSourcePage === 'settings' && container) {
                await showPage('settingsDetail', `Edit ${container.name}`);
                renderContainerSettings(container.id);
            } else {
                await showPage('department', container?.name || 'Assistant');
            }
        }


        // Sidebar Links
        const sidebarAssistantLink = target.closest('#sidebar-assistant-link');
        if (sidebarAssistantLink) {
            e.preventDefault();
            const container = state.containers.find(c => c.id === state.currentContainerId);
            await showPage('department', container?.name || 'Assistant');
        }
        const sidebarKnowledgeLink = target.closest('#sidebar-knowledge-link');
        if (sidebarKnowledgeLink) {
            e.preventDefault();
            const container = state.containers.find(c => c.id === state.currentContainerId);
            if (container) {
                state.knowledgeBaseSourcePage = 'chat';
                await showPage('knowledge', `${container.name} Knowledge`);
                if (DOM.textElements.knowledgeTitle) DOM.textElements.knowledgeTitle.textContent = `Knowledge for ${container.name}`;
                renderKnowledgeFiles();
            }
        }
        
        // Hub Page
        const containerCard = target.closest('#container-grid [data-container-id]');
        if (containerCard) {
            await handlers.handleContainerCardClick((containerCard as HTMLElement).dataset.containerId!);
        }

        // Settings
        const managementCard = target.closest<HTMLElement>('#container-management-grid [data-container-id]');
        if (managementCard) {
            const containerId = managementCard.dataset.containerId!;
            const container = state.containers.find(c => c.id === containerId);
            if (container) {
                await showPage('settingsDetail', `Edit ${container.name}`);
                renderContainerSettings(containerId);
            }
        }
        
        // Tab navigation
        const tabLink = target.closest<HTMLElement>('.tab-link');
        if (tabLink) {
            const tabsContainer = tabLink.parentElement;
            const settingsContainer = tabsContainer?.closest<HTMLElement>('.settings-container');
            if (tabsContainer && settingsContainer) {
                const panels = settingsContainer.querySelectorAll<HTMLElement>('.tab-panel');
                handlers.handleTabClick(tabsContainer, panels, e as MouseEvent);
            }
        }

        // Chat
        if (target.closest('#new-chat-btn')) await handlers.handleNewChat();
        const quickQuestionBtn = target.closest('.quick-question');
        if (quickQuestionBtn && DOM.inputs.chat) {
            DOM.inputs.chat.value = quickQuestionBtn.textContent || '';
            await handlers.handleSendMessage();
        }
        const historyLink = target.closest<HTMLElement>('.sidebar-link[data-chat-id]');
        if (historyLink && state.currentContainerId) {
            await handlers.handleHistoryClick(state.currentContainerId, historyLink.dataset.chatId!);
        }
         const deleteChatBtn = target.closest<HTMLElement>('.delete-chat-btn[data-chat-id]');
        if (deleteChatBtn && state.currentContainerId) {
            e.stopPropagation(); // prevent history click from firing
            await handlers.handleDeleteChatClick(state.currentContainerId, deleteChatBtn.dataset.chatId!);
        }
        
        // Custom Select Dropdowns (Model/Persona)
        const selectTrigger = target.closest<HTMLElement>('.select-trigger');
        if (selectTrigger) {
            e.stopPropagation();
            const parent = selectTrigger.closest<HTMLElement>('.custom-select');
            const isExpanded = selectTrigger.getAttribute('aria-expanded') === 'true';
            
            // Close all other dropdowns first
            document.querySelectorAll('.custom-select.open').forEach(openSelect => {
                if (openSelect !== parent) {
                    openSelect.classList.remove('open');
                    openSelect.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
                    openSelect.querySelector('.select-options')?.classList.add('hidden');
                }
            });

            // Toggle current dropdown
            parent?.classList.toggle('open', !isExpanded);
            selectTrigger.setAttribute('aria-expanded', String(!isExpanded));
            parent?.querySelector('.select-options')?.classList.toggle('hidden', isExpanded);
        }

        const selectOption = target.closest<HTMLElement>('.select-option');
        if (selectOption) {
            const container = state.containers.find(c => c.id === state.currentContainerId);
            if (!container) return;

            const value = selectOption.dataset.value;
            if (!value) return;

            const parentSelect = selectOption.closest<HTMLElement>('.custom-select');
            if (parentSelect?.id === 'model-select-container') {
                container.selectedModel = value;
            } else if (parentSelect?.id === 'persona-select-container') {
                container.selectedPersona = value;
            }
            await saveState();
            renderModelPersonaSelectors(); // Re-render to show selection
            // Close the dropdown
            parentSelect?.classList.remove('open');
            parentSelect?.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
            parentSelect?.querySelector('.select-options')?.classList.add('hidden');
        }

        // Attachments
        if (target.closest('#attachment-btn')) {
            e.stopPropagation();
            handlers.handleCloseAllPopups(DOM.containers.attachmentOptions);
            DOM.containers.attachmentOptions?.classList.toggle('hidden');
        }
        if (target.closest('#upload-computer-btn')) DOM.inputs.fileUpload?.click();
        if (target.closest('#upload-sharepoint-btn')) {
            openSharePointPicker({
                mode: 'single',
                onSelect: handlers.handleSharePointFileForChat
            });
        }
        if (target.closest('#remove-attachment-btn')) handlers.handleRemoveAttachment();
        
        // User Profile Dropdown
        const userProfileTrigger = target.closest('.user-profile-trigger');
        if (userProfileTrigger) {
            e.stopPropagation();
            const dropdown = userProfileTrigger.nextElementSibling;
            const isExpanded = userProfileTrigger.getAttribute('aria-expanded') === 'true';
            handlers.handleCloseAllPopups(userProfileTrigger.parentElement!);
            if (!isExpanded) {
                dropdown?.classList.remove('hidden');
                userProfileTrigger.setAttribute('aria-expanded', 'true');
            }
        }
        if (target.closest('.dropdown-link[data-action="logout"]')) handlers.handleLogout();

        // Modals
        if (target.closest('#add-container-btn')) await handlers.handleAddContainerClick();
        if (target.closest('#close-modal-btn')) closeModal(DOM.modals.addContainer);
        if (target.closest('#cancel-container-btn')) closeModal(DOM.modals.addContainer);
        if (target.closest('#close-function-runner-btn')) closeModal(DOM.modals.functionRunner);
        if (target.closest('#cancel-function-runner-btn')) closeModal(DOM.modals.functionRunner);
        if (target.closest('#close-delete-modal-btn')) closeModal(DOM.modals.deleteConfirm);
        if (target.closest('#cancel-delete-btn')) closeModal(DOM.modals.deleteConfirm);
        
        const suggestedItemBtn = target.closest<HTMLButtonElement>('.suggested-item button[data-item-type]');
        if (suggestedItemBtn && state.draftNewContainer) {
            e.stopPropagation();
            const type = suggestedItemBtn.dataset.itemType;
            const value = suggestedItemBtn.dataset.itemValue;
            if (!type || !value) return;
        
            switch (type) {
                case 'question':
                    state.draftNewContainer.quickQuestions = state.draftNewContainer.quickQuestions.filter(q => q !== value);
                    break;
                case 'persona':
                    state.draftNewContainer.availablePersonas = state.draftNewContainer.availablePersonas.filter(p => p !== value);
                    break;
                case 'function':
                    state.draftNewContainer.functions = state.draftNewContainer.functions.filter(f => f.name !== value);
                    break;
            }
            renderAddContainerSuggestions();
        }

        // Actions
        if (target.closest('#confirm-delete-btn')) await handlers.handleConfirmDelete();
        if (target.closest('#delete-container-btn')) await handlers.handleDeleteContainerClick();
        if (target.closest('#generate-ai-btn')) await handlers.handleGenerateContainerDetails();
        if (target.closest('#sidebar-toggle-btn')) DOM.pageViews.department?.classList.toggle('sidebar-open');
        if (target.closest('#generate-function-btn')) await handlers.handleGenerateFunction();
        if (target.closest('#suggest-questions-btn')) await handlers.handleSuggestQuestions();
        if (target.closest('#suggest-personas-btn')) await handlers.handleSuggestPersonas();
        if (target.closest('#manage-knowledge-btn')) {
             if (!state.currentSettingsContainerId) return;
            state.currentContainerId = state.currentSettingsContainerId;
            const container = state.containers.find(c => c.id === state.currentContainerId);
            if (container) {
                state.knowledgeBaseSourcePage = 'settings';
                await showPage('knowledge', `${container.name} Knowledge`);
                if (DOM.textElements.knowledgeTitle) DOM.textElements.knowledgeTitle.textContent = `Knowledge for ${container.name}`;
                renderKnowledgeFiles();
            }
        }
        if (target.closest('#knowledge-upload-btn')) DOM.inputs.knowledgeFile?.click();
        if (target.closest('#knowledge-add-sharepoint-btn')) {
            openSharePointPicker({
                mode: 'multiple',
                onSelect: handlers.handleSharePointFilesForKnowledge,
            });
        }
        
        // Settings Save/Cancel
        if (target.closest('#save-settings-btn')) {
            if (!state.currentSettingsContainerId || !state.draftSettingsContainer) return;
            const index = state.containers.findIndex(c => c.id === state.currentSettingsContainerId);
            if (index > -1) {
                state.containers[index] = state.draftSettingsContainer;
                await saveState();
                renderAllContainers(); // Update hub/management lists
                applyContainerTheme(state.draftSettingsContainer); // Apply new theme if it was changed
                showToast('Settings saved successfully!');
                await showPage('containerManagement');
            }
        }
        if (target.closest('#cancel-settings-btn')) await showPage('containerManagement');

        // Global Settings Save/Cancel
        if (target.closest('#save-global-settings-btn')) {
            if (!state.draftBranding || !state.draftAvailableModels) return;
            state.branding = state.draftBranding;
            state.availableModels = state.draftAvailableModels;
            await saveState();
            renderBranding();
            applyTheme(DEFAULT_THEME);
            renderBrandingSettings(state.branding);
            showToast('Global settings saved!');
            checkForGlobalSettingChanges(true);
        }
        if (target.closest('#cancel-global-settings-btn')) {
            state.draftBranding = JSON.parse(JSON.stringify(state.branding));
            state.draftAvailableModels = JSON.parse(JSON.stringify(state.availableModels));
            renderBrandingSettings(state.draftBranding);
            renderModelManagementList();
            checkForGlobalSettingChanges(true);
        }
    });

    // Form Submissions and Inputs
    root.addEventListener('submit', async (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('#chat-form')) { e.preventDefault(); await handlers.handleSendMessage(); }
        if (target.closest('#add-container-form')) await handlers.handleCreateContainer(e);
        if (target.closest('#add-quick-question-form')) handlers.handleAddQuickQuestion(e);
        if (target.closest('#add-persona-form')) handlers.handleAddPersona(e);
        if (target.closest('#add-accessor-form')) handlers.handleAddAccessor(e);
        if (target.closest('#add-model-form')) handlers.handleAddModel(e);
    });
    
    root.addEventListener('input', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('#chat-input')) {
            if (!DOM.inputs.chat) return;
            DOM.buttons.sendChat.disabled = DOM.inputs.chat.value.trim().length === 0 && !state.attachedFile;
            DOM.inputs.chat.style.height = 'auto';
            DOM.inputs.chat.style.height = `${DOM.inputs.chat.scrollHeight}px`;
        }
        if (target.closest('#container-name-input')) handlers.handleContainerNameInput();
    });

    root.addEventListener('change', async (e) => {
        const target = e.target as HTMLElement;
        if (target.id === 'file-upload-input') await handlers.handleFileSelect((target as HTMLInputElement).files!);
        if (target.id === 'knowledge-file-input') await handlers.handleKnowledgeFileChange((target as HTMLInputElement).files);
        if (target.id === 'container-type-select' && DOM.containers.containerWebsiteGroup) {
            DOM.containers.containerWebsiteGroup.classList.toggle('hidden', (target as HTMLSelectElement).value !== 'product');
        }
    });

    root.addEventListener('keydown', async (e) => {
        if (e.target === DOM.inputs.chat && e.key === 'Enter' && !e.shiftKey && !DOM.buttons.sendChat?.disabled) {
            e.preventDefault();
            await handlers.handleSendMessage();
        }
    });
    
    // Drag and Drop for knowledge files
    root.addEventListener('dragover', (e) => {
        if((e.target as HTMLElement).closest('#file-dropzone')) {
            e.preventDefault();
            (e.target as HTMLElement).closest('#file-dropzone')?.classList.add('dragover');
        }
    });
    root.addEventListener('dragleave', (e) => {
        const dropzone = (e.target as HTMLElement).closest('#file-dropzone');
        if (dropzone) dropzone.classList.remove('dragover');
    });
    root.addEventListener('drop', async (e) => {
         const dropzone = (e.target as HTMLElement).closest('#file-dropzone');
        if (dropzone) {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            await handlers.handleKnowledgeFileDrop(e.dataTransfer?.files);
        }
    });

    // Cookies
    DOM.buttons.acceptCookies?.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        DOM.containers.cookieBanner?.classList.add('hidden');
    });

    // Custom Image Uploads are bound after page load inside showPage
};

const initializeApp = async () => {
    Logger.log("Application initialization started.");
    try {
        Logger.log("Re-querying DOM elements.");
        reQueryDOM();

        Logger.log("Loading public server configuration...");
        await loadPublicConfig();
        
        Logger.log("Loading application state...");
        await loadState();
        Logger.log("Application state loaded.", { containers: state.containers.length });

        Logger.log("Rendering global branding.");
        renderBranding();
        
        Logger.log("Binding event listeners.");
        bindEventListeners();

        Logger.log("Checking for active session...");
        const user = await auth.checkSession();

        if (user) {
            Logger.log("Active session found. User profile loaded.", { user: user.email });
            state.currentUser = user;
            applyTheme(DEFAULT_THEME);
            await showPage('hub');
            renderUserProfile();
            Logger.log("User logged in. Hub page displayed.");
        } else {
            Logger.log("No active user session. Login page displayed.");
            await showPage('login');
        }
        Logger.log("Application initialization completed successfully.");
    } catch (error) {
        Logger.error("A critical error occurred during initialization:", error);
        reQueryDOM(); // Ensure toast is available
        const errorMessage = error instanceof Error ? error.message : "Application failed to initialize.";
        showToast(errorMessage, 'error');
        // Intentionally don't call showPage('login') as the app state is uncertain.
    }
};

document.addEventListener('DOMContentLoaded', initializeApp);
