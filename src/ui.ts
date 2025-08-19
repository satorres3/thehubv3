/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DOM, reQueryDOM } from "./dom";
import { state } from "./state";
import { fileToBase64, markdownToHtml, formatBytes, formatDate } from "./utils";
import { AVAILABLE_ICONS, CARD_IMAGE_OPTIONS, DEFAULT_MODELS } from "./constants";
import type { AppFunction, Branding, ChatTheme, Container, KnowledgeFile, Part, User } from "./types";
import { handleDeleteAccessor, handleDeleteChatClick, handleDeleteFileClick, handleDeleteFunction, handleDeleteModel, handleDeletePersona, handleDeleteQuickQuestion, handleSettingChange } from "./handlers";
import { generateQuestionsFromKnowledge, listKnowledgeFiles } from "./api";
import { publicConfig } from "./config";
import * as graph from './graph';

// UTILITY RENDER FUNCTIONS =======================================================

export const renderIcon = (element: HTMLElement | null, svgString: string) => {
    if (element) {
        element.innerHTML = svgString;
    }
};

export const applyTheme = (theme: ChatTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--user-message-bg', theme.userBg);
    root.style.setProperty('--user-message-text', theme.userText);
    root.style.setProperty('--bot-message-bg', theme.botBg);
    root.style.setProperty('--bot-message-text', theme.botText);
    root.style.setProperty('--bg-gradient-start', theme.bgGradientStart);
    root.style.setProperty('--bg-gradient-end', theme.bgGradientEnd);
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-text', theme.sidebarText);
    root.style.setProperty('--sidebar-highlight-bg', theme.sidebarHighlightBg);
};

export const applyContainerTheme = (container: Container) => {
    applyTheme(container.theme);
};

export const updateAppearancePreview = (theme: ChatTheme, previewContainer: HTMLElement | null, sidebarPreview: HTMLElement | null) => {
    if (!previewContainer) return;
    (previewContainer as HTMLElement).style.setProperty('--preview-bg-start', theme.bgGradientStart);
    (previewContainer as HTMLElement).style.setProperty('--preview-bg-end', theme.bgGradientEnd);
    (previewContainer as HTMLElement).style.setProperty('--preview-user-bg', theme.userBg);
    (previewContainer as HTMLElement).style.setProperty('--preview-user-text', theme.userText);
    (previewContainer as HTMLElement).style.setProperty('--preview-bot-bg', theme.botBg);
    (previewContainer as HTMLElement).style.setProperty('--preview-bot-text', theme.botText);

    if (sidebarPreview) {
        (sidebarPreview as HTMLElement).style.setProperty('--preview-sidebar-bg', theme.sidebarBg);
        (sidebarPreview as HTMLElement).style.setProperty('--preview-sidebar-text', theme.sidebarText);
        (sidebarPreview as HTMLElement).style.setProperty('--preview-sidebar-highlight-bg', theme.sidebarHighlightBg);
    }
};

export const updateBrandingPreview = (branding: Branding) => {
    reQueryDOM(); // Ensure DOM refs are fresh
    if (DOM.textElements.brandingPreviewTitle) DOM.textElements.brandingPreviewTitle.textContent = branding.loginTitle;
    if (DOM.textElements.brandingPreviewSubtitle) DOM.textElements.brandingPreviewSubtitle.textContent = branding.loginSubtitle;
    if (DOM.previews.brandingLogo) {
        DOM.previews.brandingLogo.innerHTML = branding.appLogo ? `<img src="${branding.appLogo}" alt="App Logo Preview">` : '';
    }
};


const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
    if (mimeType === 'application/pdf') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12v-1h4v1"></path><path d="M10 15h4"></path><path d="M14 18h-4"></path></svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
};

const createContainerCard = (container: Container, isManagement: boolean) => {
    const card = document.createElement('div');
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.dataset.containerId = container.id;

    if (isManagement) {
        card.className = 'management-card';
        card.innerHTML = `
            <div class="management-card-bg"></div>
            <div class="management-card-overlay">
                <h3 class="management-card-title">${container.name}</h3>
                <p class="management-card-description">${container.description}</p>
            </div>
        `;
        const bgElement = card.querySelector('.management-card-bg') as HTMLElement;
        if (bgElement) {
            bgElement.style.backgroundImage = `url(${container.cardImageUrl})`;
        }
    } else {
        card.className = 'container-card';
        card.innerHTML = `
            <div class="container-icon">${container.icon.startsWith('<svg') ? container.icon : `<img src="${container.icon}" alt="${container.name} icon">`}</div>
            <h3 class="container-title">${container.name}</h3>
            <p class="container-description">${container.description}</p>
        `;
    }

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
    return card;
};

// This function ensures that branding elements present on every page (like headers) are updated.
export const renderPageBranding = () => {
    reQueryDOM();
    const { branding } = state;
    document.title = branding.hubHeaderTitle;

    // Elements that could be in any page's header
    if (DOM.textElements.hubHeaderTitle) DOM.textElements.hubHeaderTitle.textContent = branding.hubHeaderTitle;
    if (DOM.containers.hubAppLogo) {
         const logoHtml = branding.appLogo ? `<img src="${branding.appLogo}" alt="App Logo">` : DEFAULT_MODELS[0].icon;
         DOM.containers.hubAppLogo.innerHTML = logoHtml;
    }
};

export const renderUserProfile = () => {
    const user = state.currentUser;
    const nameEl = document.getElementById('header-user-name');
    const avatarEl = document.getElementById('header-user-avatar');
    const dropdownNameEl = document.getElementById('dropdown-user-name');
    const dropdownEmailEl = document.getElementById('dropdown-user-email');

    if (user) {
        if (nameEl) nameEl.textContent = user.firstName;
        if (avatarEl) {
            avatarEl.innerHTML = user.avatarUrl
                ? `<img src="${user.avatarUrl}" alt="${user.firstName}'s avatar" class="user-avatar-img">`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
        }
        if (dropdownNameEl) dropdownNameEl.textContent = `${user.firstName} ${user.lastName}`;
        if (dropdownEmailEl) dropdownEmailEl.textContent = user.email;
    }
};


// STATE CHANGE CHECKS ============================================================

export const checkForSettingChanges = (isInitial: boolean = false) => {
    if (!state.currentSettingsContainerId || !state.draftSettingsContainer) return;
    const originalContainer = state.containers.find(c => c.id === state.currentSettingsContainerId);
    if (!originalContainer) return;

    const hasChanges = JSON.stringify(originalContainer) !== JSON.stringify(state.draftSettingsContainer);

    if (DOM.buttons.saveSettings) {
        (DOM.buttons.saveSettings as HTMLButtonElement).disabled = !hasChanges || (isInitial);
    }
};

export const checkForGlobalSettingChanges = (isInitial: boolean = false) => {
    if (!state.draftBranding || !state.draftAvailableModels) return;

    const brandingChanged = JSON.stringify(state.branding) !== JSON.stringify(state.draftBranding);
    const modelsChanged = JSON.stringify(state.availableModels) !== JSON.stringify(state.draftAvailableModels);
    const hasChanges = brandingChanged || modelsChanged;

    if (DOM.buttons.saveGlobalSettings) {
        (DOM.buttons.saveGlobalSettings as HTMLButtonElement).disabled = !hasChanges || (isInitial);
    }
};

// UI ELEMENT TOGGLES (MODALS, PAGES, TOASTS) =====================================

export const openFunctionRunner = async (func: AppFunction) => {
    try {
        const response = await fetch('src/modals/function-runner.html');
        if (!response.ok) throw new Error('Could not load modal content.');
        const html = await response.text();
        if (DOM.modals.functionRunner) {
            DOM.modals.functionRunner.innerHTML = html;
        }

        reQueryDOM();
        if (!DOM.modals.functionRunner || !DOM.textElements.functionRunnerTitle || !DOM.containers.functionRunnerBody || !DOM.forms.functionRunner) return;

        state.currentRunningFunction = func;

        DOM.textElements.functionRunnerTitle.textContent = func.name;
        DOM.containers.functionRunnerBody.innerHTML = ''; // Clear previous form

        func.parameters.forEach(param => {
            const paramGroup = document.createElement('div');
            paramGroup.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = `param-${param.name.replace(/\s+/g, '-')}`;
            label.className = 'form-label';
            label.textContent = param.name;

            let inputElement;
            if (param.type === 'textarea') {
                inputElement = document.createElement('textarea');
                (inputElement as HTMLTextAreaElement).rows = 4;
            } else {
                inputElement = document.createElement('input');
                inputElement.type = param.type === 'number' ? 'number' : 'text';
            }
            inputElement.id = `param-${param.name.replace(/\s+/g, '-')}`;
            inputElement.name = param.name;
            inputElement.className = 'form-input';
            inputElement.placeholder = param.description;
            inputElement.required = true;

            const description = document.createElement('p');
            description.className = 'form-help-text';
            description.textContent = param.description;

            paramGroup.appendChild(label);
            paramGroup.appendChild(inputElement);
            paramGroup.appendChild(description);
            DOM.containers.functionRunnerBody.appendChild(paramGroup);
        });

        (DOM.modals.functionRunner as HTMLElement).classList.remove('hidden');
    } catch (error) {
        console.error('Failed to open function runner modal:', error);
        showToast('Error opening app.', 'error');
    }
};

const pageRenderActions: { [key: string]: Function } = {
    hub: () => renderAllContainers(),
    containerManagement: () => renderAllContainers(),
    department: (containerName: string) => {
        const container = state.containers.find(c => c.name === containerName && c.id === state.currentContainerId);
        if(container) {
             if (DOM.textElements.containerPageTitle) DOM.textElements.containerPageTitle.textContent = container.name;
            if (DOM.textElements.sidebarContainerTitle) DOM.textElements.sidebarContainerTitle.textContent = container.name;
            renderModelPersonaSelectors();
            renderSidebar(container.id);
            renderChatHistory(container.id);
        }
    },
    settingsDetail: (pageTitle: string) => {
        if(DOM.textElements.settingsDetailTitle) DOM.textElements.settingsDetailTitle.textContent = pageTitle;
    },
    knowledge: () => {
        // This is now called explicitly after showPage in the event handler
    }
};

export const showPage = async (pageKey: string, title?: string) => {
    const pageName = title || (pageKey.charAt(0).toUpperCase() + pageKey.slice(1)).replace(/([A-Z])/g, ' $1').trim();
    document.title = `${state.branding.hubHeaderTitle} - ${pageName}`;

    let fileKey = pageKey;
    if (pageKey === 'department') {
        fileKey = 'container-page';
    } else {
        fileKey = pageKey.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }

    try {
        const response = await fetch(`src/pages/${fileKey}.html`);
        if (!response.ok) throw new Error(`Page not found: ${fileKey}.html`);
        const html = await response.text();
        const appRoot = document.getElementById('app-root');
        if (appRoot) {
            appRoot.innerHTML = html;
        }
        reQueryDOM(); // Re-query all DOM elements now that the new page is loaded
        renderPageBranding(); // Apply branding to persistent elements like headers
        renderUserProfile(); // Render user profile on every page change
        
        // Custom image upload bindings must happen AFTER new DOM is loaded
        if (pageKey === 'globalSettings' || pageKey === 'settingsDetail' || pageKey === 'department') {
            bindImageUploads();
        }

        // Run page-specific render functions
        const action = pageRenderActions[pageKey];
        if (action) {
            action(title);
        }

    } catch (error) {
        console.error("Error loading page:", error);
        const appRoot = document.getElementById('app-root');
        if (appRoot) {
            appRoot.innerHTML = `<div class="page-view"><h2>Error</h2><p>Could not load page content.</p></div>`;
        }
    }
};

export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (!DOM.containers.toast) return;
    DOM.containers.toast.textContent = message;
    DOM.containers.toast.className = 'toast'; // Reset classes
    DOM.containers.toast.classList.add(type);
    DOM.containers.toast.classList.add('show');
    setTimeout(() => {
        DOM.containers.toast?.classList.remove('show');
    }, 3000);
};

export const closeModal = (modal: HTMLElement | null) => {
    if(modal) {
        modal.classList.add('hidden');
        modal.innerHTML = '';
    }
};

// IMAGE UPLOAD =================================================================

export const setupImageUpload = (button: HTMLButtonElement | null, input: HTMLInputElement | null, preview: HTMLImageElement | null, callback: (base64: string) => void) => {
    if (!button || !input || !preview) return;

    // Clear previous listeners to avoid duplicates
    const newButton = button.cloneNode(true) as HTMLButtonElement;
    button.parentNode?.replaceChild(newButton, button);
    const newInput = input.cloneNode(true) as HTMLInputElement;
    input.parentNode?.replaceChild(newInput, input);

    newButton.addEventListener('click', () => newInput.click());
    newInput.addEventListener('change', async () => {
        if (newInput.files && newInput.files[0]) {
            try {
                const base64 = await fileToBase64(newInput.files[0]);
                preview.src = base64;
                if (preview.classList.contains('hidden')) {
                    preview.classList.remove('hidden');
                }
                callback(base64);
            } catch (error) {
                console.error('Error converting file to base64', error);
                showToast('Error uploading image.', 'error');
            }
        }
    });
};


function bindImageUploads() {
    // Re-query DOM to ensure we have the correct elements after a page load
    reQueryDOM();
    if (DOM.buttons.addCustomIcon) setupImageUpload(DOM.buttons.addCustomIcon, DOM.inputs.addCustomIconUpload, DOM.previews.addCustomIcon, () => {});
    if (DOM.buttons.editCustomIcon) setupImageUpload(DOM.buttons.editCustomIcon, DOM.inputs.editCustomIconUpload, DOM.previews.editCustomIcon, (base64) => { if (state.draftSettingsContainer) { state.draftSettingsContainer.icon = base64; handleSettingChange(); } });
    if (DOM.buttons.editCardImage) setupImageUpload(DOM.buttons.editCardImage, DOM.inputs.editCardImageUpload, DOM.previews.editCardImage, (base64) => { if (state.draftSettingsContainer) { state.draftSettingsContainer.cardImageUrl = base64; handleSettingChange(); } });
    if (DOM.buttons.editGlobalLogo) setupImageUpload(DOM.buttons.editGlobalLogo, DOM.inputs.editGlobalLogoUpload, DOM.previews.brandingLogo?.querySelector('img') || new Image(), (base64) => { if (state.draftBranding) { state.draftBranding.appLogo = base64; updateBrandingPreview(state.draftBranding); checkForGlobalSettingChanges(); } });
}


// CHAT UI ======================================================================

export const addMessageToUI = (parts: Part[], sender: 'user' | 'bot', thinking: boolean = false) => {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return null;

    const chatWelcome = document.getElementById('chat-welcome');
    if (chatWelcome && !chatWelcome.classList.contains('hidden')) {
        chatWelcome.classList.add('hidden');
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;

    if (thinking) {
        messageDiv.classList.add('thinking');
        messageDiv.id = 'thinking-indicator';
        messageDiv.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    } else {
        let fullText = '';
        parts.forEach(part => {
            if ('text' in part && typeof part.text === 'string') {
                messageDiv.innerHTML += markdownToHtml(part.text);
                fullText += part.text;
            }
        });

        if (fullText.length > 0 && sender === 'bot') {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('aria-label', 'Copy message');
            copyBtn.innerHTML = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(fullText).then(() => { copyBtn.classList.add('copied'); setTimeout(() => copyBtn.classList.remove('copied'), 1500); }); });
            messageDiv.appendChild(copyBtn);
        }
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
};

export const renderChatHistory = (containerId: string) => {
    const chatMessages = document.getElementById('chat-messages');
    const chatWelcome = document.getElementById('chat-welcome');
    if (!chatMessages || !chatWelcome) return;

    chatMessages.innerHTML = ''; // Clear everything

    const container = state.containers.find(c => c.id === containerId);
    if (!container) return;

    const activeChat = container.chats.find(c => c.id === container.activeChatId);
    const history = activeChat ? activeChat.history : [];

    if (history.length === 0) {
        const welcomeIcon = document.getElementById('welcome-icon');
        if (welcomeIcon) {
            welcomeIcon.innerHTML = container.icon.startsWith('<svg') ? container.icon : `<img src="${container.icon}" alt="${container.name} icon">`;
        }
        const welcomeTitle = document.getElementById('welcome-title');
        if (welcomeTitle) welcomeTitle.textContent = `Welcome to ${container.name}`;
        
        const welcomeQuestions = document.getElementById('welcome-questions');
        if (welcomeQuestions) {
            welcomeQuestions.innerHTML = '<div><div class="spinner"></div></div>'; // Loading state
            generateQuestionsFromKnowledge(container.knowledgeBase).then(questions => {
                const questionsToRender = (questions.length > 0 ? questions : container.quickQuestions).slice(0, 4);
                if (welcomeQuestions) {
                    welcomeQuestions.innerHTML = ''; // Clear spinner
                    questionsToRender.forEach(q => {
                        const bubble = document.createElement('button');
                        bubble.className = 'quick-question';
                        bubble.textContent = q;
                        welcomeQuestions.appendChild(bubble);
                    });
                }
            });
        }
        chatWelcome.classList.remove('hidden');
    } else {
        chatWelcome.classList.add('hidden');
        history.forEach(message => addMessageToUI(message.parts, message.role === 'model' ? 'bot' : 'user'));
    }
};

// MAIN PAGE & COMPONENT RENDERERS ==============================================

export const renderModelPersonaSelectors = () => {
    const container = state.containers.find(c => c.id === state.currentContainerId);
    if (!container || !DOM.containers.modelSelect || !DOM.containers.personaSelect) return;

    const chevronIcon = `<svg class="select-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    // Render Model Selector
    const model = state.availableModels.find(m => m.id === container.selectedModel) || state.availableModels[0];
    DOM.containers.modelSelect.innerHTML = `
        <button class="select-trigger" aria-haspopup="listbox" aria-expanded="false">
            ${model.icon}
            <span>${model.id}</span>
            ${chevronIcon}
        </button>
        <div class="select-options hidden" role="listbox">
            ${container.availableModels.map(modelId => {
                const m = state.availableModels.find(am => am.id === modelId);
                return m ? `<button class="select-option ${modelId === container.selectedModel ? 'selected' : ''}" role="option" data-value="${m.id}">${m.icon} <span>${m.id}</span></button>` : '';
            }).join('')}
        </div>
    `;

    // Render Persona Selector
    const personaIcon = `<svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    DOM.containers.personaSelect.innerHTML = `
        <button class="select-trigger" aria-haspopup="listbox" aria-expanded="false">
            ${personaIcon}
            <span>${container.selectedPersona}</span>
            ${chevronIcon}
        </button>
        <div class="select-options hidden" role="listbox">
            ${container.availablePersonas.map(p => `
                <button class="select-option ${p === container.selectedPersona ? 'selected' : ''}" role="option" data-value="${p}">${personaIcon} <span>${p}</span></button>
            `).join('')}
        </div>
    `;
};


export const renderAddContainerSuggestions = () => {
    if (!state.draftNewContainer) return;

    const suggestedQuestions = document.getElementById('suggested-questions-list');
    const suggestedPersonas = document.getElementById('suggested-personas-list');
    const suggestedApps = document.getElementById('suggested-apps-list');
    const addContainerThemePreview = document.querySelector('#add-container-theme-preview .appearance-preview');
    const containerDescInput = document.getElementById('container-desc-input') as HTMLTextAreaElement;
    const containerIconSelector = document.getElementById('container-icon-selector');

    const draft = state.draftNewContainer;

    if (containerDescInput) containerDescInput.value = draft.description;
    
    if (containerIconSelector) {
        const iconButton = [...containerIconSelector.querySelectorAll('button')].find(btn => btn.innerHTML === draft.icon);
        if (iconButton) {
            containerIconSelector.querySelector('.selected')?.classList.remove('selected');
            iconButton.classList.add('selected');
        }
    }

    if(addContainerThemePreview) {
        updateAppearancePreview(draft.theme, addContainerThemePreview as HTMLElement, null);
    }
    
    const populateList = (element: HTMLElement | null, items: string[], type: 'question' | 'persona') => {
        if (!element) return;
        element.innerHTML = '';
        items.forEach(itemText => {
            const item = document.createElement('li');
            item.className = 'suggested-item';
            item.innerHTML = `<span>${itemText}</span><button type="button" aria-label="Remove this ${type}" data-item-type="${type}" data-item-value="${itemText}">&times;</button>`;
            element.appendChild(item);
        });
    };

    populateList(suggestedQuestions, draft.quickQuestions, 'question');
    populateList(suggestedPersonas, draft.availablePersonas, 'persona');
    
    if (suggestedApps) {
        suggestedApps.innerHTML = '';
        draft.functions.forEach(func => {
            const item = document.createElement('li');
            item.className = 'suggested-item';
            item.innerHTML = `${func.icon} <span>${func.name}</span> <button type="button" aria-label="Remove this app" data-item-type="function" data-item-value="${func.name}">&times;</button>`;
            suggestedApps?.appendChild(item);
        });
    }
};

const getIntegrationDetails = (key: keyof Branding['integrations']) => {
    const details: { [key: string]: { name: string, icon: string } } = {
        sharepoint: { name: 'SharePoint', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #0072C6;"><path d="M14.3,3.2H4.5C3.7,3.2,3,3.9,3,4.7v14.6C3,20.1,3.7,20.8,4.5,20.8h14.9c0.8,0,1.5-0.7,1.5-1.5V8.5L14.3,3.2z M17.2,17.2H6.8V6.8h6.9v3.6h3.6V17.2z"/></svg>` },
        brevo: { name: 'Brevo', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #009DFF;"><path d="M12,2C6.477,2,2,6.477,2,12s4.477,10,10,10s10-4.477,10-10S17.523,2,12,2z M15.6,15.6L12,12l3.6-3.6l-1.4-1.4L9.2,12l4.2,4.2L15.6,15.6z"/></svg>` },
        hubspot: { name: 'HubSpot', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #FF7A59;"><path d="M12.9,2.4c-0.2-0.2-0.5-0.2-0.7,0L3.7,10.9c-0.2,0.2-0.2,0.5,0,0.7l8.5,8.5c0.2,0.2,0.5,0.2,0.7,0l8.5-8.5c0.2,0.2,0.2-0.5,0-0.7L12.9,2.4z M12,16.5c-2.5,0-4.5-2,4.5-4.5s2-4.5,4.5-4.5s4.5,2,4.5,4.5S14.5,16.5,12,16.5z"/></svg>` },
        docusign: { name: 'DocuSign', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #FFC425;"><path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M15,15H9v-2h6V15z M17,11H7V9h10V11z"/></svg>` },
        outlook: { name: 'Outlook', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #0078D4;"><path d="M21,4H3C1.9,4,1,4.9,1,6v12c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2V6C23,4.9,22.1,4,21,4z M12,13.5L3.5,8H20.5L12,13.5z M3,6h1V7l8,5l8-5V6h1v12H3V6z"/></svg>` },
    };
    return details[key] || { name: key, icon: '' };
}

export const renderSidebar = (containerId: string) => {
    reQueryDOM();
    const container = state.containers.find(c => c.id === containerId);
    if (!container) return;

    if (DOM.containers.sidebarKnowledgeLink?.parentElement) {
        DOM.containers.sidebarKnowledgeLink.parentElement.classList.toggle('hidden', !container.isKnowledgeBasePublic);
    }

    if (DOM.containers.sidebarAppsSection) {
        DOM.containers.sidebarAppsSection.innerHTML = '';
        const enabledFunctions = container.functions.filter(f => f.enabled);
        if (enabledFunctions.length > 0) {
            const title = document.createElement('h3');
            title.className = 'sidebar-section-title';
            title.textContent = 'Apps';
            DOM.containers.sidebarAppsSection.appendChild(title);
            const list = document.createElement('ul');
            enabledFunctions.forEach(func => {
                const item = document.createElement('li');
                const link = document.createElement('button');
                link.className = 'sidebar-link';
                link.innerHTML = `${func.icon}<span>${func.name}</span>`;
                link.onclick = async (e) => { e.preventDefault(); await openFunctionRunner(func); };
                item.appendChild(link);
                list.appendChild(item);
            });
            DOM.containers.sidebarAppsSection.appendChild(list);
        }
    }

    if (DOM.containers.sidebarIntegrationsSection) {
        DOM.containers.sidebarIntegrationsSection.innerHTML = '';
        const enabledIntegrations = container.enabledIntegrations;

        if (enabledIntegrations.length > 0) {
            const title = document.createElement('h3');
            title.className = 'sidebar-section-title';
            title.textContent = 'Integrations';
            DOM.containers.sidebarIntegrationsSection.appendChild(title);

            const list = document.createElement('ul');
            enabledIntegrations.forEach(intKey => {
                const integration = getIntegrationDetails(intKey as keyof Branding['integrations']);
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.className = 'sidebar-link';
                link.innerHTML = `${integration.icon}<span>${integration.name}</span>`;
                item.appendChild(link);
                list.appendChild(item);
            });
            DOM.containers.sidebarIntegrationsSection.appendChild(list);
        }
    }

    if (DOM.containers.sidebarHistoryList) {
        DOM.containers.sidebarHistoryList.innerHTML = '';
        [...container.chats].reverse().forEach(chat => {
            const item = document.createElement('li');
            item.innerHTML = `
                <button class="sidebar-link ${chat.id === container.activeChatId ? 'active' : ''}" data-chat-id="${chat.id}">
                    <span>${chat.name}</span>
                </button>
                <button class="delete-chat-btn" data-chat-id="${chat.id}" aria-label="Delete chat: ${chat.name}">&times;</button>
            `;
            DOM.containers.sidebarHistoryList?.appendChild(item);
        });
    }
};

export const renderAllContainers = () => {
    reQueryDOM();
    const containerGrid = document.getElementById('container-grid');
    if (containerGrid) {
        containerGrid.innerHTML = '';
        state.containers.forEach(container => {
            containerGrid.appendChild(createContainerCard(container, false));
        });
    }
    const containerManagementGrid = document.getElementById('container-management-grid');
    if (containerManagementGrid) {
        containerManagementGrid.innerHTML = '';
        state.containers.forEach(container => {
            containerManagementGrid.appendChild(createContainerCard(container, true));
        });
    }
};

export const renderBranding = () => {
    reQueryDOM();
    const { branding } = state;
    document.title = branding.hubHeaderTitle;

    if (DOM.textElements.loginTitle) DOM.textElements.loginTitle.textContent = branding.loginTitle;
    if (DOM.textElements.loginSubtitle) DOM.textElements.loginSubtitle.textContent = branding.loginSubtitle;
    if (DOM.buttons.googleLogin) (DOM.buttons.googleLogin as HTMLElement).style.display = branding.enableGoogleLogin ? 'flex' : 'none';
    if (DOM.buttons.microsoftLogin) {
        const showMicrosoftLogin = branding.enableMicrosoftLogin && publicConfig.auth.isMicrosoftConfigured;
        (DOM.buttons.microsoftLogin as HTMLElement).style.display = showMicrosoftLogin ? 'flex' : 'none';
    }

    if (DOM.textElements.hubHeaderTitle) DOM.textElements.hubHeaderTitle.textContent = branding.hubHeaderTitle;
    if (DOM.textElements.hubTitle) DOM.textElements.hubTitle.textContent = branding.hubTitle;
    if (DOM.textElements.hubSubtitle) DOM.textElements.hubSubtitle.textContent = branding.hubSubtitle;

    const logoHtml = branding.appLogo ? `<img src="${branding.appLogo}" alt="App Logo">` : DEFAULT_MODELS[0].icon;
    if (DOM.containers.loginAppLogo) DOM.containers.loginAppLogo.innerHTML = logoHtml;
    if (DOM.containers.hubAppLogo) DOM.containers.hubAppLogo.innerHTML = logoHtml;
    
    if (DOM.containers.cookieBanner) {
        const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
        DOM.containers.cookieBanner.classList.toggle('hidden', !branding.enableCookieBanner || cookiesAccepted);
    }
    if (DOM.textElements.privacyPolicyLink) {
        if (branding.privacyPolicyUrl) {
            DOM.textElements.privacyPolicyLink.href = branding.privacyPolicyUrl;
            DOM.textElements.privacyPolicyLink.parentElement?.classList.remove('hidden');
        } else {
             DOM.textElements.privacyPolicyLink.parentElement?.classList.add('hidden');
        }
    }
};

export const renderKnowledgeFiles = async () => {
    reQueryDOM();
    const knowledgeFileList = document.getElementById('knowledge-file-list');
    if (!knowledgeFileList) return;
    const container = state.containers.find(c => c.id === state.currentContainerId);
    if (!container) {
        knowledgeFileList.innerHTML = '<p>No workspace selected.</p>';
        return;
    }

    if (DOM.textElements.knowledgeSubtitle) {
        DOM.textElements.knowledgeSubtitle.textContent = container.isKnowledgeBasePublic ?
            'These files are used to ground the assistant and are available for all users to view and upload.' :
            'These files are used to ground the assistant and are private to this workspace.';
    }

    knowledgeFileList.innerHTML = `<div><div class="spinner"></div> Loading files...</div>`;

    try {
        const files = await listKnowledgeFiles(container.id);
        // Update client state with the latest metadata from the server
        container.knowledgeBase = files;
        
        knowledgeFileList.innerHTML = '';
        if (files.length === 0) {
            knowledgeFileList.innerHTML = `<div>No files uploaded yet.</div>`;
            return;
        }

        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'knowledge-file-item';
            item.innerHTML = `
                <div class="file-icon">${getFileIcon(file.type)}</div>
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <div class="file-meta">
                        <span>Uploaded: ${formatDate(file.uploadDate)}</span>
                        <span>Size: ${formatBytes(file.size)}</span>
                    </div>
                </div>
                <button class="delete-file-btn" aria-label="Delete file ${file.name}">&times;</button>
            `;
            item.querySelector('.delete-file-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (state.currentContainerId) {
                    handleDeleteFileClick(state.currentContainerId, file.id, file.name);
                }
            });
            knowledgeFileList.appendChild(item);
        });
    } catch (error) {
        console.error("Failed to render knowledge files:", error);
        knowledgeFileList.innerHTML = `<div>Error loading files. Please try again.</div>`;
        showToast("Could not load knowledge files.", "error");
    }
};

// SETTINGS RENDERERS ==========================================================

const renderListWithDelete = (
    listElement: HTMLElement | null,
    items: string[],
    deleteHandler: (item: string) => void,
) => {
    if (!listElement) return;
    listElement.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'managed-list-item';
        li.innerHTML = `
            <span>${item}</span>
            <button type="button" class="delete-item-btn" aria-label="Delete ${item}">&times;</button>
        `;
        li.querySelector('.delete-item-btn')?.addEventListener('click', () => deleteHandler(item));
        listElement.appendChild(li);
    });
};

export const renderContainerSettings = (containerId: string) => {
    reQueryDOM();
    const container = state.containers.find(c => c.id === containerId);
    if (!container) return;

    state.currentSettingsContainerId = containerId;
    state.draftSettingsContainer = JSON.parse(JSON.stringify(container));
    const draft = state.draftSettingsContainer!;

    if (DOM.inputs.editContainerName) {
        DOM.inputs.editContainerName.value = draft.name;
        DOM.inputs.editContainerName.addEventListener('input', (e) => {
            if (state.draftSettingsContainer) {
                const newName = (e.target as HTMLInputElement).value;
                state.draftSettingsContainer.name = newName;
                if (DOM.textElements.settingsDetailTitle) {
                    DOM.textElements.settingsDetailTitle.textContent = `Edit ${newName}`;
                }
                handleSettingChange();
            }
        });
    }
    if (DOM.inputs.editContainerDesc) DOM.inputs.editContainerDesc.value = draft.description;
    
    if (DOM.containers.editContainerIconSelector) {
        DOM.containers.editContainerIconSelector.innerHTML = '';
        AVAILABLE_ICONS.forEach(icon => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `icon-option ${draft.icon === icon ? 'selected' : ''}`;
            btn.innerHTML = icon;
            btn.addEventListener('click', () => {
                DOM.containers.editContainerIconSelector?.querySelector('.selected')?.classList.remove('selected');
                btn.classList.add('selected');
                if (DOM.previews.editCustomIcon) {
                    DOM.previews.editCustomIcon.src = '';
                    DOM.previews.editCustomIcon.classList.add('hidden');
                }
                draft.icon = icon;
                handleSettingChange();
            });
            DOM.containers.editContainerIconSelector.appendChild(btn);
        });
    }

    if (DOM.previews.editCustomIcon) {
        const isCustom = draft.icon.startsWith('data:image');
        DOM.previews.editCustomIcon.src = isCustom ? draft.icon : '';
        DOM.previews.editCustomIcon.classList.toggle('hidden', !isCustom);
    }
    
    if (DOM.containers.cardImageOptionsList) {
        DOM.containers.cardImageOptionsList.className = 'image-selector-grid';
        DOM.containers.cardImageOptionsList.innerHTML = '';
        CARD_IMAGE_OPTIONS.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = `icon-option ${draft.cardImageUrl === opt.url ? 'selected' : ''}`;
            btn.innerHTML = `<img src="${opt.url}" alt="${opt.description}">`;
            btn.addEventListener('click', () => {
                DOM.containers.cardImageOptionsList?.querySelector('.selected')?.classList.remove('selected');
                btn.classList.add('selected');
                if (DOM.previews.editCardImage) {
                    DOM.previews.editCardImage.src = '';
                    DOM.previews.editCardImage.classList.add('hidden');
                }
                draft.cardImageUrl = opt.url;
                handleSettingChange();
            });
            DOM.containers.cardImageOptionsList.appendChild(btn);
        });
    }

    if (DOM.previews.editCardImage) {
        const isStock = CARD_IMAGE_OPTIONS.some(opt => opt.url === draft.cardImageUrl);
        DOM.previews.editCardImage.src = !isStock ? draft.cardImageUrl : '';
        DOM.previews.editCardImage.classList.toggle('hidden', isStock || !draft.cardImageUrl);
    }

    if(DOM.inputs.isKnowledgePublic) {
        DOM.inputs.isKnowledgePublic.checked = draft.isKnowledgeBasePublic;
    }

    renderListWithDelete(DOM.containers.quickQuestionsList, draft.quickQuestions, handleDeleteQuickQuestion);
    renderListWithDelete(DOM.containers.personasList, draft.availablePersonas, handleDeletePersona);
    renderListWithDelete(DOM.containers.accessControlList, draft.accessControl, handleDeleteAccessor);

    if (DOM.containers.availableModelsList) {
        DOM.containers.availableModelsList.innerHTML = '';
        state.availableModels.forEach(model => {
            const item = document.createElement('div');
            item.className = 'form-group-row';
            const isChecked = draft.availableModels.includes(model.id);
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="model-management-item-icon">${model.icon}</div>
                    <label for="model-toggle-${model.id}" class="toggle-switch-label">${model.id}</label>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="model-toggle-${model.id}" ${isChecked ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
            `;
            item.querySelector('input')?.addEventListener('change', (e) => {
                if ((e.target as HTMLInputElement).checked) {
                    draft.availableModels.push(model.id);
                } else {
                    draft.availableModels = draft.availableModels.filter(m => m !== model.id);
                }
                handleSettingChange();
            });
            DOM.containers.availableModelsList.appendChild(item);
        });
    }

    const colorInputs = [
        { id: 'user-bg-color', key: 'userBg' }, { id: 'user-text-color', key: 'userText' },
        { id: 'bot-bg-color', key: 'botBg' }, { id: 'bot-text-color', key: 'botText' },
        { id: 'bg-gradient-start-color', key: 'bgGradientStart' }, { id: 'bg-gradient-end-color', key: 'bgGradientEnd' },
        { id: 'sidebar-bg-color', key: 'sidebarBg' }, { id: 'sidebar-text-color', key: 'sidebarText' },
        { id: 'sidebar-highlight-bg-color', key: 'sidebarHighlightBg' }
    ];

    colorInputs.forEach(({ id, key }) => {
        const colorInput = document.getElementById(id) as HTMLInputElement;
        const textInput = document.getElementById(`${id}-text`) as HTMLInputElement;
        if (!colorInput || !textInput) return;

        const updateState = (newColor: string) => {
            (draft.theme[key as keyof ChatTheme] as any) = newColor;
            updateAppearancePreview(draft.theme, DOM.containers.appearancePreview, DOM.containers.sidebarPreview);
            handleSettingChange();
        };
        
        // Set initial values from draft state
        const initialColor = draft.theme[key as keyof ChatTheme];
        colorInput.value = initialColor;
        textInput.value = initialColor;
        
        // Add listeners. Using 'oninput' and 'onchange' overwrites any previous handlers,
        // avoiding duplicate listeners if this function is called multiple times.
        colorInput.oninput = (e) => {
            const newColor = (e.target as HTMLInputElement).value;
            textInput.value = newColor;
            updateState(newColor);
        };
        
        textInput.onchange = (e) => {
            let newColor = (e.target as HTMLInputElement).value.trim();
            if (!newColor.startsWith('#')) {
                newColor = '#' + newColor;
            }
            // Basic hex validation
            if (/^#([0-9a-fA-F]{3}){1,2}$/.test(newColor)) {
                colorInput.value = newColor;
                updateState(newColor);
            } else {
                // Revert to the last valid color if input is invalid
                textInput.value = colorInput.value;
            }
        };
    });
    updateAppearancePreview(draft.theme, DOM.containers.appearancePreview, DOM.containers.sidebarPreview);
    
    if (DOM.containers.containerIntegrationsList) {
        DOM.containers.containerIntegrationsList.innerHTML = '';
        Object.entries(state.branding.integrations).forEach(([key, enabled]) => {
            if (!enabled) return;
            const details = getIntegrationDetails(key as keyof Branding['integrations']);
            const isChecked = draft.enabledIntegrations.includes(key);
            const item = document.createElement('div');
            item.className = 'form-group-row';
            item.innerHTML = `
                 <div style="display: flex; align-items: center; gap: 1rem;">
                    ${details.icon}
                    <label for="int-toggle-${key}" class="toggle-switch-label">${details.name}</label>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="int-toggle-${key}" ${isChecked ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
            `;
            item.querySelector('input')?.addEventListener('change', (e) => {
                if ((e.target as HTMLInputElement).checked) {
                    draft.enabledIntegrations.push(key);
                } else {
                    draft.enabledIntegrations = draft.enabledIntegrations.filter(i => i !== key);
                }
                handleSettingChange();
            });
            DOM.containers.containerIntegrationsList.appendChild(item);
        });
    }
    
    if (DOM.containers.functionsList) {
        DOM.containers.functionsList.innerHTML = '';
        draft.functions.forEach(func => {
            const item = document.createElement('li');
            item.className = 'managed-list-item function-item';
            item.innerHTML = `
                <div class="function-item-icon">${func.icon}</div>
                <div class="function-item-details">
                    <strong>${func.name}</strong>
                    <p>${func.description}</p>
                </div>
                <div class="function-controls">
                    <label class="toggle-switch">
                      <input type="checkbox" ${func.enabled ? 'checked' : ''}>
                      <span class="slider"></span>
                    </label>
                    <button type="button" class="delete-func-btn" aria-label="Delete function">&times;</button>
                </div>
            `;
            item.querySelector('input[type="checkbox"]')?.addEventListener('change', (e) => {
                const funcToUpdate = draft.functions.find(f => f.id === func.id);
                if (funcToUpdate) funcToUpdate.enabled = (e.target as HTMLInputElement).checked;
                handleSettingChange();
            });
            item.querySelector('.delete-func-btn')?.addEventListener('click', () => handleDeleteFunction(func.id));
            DOM.containers.functionsList?.appendChild(item);
        });
    }

    checkForSettingChanges(true);
};

export const renderBrandingSettings = (branding: Branding) => {
    reQueryDOM();
    if (DOM.inputs.editLoginTitle) DOM.inputs.editLoginTitle.value = branding.loginTitle;
    if (DOM.inputs.editLoginSubtitle) DOM.inputs.editLoginSubtitle.value = branding.loginSubtitle;
    if (DOM.inputs.editHubHeaderTitle) DOM.inputs.editHubHeaderTitle.value = branding.hubHeaderTitle;
    if (DOM.inputs.editHubTitle) DOM.inputs.editHubTitle.value = branding.hubTitle;
    if (DOM.inputs.editHubSubtitle) DOM.inputs.editHubSubtitle.value = branding.hubSubtitle;
    if (DOM.inputs.enableGoogleLogin) DOM.inputs.enableGoogleLogin.checked = branding.enableGoogleLogin;
    if (DOM.inputs.googleClientId) DOM.inputs.googleClientId.value = branding.googleClientId;
    if (DOM.inputs.googleClientSecret) DOM.inputs.googleClientSecret.value = branding.googleClientSecret;
    if (DOM.inputs.enableMicrosoftLogin) DOM.inputs.enableMicrosoftLogin.checked = branding.enableMicrosoftLogin;
    if (DOM.inputs.microsoftClientId) DOM.inputs.microsoftClientId.value = branding.microsoftClientId;
    if (DOM.inputs.microsoftClientSecret) DOM.inputs.microsoftClientSecret.value = branding.microsoftClientSecret;
    if (DOM.inputs.enableCookieBanner) DOM.inputs.enableCookieBanner.checked = branding.enableCookieBanner;
    if (DOM.inputs.privacyPolicyUrl) DOM.inputs.privacyPolicyUrl.value = branding.privacyPolicyUrl;

    const addListener = (input: HTMLElement | null, key: keyof Branding | `integrations.${keyof Branding['integrations']}`) => {
        if (!input) return;
        const event = (input instanceof HTMLInputElement && input.type === 'checkbox') ? 'change' : 'input';
        
        const handler = (e: Event) => {
            if (!state.draftBranding) return;
            const target = e.target as HTMLInputElement;
            const value = target.type === 'checkbox' ? target.checked : target.value;

            if (key.startsWith('integrations.')) {
                const intKey = key.split('.')[1] as keyof Branding['integrations'];
                state.draftBranding.integrations[intKey] = value as boolean;
            } else {
                 (state.draftBranding[key as keyof Branding] as any) = value;
            }
            updateBrandingPreview(state.draftBranding);
            checkForGlobalSettingChanges();
        };

        // This pattern ensures we don't attach duplicate listeners if the function is re-run
        const clone = input.cloneNode(true);
        input.parentNode?.replaceChild(clone, input);
        clone.addEventListener(event, handler);
    };

    addListener(DOM.inputs.editLoginTitle, 'loginTitle');
    addListener(DOM.inputs.editLoginSubtitle, 'loginSubtitle');
    addListener(DOM.inputs.editHubHeaderTitle, 'hubHeaderTitle');
    addListener(DOM.inputs.editHubTitle, 'hubTitle');
    addListener(DOM.inputs.editHubSubtitle, 'hubSubtitle');
    addListener(DOM.inputs.enableGoogleLogin, 'enableGoogleLogin');
    addListener(DOM.inputs.googleClientId, 'googleClientId');
    addListener(DOM.inputs.googleClientSecret, 'googleClientSecret');
    addListener(DOM.inputs.enableMicrosoftLogin, 'enableMicrosoftLogin');
    addListener(DOM.inputs.microsoftClientId, 'microsoftClientId');
    addListener(DOM.inputs.microsoftClientSecret, 'microsoftClientSecret');
    addListener(DOM.inputs.enableCookieBanner, 'enableCookieBanner');
    addListener(DOM.inputs.privacyPolicyUrl, 'privacyPolicyUrl');

    if (DOM.containers.integrationsGrid) {
        DOM.containers.integrationsGrid.innerHTML = '';
        Object.keys(branding.integrations).forEach(keyStr => {
            const key = keyStr as keyof Branding['integrations'];
            const details = getIntegrationDetails(key);
            const card = document.createElement('div');
            card.className = 'integration-card';
            card.innerHTML = `
                <div class="integration-icon">${details.icon}</div>
                <span class="integration-name">${details.name}</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="global-int-${key}" ${branding.integrations[key] ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            `;
            const input = card.querySelector('input');
            addListener(input, `integrations.${key}`);
            DOM.containers.integrationsGrid?.appendChild(card);
        });
    }

    updateBrandingPreview(branding);
};

export const renderModelManagementList = () => {
    reQueryDOM();
    if (!DOM.containers.modelManagementList || !state.draftAvailableModels) return;
    DOM.containers.modelManagementList.innerHTML = '';
    state.draftAvailableModels.forEach(model => {
        const item = document.createElement('li');
        item.className = 'managed-list-item';
        item.innerHTML = `
            <div class="model-management-item-icon">${model.icon}</div>
            <span>${model.id}</span>
            <button class="delete-item-btn" aria-label="Delete ${model.id}">&times;</button>
        `;
        item.querySelector('.delete-item-btn')?.addEventListener('click', () => handleDeleteModel(model.id));
        DOM.containers.modelManagementList?.appendChild(item);
    });
};

// SharePoint Picker =================================================================

interface SharePointPickerOptions {
    mode: 'single' | 'multiple';
    onSelect: (files: { siteId: string; itemId: string; name: string; mimeType: string; size: number }[]) => void;
}

type DriveItem = { id: string; name: string; isFolder: boolean; size: number; mimeType: string };
type Breadcrumb = { id: string, name: string };

export async function openSharePointPicker(options: SharePointPickerOptions) {
    if (!DOM.modals.sharepointPicker) return;

    const ICONS = {
        folder: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
        file: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`,
        site: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
    };

    try {
        const response = await fetch('src/modals/sharepoint-picker.html');
        if (!response.ok) throw new Error('Could not load SharePoint picker modal.');
        DOM.modals.sharepointPicker.innerHTML = await response.text();
        DOM.modals.sharepointPicker.classList.remove('hidden');

        // Get references to elements inside the newly loaded modal
        const picker = DOM.modals.sharepointPicker;
        const breadcrumbsContainer = picker.querySelector('#sp-breadcrumbs') as HTMLElement;
        const itemListContainer = picker.querySelector('#sp-file-list') as HTMLElement;
        const spinner = picker.querySelector('#sp-loading-spinner') as HTMLElement;
        const confirmBtn = picker.querySelector('#sp-add-btn') as HTMLButtonElement;
        const cancelBtn = picker.querySelector('#sp-cancel-btn') as HTMLElement;
        const closeBtn = picker.querySelector('.modal-close-btn') as HTMLElement;
        const btnText = confirmBtn.querySelector('.btn-text') as HTMLElement;

        // State variables
        let currentSiteId: string | null = null;
        let breadcrumbs: Breadcrumb[] = [];
        let selectedItems: DriveItem[] = [];

        const renderLoading = (show: boolean) => {
            spinner.classList.toggle('hidden', !show);
            if (show) itemListContainer.innerHTML = '';
        };

        const renderMessage = (message: string) => {
            renderLoading(false);
            itemListContainer.innerHTML = `<li class="sp-message-item">${message}</li>`;
        };
        
        const updateConfirmButton = () => {
            confirmBtn.disabled = selectedItems.length === 0;
            if (btnText) {
                btnText.textContent = selectedItems.length > 0 ? `Add Selected (${selectedItems.length})` : 'Add Selected';
            }
        };

        const handleItemSelect = (item: DriveItem, checkbox: HTMLInputElement) => {
            if (options.mode === 'single') {
                itemListContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (cb !== checkbox) (cb as HTMLInputElement).checked = false;
                });
                selectedItems = checkbox.checked ? [item] : [];
            } else {
                if (checkbox.checked) {
                    if (!selectedItems.some(i => i.id === item.id)) selectedItems.push(item);
                } else {
                    selectedItems = selectedItems.filter(i => i.id !== item.id);
                }
            }
            updateConfirmButton();
        };

        const renderBreadcrumbs = () => {
            breadcrumbsContainer.innerHTML = '';
            const rootBtn = document.createElement('button');
            rootBtn.className = 'sp-breadcrumb-item';
            rootBtn.textContent = 'Sites';
            rootBtn.onclick = () => renderSites();
            breadcrumbsContainer.appendChild(rootBtn);

            breadcrumbs.forEach((crumb, index) => {
                const separator = document.createElement('span');
                separator.className = 'sp-breadcrumb-separator';
                separator.textContent = '/';
                breadcrumbsContainer.appendChild(separator);

                const crumbBtn = document.createElement('button');
                crumbBtn.className = 'sp-breadcrumb-item';
                crumbBtn.textContent = crumb.name;
                crumbBtn.onclick = () => {
                    if (currentSiteId) {
                        breadcrumbs = breadcrumbs.slice(0, index + 1);
                        renderItems(currentSiteId, crumb.id);
                    }
                };
                breadcrumbsContainer.appendChild(crumbBtn);
            });
        };

        const renderItems = async (siteId: string, itemId: string) => {
            renderLoading(true);
            currentSiteId = siteId;
            renderBreadcrumbs();
            try {
                const items: DriveItem[] = await graph.getDriveItems(siteId, itemId);
                renderLoading(false);

                if (items.length === 0) {
                    renderMessage('This folder is empty.');
                    return;
                }

                items.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'sp-list-item';
                    const isSelected = selectedItems.some(i => i.id === item.id);
                    
                    const selectorDiv = document.createElement('div');
                    selectorDiv.className = 'sp-item-selector';
                    if (!item.isFolder) {
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'sp-item-checkbox';
                        checkbox.checked = isSelected;
                        checkbox.setAttribute('aria-label', `Select file ${item.name}`);
                        checkbox.onchange = () => handleItemSelect(item, checkbox);
                        selectorDiv.appendChild(checkbox);
                    }
                    li.appendChild(selectorDiv);

                    const nameCol = document.createElement('div');
                    nameCol.className = 'sp-item-name-col';
                    
                    const icon = document.createElement('div');
                    icon.className = 'sp-item-icon';
                    icon.innerHTML = item.isFolder ? ICONS.folder : ICONS.file;
                    nameCol.appendChild(icon);

                    const nameBtn = document.createElement('button');
                    nameBtn.type = 'button';
                    nameBtn.className = 'sp-item-name-btn';
                    nameBtn.title = item.name;
                    nameBtn.textContent = item.name;
                    if(item.isFolder) {
                        nameBtn.onclick = () => {
                            breadcrumbs.push({ id: item.id, name: item.name });
                            renderItems(siteId, item.id);
                        };
                    } else {
                        nameBtn.onclick = () => {
                            const checkbox = li.querySelector('input[type="checkbox"]') as HTMLInputElement;
                            if (checkbox) {
                                checkbox.checked = !checkbox.checked;
                                checkbox.dispatchEvent(new Event('change'));
                            }
                        };
                    }
                    nameCol.appendChild(nameBtn);
                    li.appendChild(nameCol);

                    const sizeCol = document.createElement('div');
                    sizeCol.className = 'sp-item-size-col';
                    sizeCol.textContent = item.isFolder ? '—' : formatBytes(item.size);
                    li.appendChild(sizeCol);

                    itemListContainer.appendChild(li);
                });
            } catch (e) {
                renderMessage(e instanceof Error ? e.message : 'Could not load items.');
            }
        };

        const renderSites = async () => {
            renderLoading(true);
            breadcrumbs = [];
            currentSiteId = null;
            renderBreadcrumbs();
            try {
                const sites = await graph.getSharePointSites();
                renderLoading(false);
                if (sites.length === 0) {
                    renderMessage('No SharePoint sites found.');
                    return;
                }
                sites.forEach((site: { id: string; name: string; }) => {
                    const li = document.createElement('li');
                    li.className = 'sp-list-item';
                    li.innerHTML = `
                        <div class="sp-item-selector"></div>
                        <div class="sp-item-name-col">
                            <div class="sp-item-icon">${ICONS.site}</div>
                            <button type="button" class="sp-item-name-btn" title="${site.name}">${site.name}</button>
                        </div>
                        <div class="sp-item-size-col">—</div>
                    `;
                    li.querySelector('button')?.addEventListener('click', () => {
                        breadcrumbs = [{ id: 'root', name: site.name }];
                        renderItems(site.id, 'root');
                    });
                    itemListContainer.appendChild(li);
                });
            } catch (e) {
                renderMessage(e instanceof Error ? e.message : 'Could not load SharePoint sites.');
            }
        };

        // Event Listeners
        closeBtn.onclick = () => closeModal(DOM.modals.sharepointPicker);
        cancelBtn.onclick = () => closeModal(DOM.modals.sharepointPicker);
        confirmBtn.onclick = () => {
             options.onSelect(selectedItems.map(item => ({
                siteId: currentSiteId!,
                itemId: item.id,
                name: item.name,
                mimeType: item.mimeType,
                size: item.size
             })));
             closeModal(DOM.modals.sharepointPicker);
        };
        
        await renderSites();

    } catch (error) {
        console.error("Failed to open SharePoint picker:", error);
        showToast("Could not open SharePoint picker.", "error");
        closeModal(DOM.modals.sharepointPicker);
    }
}
