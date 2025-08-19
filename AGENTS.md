# Agent Validation & Operations Guide

## Introduction

This document provides a technical checklist and a set of operational procedures for an AI developer agent. The purpose is to ensure that all code modifications adhere to the project's quality, security, and architectural standards. These steps should be performed after implementing a feature request and before presenting the final code.

---

## 1. Static Analysis & Type Checking

Before any other validation, ensure the code is free of TypeScript errors. This is the first line of defense against bugs.

**Command:**
```bash
npx tsc --noEmit
```

**Expected Result:** The command should complete with no errors reported. If errors are found, they must be resolved before proceeding.

---

## 2. Security Validation Checklist

Security is the top priority. The Backend for Frontend (BFF) architecture must be strictly maintained.

-   **[ ] No Secrets in Client Code**: Manually inspect all files in the `src/` directory. There must be **zero** instances of API keys, client secrets, or other sensitive credentials.
-   **[ ] All External API Calls are Proxied**:
    -   Verify that all calls to Google Gemini are routed through the `/api/gemini` endpoint via the abstraction in `src/api.ts`.
    -   Verify that all calls to Microsoft Graph are routed through the `/api/graph` endpoint via the abstraction in `src/graph.ts`.
    -   There should be no `fetch` calls to `googleapis.com` or `graph.microsoft.com` anywhere in the `src/` directory.
-   **[ ] Secure Authentication Flow**:
    -   Confirm that client-side MSAL configuration has been completely removed.
    -   Authentication logic in `src/auth.ts` should only redirect to backend endpoints (`/api/auth/login`, `/api/auth/logout`) or fetch user data from a secure endpoint (`/api/user/profile`).

---

## 3. Architectural Compliance Checklist

Ensure changes respect the established patterns of the application.

-   **[ ] Correct State Management**: Any modification that changes persistent application data (workspaces, branding, models) **must** call `saveState()` from `src/utils.ts`.
-   **[ ] Correct UI Rendering**:
    -   DOM manipulation should only occur in `src/ui.ts`.
    -   Business logic (event handling) should reside in `src/handlers.ts`.
    -   After a page is loaded via `showPage()`, `reQueryDOM()` must be called if new DOM elements need to be accessed.
-   **[ ] Type Safety**: All new data structures must have corresponding TypeScript interfaces defined in `src/types.ts`.

---

## 4. Path and Asset Validation

Ensure that all references to local files are correct.

-   **[ ] Page Partials**: If a new page is added, confirm that the HTML file exists in `src/pages/` and that the key used in `showPage('pageKey')` correctly corresponds to the filename.
-   **[ ] Modal Partials**: Confirm that any HTML file loaded for a modal exists in `src/modals/`.
-   **[ ] Image/Asset Paths**: While this project currently uses inline SVGs and remote URLs, be mindful of any future static assets and ensure their paths are correct.
