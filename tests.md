# Test Plan: Phase 2 - Security Hardening & Backend Integration

## 1. Objective

The primary goal of this test plan is to validate the successful migration of the application from a client-side-only model to a secure Backend for Frontend (BFF) architecture. This plan will verify:
1.  All sensitive credentials (API keys, client secrets) are removed from the client and managed exclusively by the backend Azure Functions.
2.  The server-side authentication flow is secure and correctly manages user sessions via `HttpOnly` cookies.
3.  All API calls to external services (Google Gemini, Microsoft Graph) are successfully and securely proxied through the backend.
4.  The new Knowledge Base API endpoints function correctly.
5.  The application's core features remain fully functional after the architectural changes.

## 2. Scope

### In Scope:
-   End-to-end user authentication flow (Login, Logout, Session validation).
-   Secure session management (cookie validation).
-   Functionality of all backend API endpoints (`/api/auth/*`, `/api/user/profile`, `/api/gemini`, `/api/graph`, `/api/knowledge/*`).
-   Client-side integration with the new backend proxy and auth endpoints.
-   Verification of the absence of secrets in client-side code.
-   Basic observability checks (confirming logs are generated).

### Out of Scope:
-   UI/UX cosmetic testing (unless directly impacted by backend changes).
-   Performance, stress, or load testing.
-   Full regression testing of Phase 1 features that have no backend dependency (e.g., theme color pickers).

## 3. Prerequisites

### For Local Testing:
1.  **Backend Running**: The Azure Functions API is running locally via `func start`.
2.  **Frontend Running**: The Vite development server is running via `npm run dev`.
3.  **Configuration**: The `api/local.settings.json` file is populated with valid credentials for MSAL and Gemini.
4.  **Tools**: Browser with developer tools (Network, Application, and Console tabs).

### For Azure Testing:
1.  **Deployment**: The latest version of the application has been successfully deployed to an Azure Static Web App instance.
2.  **Configuration**: All necessary application settings (e.g., `MSAL_CLIENT_ID`, `GEMINI_API_KEY`, `SESSION_SECRET`) are correctly configured in the Azure Static Web App's "Configuration" section.
3.  **Permissions**: The tester has access to the deployed application URL and the Azure Portal to view logs in Application Insights if needed.

---

## 4. Test Cases

### 4.1. Authentication & Session Management

| Test Case ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | **Successful Login Flow** | 1. Navigate to the application root URL. <br> 2. Click the "Sign in with Microsoft" button. <br> 3. Complete the Microsoft login flow. | 1. The user is redirected to the Microsoft login page. <br> 2. After successful authentication, the user is redirected back to the application's hub page (`/`). <br> 3. The user's profile information is correctly displayed in the header. |
| **AUTH-02** | **Secure `HttpOnly` Session Cookie** | 1. After a successful login (AUTH-01), open browser developer tools. <br> 2. Go to the "Application" tab -> "Cookies". <br> 3. Find the cookie named `HUB_SESSION`. <br> 4. Go to the "Console" tab and type `document.cookie`. | 1. The `HUB_SESSION` cookie exists. <br> 2. The "HttpOnly" column for this cookie is checked (`✓`). <br> 3. The `document.cookie` command **does not** return the `HUB_SESSION` cookie, proving it's inaccessible to client-side scripts. |
| **AUTH-03** | **Successful Logout Flow** | 1. While logged in, click the user profile icon in the header. <br> 2. Click the "Logout" button. | 1. The user is redirected to the application's login page (`/`). <br> 2. The `HUB_SESSION` cookie is cleared from the browser. |
| **AUTH-04** | **Session Persistence** | 1. Log in successfully. <br> 2. Close the browser tab. <br> 3. Open a new tab and navigate to the application URL. | The user remains logged in and is taken directly to the hub page. |
| **AUTH-05** | **Unauthorized API Access** | 1. Log out. <br> 2. Attempt to directly access the `/api/user/profile` endpoint using a tool like `curl` or by typing it in the browser bar. | The request fails with a `401 Unauthorized` status code. The user is not shown any profile data. |

### 4.2. API Proxy Security & Functionality

| Test Case ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **Verify No Secrets on Client** | 1. Open the application in the browser. <br> 2. Open developer tools and go to the "Sources" tab. <br> 3. Search across all loaded files (`Ctrl+Shift+F` or `Cmd+Shift+F`) for the values of your `GEMINI_API_KEY` and `MSAL_CLIENT_SECRET`. | The search must yield **zero results**. No secrets should be present in any client-side JavaScript file. |
| **PROXY-01** | **Gemini API Proxy - Chat Request** | 1. Log in and navigate to a workspace. <br> 2. Open the "Network" tab in developer tools. <br> 3. Send a chat message. <br> 4. Observe the network request made for the chat response. | 1. A `POST` request is made to `/api/gemini`. <br> 2. There are **no** direct network requests to any `googleapis.com` or other external AI service URLs. <br> 3. The chat response is received successfully from the proxy and displayed in the UI. |
| **PROXY-02** | **Graph API Proxy - SharePoint File Picker** | 1. Navigate to a workspace's "Knowledge" page. <br> 2. Open the "Network" tab. <br> 3. Click "Add from SharePoint". <br> 4. Observe the network requests as the picker loads SharePoint sites and files. | 1. All requests for SharePoint data are `GET` requests to `/api/graph?path=...`. <br> 2. There are **no** direct network requests to `graph.microsoft.com`. <br> 3. The SharePoint sites and files load and display correctly in the picker. |
| **PROXY-03** | **Gemini API Proxy - Knowledge Base Grounding** | 1. In a workspace, upload a knowledge file with specific, unique content (e.g., "The secret code is 'Xylophone'"). <br> 2. Start a new chat. <br> 3. Ask a question related to the file's content (e.g., "What is the secret code?"). | The AI's response correctly uses the information from the uploaded file (e.g., "The secret code is 'Xylophone'."). This verifies that the backend proxy is successfully fetching file content, injecting it into the prompt, and sending it to Gemini. |

### 4.3. Knowledge Base API Endpoints

| Test Case ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **KB-01** | **List Files** | 1. Navigate to a workspace's "Knowledge" page. <br> 2. Open the "Network" tab. | A `GET` request is made to `/api/knowledge/list?containerId=...`. The request succeeds, and the list of files is rendered correctly. If there are no files, the "No files uploaded yet" message appears. |
| **KB-02** | **Upload File** | 1. On the "Knowledge" page, use the "Browse files" button to select a valid file (e.g., a `.txt` or `.pdf`). <br> 2. Observe the "Network" tab. | A `POST` request is made to `/api/knowledge/upload`. The request succeeds with a `201 Created` status. The file list automatically refreshes and displays the newly uploaded file with correct metadata (name, size, date). |
| **KB-03** | **Delete File** | 1. On the "Knowledge" page with at least one file, click the delete (`×`) button next to a file. <br> 2. Confirm the deletion in the modal. <br> 3. Observe the "Network" tab. | A `POST` request is made to `/api/knowledge/delete`. The request succeeds with a `200 OK` status. The file is immediately removed from the list in the UI. |

### 4.4. Observability (Logging)

| Test Case ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **LOG-01** | **Local Logging Check** | 1. While the local API is running (`func start`), perform key actions: <br> - Log in/out. <br> - Send a chat message. <br> - Open the SharePoint picker. | The `func start` terminal should output structured log messages corresponding to each action (e.g., "User authentication successful," "Gemini request received," "Proxying request to Microsoft Graph"). |
| **LOG-02** | **Azure Logging Check** (Optional) | 1. In the Azure Portal, navigate to the deployed Static Web App and its associated Function App. <br> 2. Open the "Log stream" or query "Application Insights". <br> 3. Perform the same actions as in LOG-01 on the live site. | Logs for each action should appear in the chosen logging service in Azure, confirming that observability is functional in the deployed environment. This confirms the final deliverable of Phase 2. |

---
## 5. Conclusion

A successful execution of all test cases in this plan will confirm that the Phase 2 architectural migration is complete and successful. It will provide high confidence that the application is more secure, scalable, and ready for the new features planned in Phase 3. Any failures should be documented and addressed before proceeding.
