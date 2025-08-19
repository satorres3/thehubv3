/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { ChatTheme, Branding, AIModel, Container } from './types';

export const DEFAULT_THEME: ChatTheme = {
    userBg: '#0077b6',
    userText: '#ffffff',
    botBg: '#1a1a2e',
    botText: '#f0f0f0',
    bgGradientStart: '#0f0c29',
    bgGradientEnd: '#24243e',
    sidebarBg: '#0f0c29',
    sidebarText: '#a9a9b3',
    sidebarHighlightBg: 'rgba(0, 191, 255, 0.1)',
};

export const DEFAULT_BRANDING: Branding = {
    loginTitle: 'The Future of Tech',
    loginSubtitle: 'Sign in to continue',
    hubTitle: 'Welcome to the Hub',
    hubSubtitle: 'Select a workspace to get started',
    hubHeaderTitle: 'The Hub',
    appLogo: '',
    enableGoogleLogin: true,
    googleClientId: '',
    googleClientSecret: '',
    enableMicrosoftLogin: true,
    microsoftClientId: '',
    microsoftClientSecret: '',
    enableCookieBanner: false,
    privacyPolicyUrl: '',
    integrations: {
        sharepoint: false,
        brevo: false,
        hubspot: false,
        docusign: false,
        outlook: true,
    }
};

export const DEFAULT_MODELS: AIModel[] = [
    { id: 'gemini-2.5-flash', api: 'google', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.75 4.75L10.25 9.25L5.75 11.75L10.25 14.25L12.75 18.75L15.25 14.25L19.75 11.75L15.25 9.25L12.75 4.75Z"/></svg>` },
];

// Icons for different container types (e.g., departments)
export const AVAILABLE_ICONS = [
    // Briefcase for business/generic
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    // Users for HR
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    // Bar chart for finance/analytics
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
    // Code for IT/Engineering
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    // Megaphone for Marketing
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path><path d="M10 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"></path><path d="M10 14c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2-2z"></path></svg>`,
    // Shopping cart for Sales
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
];

// A version of AVAILABLE_ICONS with descriptions for the AI to understand the context
export const AVAILABLE_ICONS_WITH_DESC = [
    { icon: AVAILABLE_ICONS[0], description: "A briefcase icon, suitable for business, corporate, or professional workspaces." },
    { icon: AVAILABLE_ICONS[1], description: "An icon with multiple users, ideal for HR, team collaboration, or community-focused workspaces." },
    { icon: AVAILABLE_ICONS[2], description: "A bar chart icon, representing data, analytics, finance, or reporting workspaces." },
    { icon: AVAILABLE_ICONS[3], description: "A code bracket icon, perfect for IT, software development, engineering, or technical workspaces." },
    { icon: AVAILABLE_ICONS[4], description: "A megaphone icon, great for marketing, announcements, communication, or public relations workspaces." },
    { icon: AVAILABLE_ICONS[5], description: "A shopping cart icon, suitable for sales, e-commerce, retail, or customer order workspaces." },
];

// Icons for different function types
export const FUNCTION_ICONS = [
    // Send email
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    // Calendar
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    // Search
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    // File
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`,
    // Edit
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
];

// Stock image options for container cards on the management page
export const CARD_IMAGE_OPTIONS = [
    { url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=60', description: 'Abstract purple and blue gradient.' },
    { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=60', description: 'Pastel color gradient.' },
    { url: 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?auto=format&fit=crop&w=800&q=60', description: 'Office building interior with geometric shapes.' },
    { url: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&w=800&q=60', description: 'Dark abstract wave-like texture.' },
    { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60', description: 'Snowy mountains under a starry night sky.' },
    { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60', description: 'A modern desk setup with a laptop and notebook.' },
];

// Initial data to populate the app if no saved state is found
export const INITIAL_CONTAINERS_DATA: Omit<Container, 'id' | 'chats' | 'activeChatId'>[] = [
    {
        name: 'Human Resources',
        description: 'Your go-to assistant for all HR-related questions and tasks.',
        icon: AVAILABLE_ICONS[1],
        cardImageUrl: CARD_IMAGE_OPTIONS[2].url,
        quickQuestions: [
            'How do I request time off?',
            'What are our company holidays?',
            'Where can I find the employee handbook?',
            'Explain the benefits package.',
        ],
        availableModels: ['gemini-2.5-flash'],
        availablePersonas: ['Friendly HR Bot', 'Policy Expert', 'Helpful Colleague', 'Confidential Advisor'],
        selectedModel: 'gemini-2.5-flash',
        selectedPersona: 'Friendly HR Bot',
        functions: [],
        enabledIntegrations: [],
        accessControl: ['hr@company.com'],
        knowledgeBase: [],
        theme: {
            ...DEFAULT_THEME,
            userBg: '#005f73',
            botBg: '#e9d8a6',
            botText: '#001219',
            bgGradientStart: '#e9f5f9',
            bgGradientEnd: '#d0e8f2',
            sidebarBg: '#003049',
        },
        isKnowledgeBasePublic: true,
    },
    {
        name: 'IT Support',
        description: 'Get help with technical issues, software, and hardware.',
        icon: AVAILABLE_ICONS[3],
        cardImageUrl: CARD_IMAGE_OPTIONS[3].url,
        quickQuestions: [
            'My VPN is not connecting.',
            'How do I reset my password?',
            'Request access to a new software.',
            'What is the status of the network?',
        ],
        availableModels: ['gemini-2.5-flash'],
        availablePersonas: ['Tech Guru', 'Patient Troubleshooter', 'System Analyst', 'Quick Fix Bot'],
        selectedModel: 'gemini-2.5-flash',
        selectedPersona: 'Tech Guru',
        functions: [],
        enabledIntegrations: ['sharepoint'],
        accessControl: ['it-support@company.com'],
        knowledgeBase: [],
        theme: {
            ...DEFAULT_THEME,
            userBg: '#3d405b',
            botBg: '#e07a5f',
            botText: '#ffffff',
            bgGradientStart: '#2c2c2c',
            bgGradientEnd: '#1e1e1e',
            sidebarBg: '#181818',
        },
        isKnowledgeBasePublic: false,
    },
];
