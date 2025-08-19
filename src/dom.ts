/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Define a type for the DOM object structure
interface DOMStructure {
    root: HTMLElement | null;
    appRoot: HTMLElement | null;
    pageViews: {
        login: HTMLElement | null;
        hub: HTMLElement | null;
        settingsHub: HTMLElement | null;
        containerManagement: HTMLElement | null;
        globalSettings: HTMLElement | null;
        settingsDetail: HTMLElement | null;
        department: HTMLElement | null;
        knowledge: HTMLElement | null;
    };
    modals: {
        addContainer: HTMLElement | null;
        functionRunner: HTMLElement | null;
        deleteConfirm: HTMLElement | null;
        sharepointPicker: HTMLElement | null;
    };
    buttons: {
        googleLogin: HTMLElement | null;
        microsoftLogin: HTMLElement | null;
        settings: HTMLElement | null;
        addContainer: HTMLElement | null;
        backToHub: NodeListOf<HTMLElement>;
        backToSettingsHub1: HTMLElement | null;
        backToSettingsHub2: HTMLElement | null;
        backToContainerManagement: HTMLElement | null;
        backToAssistant: HTMLElement | null;
        sidebarToggle: HTMLElement | null;
        attachment: HTMLButtonElement | null;
        uploadComputer: HTMLElement | null;
        uploadSharepoint: HTMLElement | null;
        removeAttachment: HTMLElement | null;
        suggestQuestions: HTMLButtonElement | null;
        suggestPersonas: HTMLButtonElement | null;
        generateFunction: HTMLButtonElement | null;
        generateAi: HTMLButtonElement | null;
        closeModal: HTMLElement | null;
        cancelContainer: HTMLElement | null;
        createContainer: HTMLButtonElement | null;
        closeFunctionRunner: HTMLElement | null;
        cancelFunctionRunner: HTMLElement | null;
        deleteContainer: HTMLElement | null;
        closeDeleteModal: HTMLElement | null;
        cancelDelete: HTMLElement | null;
        confirmDelete: HTMLElement | null;
        newChat: HTMLElement | null;
        sendChat: HTMLButtonElement | null;
        manageKnowledge: HTMLElement | null;
        knowledgeUpload: HTMLElement | null;
        knowledgeAddSharepoint: HTMLElement | null;
        saveSettings: HTMLButtonElement | null;
        cancelSettings: HTMLButtonElement | null;
        saveGlobalSettings: HTMLButtonElement | null;
        cancelGlobalSettings: HTMLButtonElement | null;
        addCustomIcon: HTMLButtonElement | null;
        editCustomIcon: HTMLButtonElement | null;
        editGlobalLogo: HTMLButtonElement | null;
        acceptCookies: HTMLElement | null;
        editCardImage: HTMLButtonElement | null;
    };
    forms: {
        chat: HTMLFormElement | null;
        addContainer: HTMLFormElement | null;
        addQuickQuestion: HTMLFormElement | null;
        addPersona: HTMLFormElement | null;
        addAccessor: HTMLFormElement | null;
        addFunction: HTMLFormElement | null;
        addModel: HTMLFormElement | null;
        functionRunner: HTMLFormElement | null;
        settingsContainer: HTMLFormElement | null;
        globalSettings: HTMLFormElement | null;
    };
    inputs: {
        chat: HTMLTextAreaElement | null;
        fileUpload: HTMLInputElement | null;
        containerName: HTMLInputElement | null;
        containerDesc: HTMLTextAreaElement | null;
        containerType: HTMLSelectElement | null;
        containerWebsite: HTMLInputElement | null;
        editContainerName: HTMLInputElement | null;
        editContainerDesc: HTMLTextAreaElement | null;
        newQuickQuestion: HTMLInputElement | null;
        newPersona: HTMLTextAreaElement | null;
        newAccessor: HTMLInputElement | null;
        newFunction: HTMLInputElement | null;
        newModelId: HTMLInputElement | null;
        newModelApi: HTMLInputElement | null;
        newModelIcon: HTMLInputElement | null;
        knowledgeFile: HTMLInputElement | null;
        userBgColor: HTMLInputElement | null;
        userTextColor: HTMLInputElement | null;
        botBgColor: HTMLInputElement | null;
        botTextColor: HTMLInputElement | null;
        bgGradientStartColor: HTMLInputElement | null;
        bgGradientEndColor: HTMLInputElement | null;
        sidebarBgColor: HTMLInputElement | null;
        sidebarTextColor: HTMLInputElement | null;
        sidebarHighlightBgColor: HTMLInputElement | null;
        addCustomIconUpload: HTMLInputElement | null;
        editCustomIconUpload: HTMLInputElement | null;
        editCardImageUpload: HTMLInputElement | null;
        editLoginTitle: HTMLInputElement | null;
        editLoginSubtitle: HTMLInputElement | null;
        editHubHeaderTitle: HTMLInputElement | null;
        editHubTitle: HTMLInputElement | null;
        editHubSubtitle: HTMLInputElement | null;
        editGlobalLogoUpload: HTMLInputElement | null;
        enableGoogleLogin: HTMLInputElement | null;
        googleClientId: HTMLInputElement | null;
        googleClientSecret: HTMLInputElement | null;
        enableMicrosoftLogin: HTMLInputElement | null;
        microsoftClientId: HTMLInputElement | null;
        microsoftClientSecret: HTMLInputElement | null;
        enableCookieBanner: HTMLInputElement | null;
        privacyPolicyUrl: HTMLInputElement | null;
        isKnowledgePublic: HTMLInputElement | null;
    };
    containers: {
        containerGrid: HTMLElement | null;
        containerManagementGrid: HTMLElement | null;
        chatMessages: HTMLElement | null;
        chatWelcome: HTMLElement | null;
        welcomeIcon: HTMLElement | null;
        welcomeQuestions: HTMLElement | null;
        sidebarAppsSection: HTMLElement | null;
        sidebarIntegrationsSection: HTMLElement | null;
        sidebarHistoryList: HTMLElement | null;
        sidebarAssistantLink: HTMLElement | null;
        sidebarKnowledgeLink: HTMLElement | null;
        attachmentOptions: HTMLElement | null;
        attachmentPreview: HTMLElement | null;
        containerIconSelector: HTMLElement | null;
        editContainerIconSelector: HTMLElement | null;
        quickQuestionsList: HTMLElement | null;
        personasList: HTMLElement | null;
        accessControlList: HTMLElement | null;
        availableModelsList: HTMLElement | null;
        modelManagementList: HTMLElement | null;
        functionsList: HTMLElement | null;
        functionRunnerBody: HTMLElement | null;
        settingsTabs: HTMLElement | null;
        settingsPanels: NodeListOf<HTMLElement>;
        globalSettingsTabs: HTMLElement | null;
        globalSettingsPanels: NodeListOf<HTMLElement>;
        modelSelect: HTMLElement | null;
        personaSelect: HTMLElement | null;
        fileDropzone: HTMLElement | null;
        knowledgeFileList: HTMLElement | null;
        aiSuggestions: HTMLElement | null;
        suggestedQuestions: HTMLElement | null;
        suggestedPersonas: HTMLElement | null;
        suggestedApps: HTMLElement | null;
        addContainerThemePreview: HTMLElement | null;
        toast: HTMLElement | null;
        containerWebsiteGroup: HTMLElement | null;
        appearancePreview: HTMLElement | null;
        sidebarPreview: HTMLElement | null;
        brandingPreview: HTMLElement | null;
        loginAppLogo: HTMLElement | null;
        hubAppLogo: HTMLElement | null;
        cookieBanner: HTMLElement | null;
        containerManagementCard: HTMLElement | null;
        globalSettingsCard: HTMLElement | null;
        integrationsGrid: HTMLElement | null;
        containerIntegrationsList: HTMLElement | null;
        cardImageOptionsList: HTMLElement | null;
    };
    textElements: {
        containerPageTitle: HTMLElement | null;
        sidebarContainerTitle: HTMLElement | null;
        attachmentFilename: HTMLElement | null;
        settingsHubTitle: HTMLElement | null;
        containerManagementTitle: HTMLElement | null;
        globalSettingsTitle: HTMLElement | null;
        settingsDetailTitle: HTMLElement | null;
        functionRunnerTitle: HTMLElement | null;
        deleteItemName: HTMLElement | null;
        deleteConfirmDescription: HTMLElement | null;
        aiStatusText: HTMLElement | null;
        aiStatusSpinner: HTMLElement | null;
        welcomeTitle: HTMLElement | null;
        knowledgePageTitle: HTMLElement | null;
        knowledgeTitle: HTMLElement | null;
        knowledgeSubtitle: HTMLElement | null;
        loginTitle: HTMLElement | null;
        loginSubtitle: HTMLElement | null;
        hubHeaderTitle: HTMLElement | null;
        hubTitle: HTMLElement | null;
        hubSubtitle: HTMLElement | null;
        brandingPreviewTitle: HTMLElement | null;
        brandingPreviewSubtitle: HTMLElement | null;
        privacyPolicyLink: HTMLAnchorElement | null;
    };
    loaders: {
        sendChat: Element | null;
        aiGenerate: Element | null;
    };
    previews: {
        addCustomIcon: HTMLImageElement | null;
        editCustomIcon: HTMLImageElement | null;
        editCardImage: HTMLImageElement | null;
        addContainerTheme: Element | null;
        brandingLogo: HTMLElement | null;
    };
}


// Initialize the DOM object with a structure that can be repopulated
export let DOM: DOMStructure = {} as DOMStructure;

export const reQueryDOM = () => {
    DOM.root = document.getElementById('root');
    DOM.appRoot = document.getElementById('app-root');
    DOM.pageViews = {
        login: document.getElementById('login-page'),
        hub: document.getElementById('hub-page'),
        settingsHub: document.getElementById('settings-hub-page'),
        containerManagement: document.getElementById('container-management-page'),
        globalSettings: document.getElementById('global-settings-page'),
        settingsDetail: document.getElementById('settings-detail-page'),
        department: document.getElementById('container-page'),
        knowledge: document.getElementById('knowledge-page'),
    };
    DOM.modals = {
        addContainer: document.getElementById('add-container-modal'),
        functionRunner: document.getElementById('function-runner-modal'),
        deleteConfirm: document.getElementById('delete-confirm-modal'),
        sharepointPicker: document.getElementById('sharepoint-picker-modal'),
    };
    DOM.buttons = {
        googleLogin: document.getElementById('google-login'),
        microsoftLogin: document.getElementById('microsoft-login'),
        settings: document.getElementById('settings-btn'),
        addContainer: document.getElementById('add-container-btn'),
        backToHub: document.querySelectorAll('.back-to-hub-btn'),
        backToSettingsHub1: document.getElementById('back-to-settings-hub-btn-1'),
        backToSettingsHub2: document.getElementById('back-to-settings-hub-btn-2'),
        backToContainerManagement: document.getElementById('back-to-container-management-btn'),
        backToAssistant: document.getElementById('back-to-assistant-btn'),
        sidebarToggle: document.getElementById('sidebar-toggle-btn'),
        attachment: document.getElementById('attachment-btn') as HTMLButtonElement,
        uploadComputer: document.getElementById('upload-computer-btn'),
        uploadSharepoint: document.getElementById('upload-sharepoint-btn'),
        removeAttachment: document.getElementById('remove-attachment-btn'),
        suggestQuestions: document.getElementById('suggest-questions-btn') as HTMLButtonElement,
        suggestPersonas: document.getElementById('suggest-personas-btn') as HTMLButtonElement,
        generateFunction: document.getElementById('generate-function-btn') as HTMLButtonElement,
        generateAi: document.getElementById('generate-ai-btn') as HTMLButtonElement,
        closeModal: document.getElementById('close-modal-btn'),
        cancelContainer: document.getElementById('cancel-container-btn'),
        createContainer: document.getElementById('create-container-btn') as HTMLButtonElement,
        closeFunctionRunner: document.getElementById('close-function-runner-btn'),
        cancelFunctionRunner: document.getElementById('cancel-function-runner-btn'),
        deleteContainer: document.getElementById('delete-container-btn'),
        closeDeleteModal: document.getElementById('close-delete-modal-btn'),
        cancelDelete: document.getElementById('cancel-delete-btn'),
        confirmDelete: document.getElementById('confirm-delete-btn'),
        newChat: document.getElementById('new-chat-btn'),
        sendChat: document.getElementById('send-chat-btn') as HTMLButtonElement,
        manageKnowledge: document.getElementById('manage-knowledge-btn'),
        knowledgeUpload: document.getElementById('knowledge-upload-btn'),
        knowledgeAddSharepoint: document.getElementById('knowledge-add-sharepoint-btn'),
        saveSettings: document.getElementById('save-settings-btn') as HTMLButtonElement,
        cancelSettings: document.getElementById('cancel-settings-btn') as HTMLButtonElement,
        saveGlobalSettings: document.getElementById('save-global-settings-btn') as HTMLButtonElement,
        cancelGlobalSettings: document.getElementById('cancel-global-settings-btn') as HTMLButtonElement,
        addCustomIcon: document.getElementById('add-custom-icon-btn') as HTMLButtonElement,
        editCustomIcon: document.getElementById('edit-custom-icon-btn') as HTMLButtonElement,
        editGlobalLogo: document.getElementById('edit-global-logo-btn') as HTMLButtonElement,
        acceptCookies: document.getElementById('accept-cookies-btn'),
        editCardImage: document.getElementById('edit-card-image-btn') as HTMLButtonElement,
    };
    DOM.forms = {
        chat: document.getElementById('chat-form') as HTMLFormElement,
        addContainer: document.getElementById('add-container-form') as HTMLFormElement,
        addQuickQuestion: document.getElementById('add-quick-question-form') as HTMLFormElement,
        addPersona: document.getElementById('add-persona-form') as HTMLFormElement,
        addAccessor: document.getElementById('add-accessor-form') as HTMLFormElement,
        addFunction: document.getElementById('add-function-form') as HTMLFormElement,
        addModel: document.getElementById('add-model-form') as HTMLFormElement,
        functionRunner: document.getElementById('function-runner-form') as HTMLFormElement,
        settingsContainer: document.getElementById('settings-form-container') as HTMLFormElement,
        globalSettings: document.getElementById('global-settings-form') as HTMLFormElement,
    };
    DOM.inputs = {
        chat: document.getElementById('chat-input') as HTMLTextAreaElement,
        fileUpload: document.getElementById('file-upload-input') as HTMLInputElement,
        containerName: document.getElementById('container-name-input') as HTMLInputElement,
        containerDesc: document.getElementById('container-desc-input') as HTMLTextAreaElement,
        containerType: document.getElementById('container-type-select') as HTMLSelectElement,
        containerWebsite: document.getElementById('container-website-input') as HTMLInputElement,
        editContainerName: document.getElementById('edit-container-name') as HTMLInputElement,
        editContainerDesc: document.getElementById('edit-container-desc') as HTMLTextAreaElement,
        newQuickQuestion: document.getElementById('new-quick-question-input') as HTMLInputElement,
        newPersona: document.getElementById('new-persona-input') as HTMLTextAreaElement,
        newAccessor: document.getElementById('new-accessor-input') as HTMLInputElement,
        newFunction: document.getElementById('new-function-input') as HTMLInputElement,
        newModelId: document.getElementById('new-model-id') as HTMLInputElement,
        newModelApi: document.getElementById('new-model-api') as HTMLInputElement,
        newModelIcon: document.getElementById('new-model-icon') as HTMLInputElement,
        knowledgeFile: document.getElementById('knowledge-file-input') as HTMLInputElement,
        userBgColor: document.getElementById('user-bg-color') as HTMLInputElement,
        userTextColor: document.getElementById('user-text-color') as HTMLInputElement,
        botBgColor: document.getElementById('bot-bg-color') as HTMLInputElement,
        botTextColor: document.getElementById('bot-text-color') as HTMLInputElement,
        bgGradientStartColor: document.getElementById('bg-gradient-start-color') as HTMLInputElement,
        bgGradientEndColor: document.getElementById('bg-gradient-end-color') as HTMLInputElement,
        sidebarBgColor: document.getElementById('sidebar-bg-color') as HTMLInputElement,
        sidebarTextColor: document.getElementById('sidebar-text-color') as HTMLInputElement,
        sidebarHighlightBgColor: document.getElementById('sidebar-highlight-bg-color') as HTMLInputElement,
        addCustomIconUpload: document.getElementById('add-custom-icon-upload') as HTMLInputElement,
        editCustomIconUpload: document.getElementById('edit-custom-icon-upload') as HTMLInputElement,
        editCardImageUpload: document.getElementById('edit-card-image-upload') as HTMLInputElement,
        editLoginTitle: document.getElementById('edit-login-title') as HTMLInputElement,
        editLoginSubtitle: document.getElementById('edit-login-subtitle') as HTMLInputElement,
        editHubHeaderTitle: document.getElementById('edit-hub-header-title') as HTMLInputElement,
        editHubTitle: document.getElementById('edit-hub-title') as HTMLInputElement,
        editHubSubtitle: document.getElementById('edit-hub-subtitle') as HTMLInputElement,
        editGlobalLogoUpload: document.getElementById('edit-global-logo-upload') as HTMLInputElement,
        enableGoogleLogin: document.getElementById('enable-google-login') as HTMLInputElement,
        googleClientId: document.getElementById('google-client-id') as HTMLInputElement,
        googleClientSecret: document.getElementById('google-client-secret') as HTMLInputElement,
        enableMicrosoftLogin: document.getElementById('enable-microsoft-login') as HTMLInputElement,
        microsoftClientId: document.getElementById('microsoft-client-id') as HTMLInputElement,
        microsoftClientSecret: document.getElementById('microsoft-client-secret') as HTMLInputElement,
        enableCookieBanner: document.getElementById('enable-cookie-banner') as HTMLInputElement,
        privacyPolicyUrl: document.getElementById('privacy-policy-url') as HTMLInputElement,
        isKnowledgePublic: document.getElementById('is-knowledge-public') as HTMLInputElement,
    };
    DOM.containers = {
        containerGrid: document.getElementById('container-grid'),
        containerManagementGrid: document.getElementById('container-management-grid'),
        chatMessages: document.getElementById('chat-messages'),
        chatWelcome: document.getElementById('chat-welcome'),
        welcomeIcon: document.getElementById('welcome-icon'),
        welcomeQuestions: document.getElementById('welcome-questions'),
        sidebarAppsSection: document.getElementById('sidebar-apps-section'),
        sidebarIntegrationsSection: document.getElementById('sidebar-integrations-section'),
        sidebarHistoryList: document.getElementById('sidebar-history-list'),
        sidebarAssistantLink: document.getElementById('sidebar-assistant-link'),
        sidebarKnowledgeLink: document.getElementById('sidebar-knowledge-link'),
        attachmentOptions: document.getElementById('attachment-options'),
        attachmentPreview: document.getElementById('attachment-preview'),
        containerIconSelector: document.getElementById('container-icon-selector'),
        editContainerIconSelector: document.getElementById('edit-container-icon-selector'),
        quickQuestionsList: document.getElementById('quick-questions-list'),
        personasList: document.getElementById('personas-list'),
        accessControlList: document.getElementById('access-control-list'),
        availableModelsList: document.getElementById('available-models-list'),
        modelManagementList: document.getElementById('model-management-list'),
        functionsList: document.getElementById('functions-list'),
        functionRunnerBody: document.getElementById('function-runner-body'),
        settingsTabs: document.getElementById('settings-tabs'),
        settingsPanels: document.querySelectorAll('#settings-detail-page .tab-panel'),
        globalSettingsTabs: document.getElementById('global-settings-tabs'),
        globalSettingsPanels: document.querySelectorAll('#global-settings-page .tab-panel'),
        modelSelect: document.getElementById('model-select-container'),
        personaSelect: document.getElementById('persona-select-container'),
        fileDropzone: document.getElementById('file-dropzone'),
        knowledgeFileList: document.getElementById('knowledge-file-list'),
        aiSuggestions: document.getElementById('ai-suggestions-container'),
        suggestedQuestions: document.getElementById('suggested-questions-list'),
        suggestedPersonas: document.getElementById('suggested-personas-list'),
        suggestedApps: document.getElementById('suggested-apps-list'),
        addContainerThemePreview: document.getElementById('add-container-theme-preview'),
        toast: document.getElementById('toast-notification'),
        containerWebsiteGroup: document.getElementById('container-website-group'),
        appearancePreview: document.getElementById('appearance-preview'),
        sidebarPreview: document.getElementById('sidebar-preview'),
        brandingPreview: document.getElementById('branding-preview'),
        loginAppLogo: document.getElementById('login-app-logo'),
        hubAppLogo: document.getElementById('hub-app-logo'),
        cookieBanner: document.getElementById('cookie-consent-banner'),
        containerManagementCard: document.getElementById('container-management-card'),
        globalSettingsCard: document.getElementById('global-settings-card'),
        integrationsGrid: document.getElementById('integrations-grid'),
        containerIntegrationsList: document.getElementById('container-integrations-list'),
        cardImageOptionsList: document.getElementById('card-image-options-list'),
    };
    DOM.textElements = {
        containerPageTitle: document.getElementById('container-page-title'),
        sidebarContainerTitle: document.getElementById('sidebar-container-title'),
        attachmentFilename: document.getElementById('attachment-filename'),
        settingsHubTitle: document.getElementById('settings-hub-title'),
        containerManagementTitle: document.getElementById('container-management-title'),
        globalSettingsTitle: document.getElementById('global-settings-title'),
        settingsDetailTitle: document.getElementById('settings-detail-title'),
        functionRunnerTitle: document.getElementById('function-runner-title'),
        deleteItemName: document.getElementById('delete-item-name'),
        deleteConfirmDescription: document.getElementById('delete-confirm-description'),
        aiStatusText: document.getElementById('ai-status-text'),
        aiStatusSpinner: document.getElementById('ai-status-spinner'),
        welcomeTitle: document.getElementById('welcome-title'),
        knowledgePageTitle: document.getElementById('knowledge-page-title'),
        knowledgeTitle: document.getElementById('knowledge-title'),
        knowledgeSubtitle: document.getElementById('knowledge-subtitle'),
        loginTitle: document.getElementById('login-title-text'),
        loginSubtitle: document.getElementById('login-subtitle-text'),
        hubHeaderTitle: document.getElementById('hub-header-title'),
        hubTitle: document.getElementById('hub-title-text'),
        hubSubtitle: document.getElementById('hub-subtitle-text'),
        brandingPreviewTitle: document.getElementById('branding-preview-title'),
        brandingPreviewSubtitle: document.getElementById('branding-preview-subtitle'),
        privacyPolicyLink: document.getElementById('privacy-policy-link') as HTMLAnchorElement,
    };
    DOM.loaders = {
        sendChat: document.querySelector('#send-chat-btn .thinking-loader'),
        aiGenerate: document.querySelector('#generate-ai-btn .thinking-loader'),
    };
    DOM.previews = {
        addCustomIcon: document.getElementById('add-custom-icon-preview') as HTMLImageElement,
        editCustomIcon: document.getElementById('edit-custom-icon-preview') as HTMLImageElement,
        editCardImage: document.getElementById('edit-card-image-preview') as HTMLImageElement,
        addContainerTheme: document.querySelector('#add-container-theme-preview .appearance-preview'),
        brandingLogo: document.getElementById('branding-preview-logo'),
    };
};