# AI Agent Development Rules & Guiding Principles

## Introduction

This document outlines the core principles and rules that I, the AI developer agent, follow when making changes to the "Hub Nice State" application. The purpose of these rules is to ensure that every modification is high-quality, secure, maintainable, and aligned with the project's architectural vision and user-centric goals.

---

### Rule 1: Security First

Security is the most critical aspect of this application. There are no compromises.

-   **Zero Secrets on the Client**: I will never write code that exposes API keys, client secrets, or any other sensitive credentials to the frontend.
-   **Strict Adherence to BFF**: All communication with external services (Google AI, Microsoft Graph, etc.) **must** be proxied through the backend API (`/api/*`). I will not write client-side `fetch` calls to external domains.
-   **Validate User Sessions**: All backend endpoints that handle sensitive data or actions must first validate the user's session. I will consistently use the `getSession` utility for this purpose.

---

### Rule 2: User Experience is Paramount

The application must be intuitive, accessible, and aesthetically pleasing.

-   **Intuitive UI**: New features should be easy to understand and use. I will place buttons and controls in logical locations and use clear, concise language for labels and instructions.
-   **Accessibility (A11y)**: I will use semantic HTML and ARIA attributes (`role`, `aria-label`, etc.) where necessary to ensure the application is usable by people with disabilities. Interactive elements will be keyboard-navigable.
-   **Visual Polish**: I will respect the existing design language, ensuring consistent use of colors, fonts, and spacing. New components will match the established aesthetic. The UI should always look professional and clean.

---

### Rule 3: Maintain Architectural Integrity

The established patterns make the codebase predictable and maintainable. I will not deviate from them without a compelling reason.

-   **Separation of Concerns**:
    -   **`handlers.ts`** is for business logic (what happens when a user clicks).
    -   **`ui.ts`** is for DOM manipulation (how the result is displayed).
    -   **`api.ts`** is for communicating with our *own* backend.
    -   **`state.ts`** is the single source of truth for application state.
-   **Framework-less Approach**: I will continue to use standard TypeScript, HTML, and CSS without introducing a frontend framework like React or Vue.
-   **Modularity**: I will keep functions focused on a single task and organize code into the appropriate files.

---

### Rule 4: Code Quality & Maintainability

The code I write must be easy for human developers to read, understand, and modify in the future.

-   **Readability**: I will use clear variable names, write concise functions, and add comments to explain complex or non-obvious logic.
-   **Performance**: I will be mindful of performance, avoiding unnecessary re-renders or computationally expensive operations in loops.
-   **Type Safety**: I will leverage TypeScript to its full potential, creating types and interfaces for all data structures in `src/types.ts` to prevent runtime errors.

---

### Rule 5: Incremental & Minimal Changes

My goal is to satisfy the user's request with the smallest effective change.

-   **Targeted Modifications**: I will only modify the files necessary to implement the requested change. I will avoid large, unrelated refactors unless specifically asked.
-   **Risk Reduction**: Smaller changes are easier to review and less likely to introduce bugs.

---

### Rule 6: Validate Before Finalizing

Before presenting my changes, I will perform the checks outlined in `AGENTS.md`.

-   Run static analysis (`tsc --noEmit`).
-   Mentally walk through the security and architectural checklists.
-   Ensure the changes directly address the user's request.
