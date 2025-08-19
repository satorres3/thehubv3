# Application Architecture Documentation

## Introduction

This document provides a technical overview of the "Hub Nice State" application. It outlines the core architecture, data structures, and operational flow to facilitate understanding and modification of the codebase.

The application is a Static Web App (SPA) built with TypeScript, HTML, and CSS, utilizing native browser features and ES modules. It does **not** use a frontend framework like React or Vue.

## Development Roadmap

The project's development is structured into multiple phases, detailed in `phases.md`. The overall strategy is to:
1.  Build a functional client-side proof-of-concept. **(Complete)**
2.  Refactor to a secure Backend for Frontend (BFF) architecture. **(Complete)**
3.  Enhance AI capabilities and add collaborative features. **(In Progress)**
4.  Build out administrative and analytics tools.
5.  Prepare for enterprise-level scalability and governance.

Understanding the current phase is critical for making architectural decisions.

## Core Concepts

### 1. Workspaces (formerly Containers)
A **Workspace** is the central concept of the application from a user's perspective. It represents an isolated AI instance.
- **Note on Naming**: While all user-facing text refers to this concept as a "Workspace," the internal codebase (variable names, function names, CSS classes, etc.) still uses the legacy term **`Container`**. This was a deliberate choice to avoid a high-risk, large-scale refactor of the entire codebase. When modifying the code, you will interact with variables like `state.containers`, functions like `renderAllContainers`, and types like `interface Container`.
- **Data Structure**: Defined in `src/types.ts` as the `Container` interface.
- **Key Properties**:
    - `id`: Unique identifier.
    - `name`, `description`, `icon`: Basic display properties.
    - `knowledgeBase`: An array of `KnowledgeFile` objects. These files are used to ground the AI's responses.
    - `theme`: A `ChatTheme` object that defines the workspace's unique color scheme.
    - `functions`: An array of `AppFunction` objects, which are custom AI-powered tools.
    - `chats`: An array of `ChatEntry` objects, storing the entire conversation history for that workspace.

### 2. State & Configuration Management (Target Architecture)
The application's data and configuration are managed through distinct layers, following a secure Backend for Frontend (BFF) pattern.

- **Application State**:
    - **File**: `src/state.ts`
    - **Object**: `state`
    - **Persistence**: While the frontend manages the immediate UI state, all persistent state changes are saved to and loaded from a backend via an abstraction layer in `src/backend.ts`. For local development, this layer simulates backend calls using `localStorage`.

- **External Configuration & Secrets**:
    - **Concept**: All sensitive configuration (auth client IDs, secrets, AI API keys) is held exclusively on the server-side backend. The frontend **never** has direct access to these secrets.
    - **API Proxying**: All calls to external services (Google Gemini, Microsoft Graph) are proxied through the server-side backend (`api/` directory). The backend is responsible for securely attaching the necessary API keys or OAuth tokens to these outbound requests.

### 3. UI Rendering and Page Navigation
The UI is not framework-based. It relies on dynamically loading HTML partials and manipulating the DOM directly.
- **Page Partials**: All distinct views are stored as separate HTML files in `src/pages/`.
- **Navigation**: The `showPage(pageKey)` function in `src/ui.ts` is the primary method for navigation. It fetches the corresponding HTML from `src/pages/`, injects it into the `<main id="app-root"></main>` element in `index.html`, and then calls `reQueryDOM()` from `src/dom.ts`.
- **Rendering Functions**: `src/ui.ts` contains all functions responsible for rendering data into the DOM (e.g., `renderAllContainers`, `renderChatHistory`, `renderContainerSettings`). These functions read directly from the `state` object.

### 4. Event Handling
All user interactions are handled via event delegation from a single listener on the `<div id="root">` element.
- **File**: `index.tsx`
- **Function**: `bindEventListeners()`
- **Logic**: The listener uses `e.target` and `.closest()` to identify which element was clicked and then calls the appropriate handler function.
- **Handlers**: The actual business logic for events is located in `src/handlers.ts`. These functions are responsible for updating the state and calling UI rendering functions.

## File Structure Breakdown

- **`index.html`**: The main application shell. Contains the `<div id="root">` and `<main id="app-root">`, and the main script tag.
- **`index.tsx`**: The application entry point. Handles initialization (`initializeApp`), binds the main event listener, and manages the top-level application flow.
- **`phases.md`**: Outlines the multi-phase development roadmap for the project.
- **`api/`**: The server-side Azure Functions project. Contains all backend logic.
    - **`src/functions/`**: Holds individual serverless function endpoints (e.g., `authLogin.ts`, `userProfile.ts`, `geminiProxy.ts`).
    - **`src/shared/`**: Contains shared code for the backend, such as `config.ts`, `msal.ts` (for MSAL client), and `session.ts` (for cookie encryption).
    - **`local.settings.json`**: For local development, stores backend secrets. **This file should not be committed.**
- **`src/`**: Client-side source code directory.
    - **`types.ts`**: Contains all TypeScript interfaces for the application's data structures (`Container`, `Branding`, `User`, etc.). **This is a critical file to understand the data model.**
    - **`state.ts`**: Defines and exports the global `state` object.
    - **`constants.ts`**: Stores default data, initial configurations, and lists of options (e.g., `DEFAULT_THEME`, `INITIAL_CONTAINERS_DATA`).
    - **`dom.ts`**: Manages all DOM element selections. Exports a `DOM` object and a `reQueryDOM()` function to update it after page loads.
    - **`ui.ts`**: Contains all functions that directly manipulate the DOM to display data. This is where you find functions for rendering pages, lists, previews, and chat messages.
    - **`handlers.ts`**: Contains the business logic for user interactions (e.g., `handleSendMessage`, `handleLogin`, `handleCreateContainer`). These functions modify the `state` and call functions from `ui.ts`.
    - **`api.ts`**: Encapsulates all calls to the application's own backend API endpoints (e.g., `/api/gemini`). It no longer makes direct calls to external services.
    - **`backend.ts`**: An abstraction layer for data persistence.
    - **`auth.ts`**: Manages the client-side stubs for the server-side authentication flow. It provides `login()` and `logout()` functions that redirect to the backend, and a `checkSession()` function to fetch the current user's profile from `/api/user/profile`.
    - **`graph.ts`**: A dedicated service for making calls to our backend's Microsoft Graph proxy endpoints (e.g., `/api/graph`). It abstracts away the proxying mechanism from the rest of the application.
    - **`utils.ts`**: Provides helper functions like `saveState`, `loadState`, `fileToBase64`, etc.
    - **`pages/`**: Directory containing all HTML partials for the different views of the application.
    - **`modals/`**: Directory containing HTML partials for modal dialogs.
    - **`styles/`**: Directory containing the modularized CSS files.
        - **`main.css`**: The main entry point that imports all other CSS files.