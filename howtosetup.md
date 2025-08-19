# Local Development Setup Guide

This guide will walk you through setting up and running the "Hub Nice State" application on your local machine. The application consists of two main parts that need to run simultaneously: a **frontend** (Vite development server) and a **backend** (Azure Functions server).

---

## 1. Prerequisites

Before you begin, ensure you have the following software installed:

-   **Node.js**: Version `20.0.0` or higher. You can download it from [nodejs.org](https://nodejs.org/).
-   **npm**: This is included with Node.js.
-   **Azure Functions Core Tools**: This is required to run the backend server locally. Install it globally using npm:
    ```bash
    npm install -g azure-functions-core-tools@4 --unsafe-perm true
    ```
    For more detailed instructions, refer to the [official Microsoft documentation](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local).

---

## 2. Installation

Clone the repository and install the dependencies for both the frontend and backend.

1.  **Install Frontend Dependencies** (from the project root directory):
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies** (navigate into the `api` directory):
    ```bash
    cd api
    npm install
    ```

---

## 3. Environment Configuration

This application uses a secure Backend for Frontend (BFF) architecture. This means **all secrets and API keys are managed by the backend**. There is no `.env` or `.env.local` file for the frontend.

The backend's environment variables are managed in the `api/local.settings.json` file.

### 3.1. Azure App Registration Configuration

Before filling out the settings file, you must register an application in Microsoft Entra ID (formerly Azure Active Directory). This is the most critical step for authentication to work correctly.

1.  Navigate to the [Azure Portal](https://portal.azure.com/), go to **Microsoft Entra ID**, then select **App registrations**.
2.  Click **New registration**.
3.  Give your application a name (e.g., "Hub Local Dev").
4.  Under "Supported account types," choose the option that fits your needs (e.g., "Accounts in this organizational directory only").
5.  Under "Redirect URI", select **Web** from the dropdown menu. This is essential for the server-side authentication flow.
6.  In the text box, enter the following URL: `http://localhost:5173/api/auth/callback`.
    -   *Why this URL?* The browser sends the user back to the frontend's address. Our Vite proxy will intercept the `/api/auth/callback` path and forward it to the backend function on port `7071`.
7.  Click **Register**.
8.  From the app registration's "Overview" page, copy the **Application (client) ID** and the **Directory (tenant) ID**.
9.  Navigate to the **Certificates & secrets** tab. Click **New client secret**, give it a description, and set an expiration.
10. **Immediately** copy the **Value** of the new client secret. You will not be able to see it again after you leave this page.

### 3.2. Update local.settings.json

Now, use the values you just created to update the `api/local.settings.json` file.

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    "APP_URI": "http://localhost:5173",
    "MSAL_CLIENT_ID": "Paste your Application (client) ID here",
    "MSAL_TENANT_ID": "Paste your Directory (tenant) ID here",
    "MSAL_CLIENT_SECRET": "Paste your Client Secret Value here",
    "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY",
    "SESSION_SECRET": "REPLACE_THIS_WITH_A_LONG_RANDOM_32_CHAR_STRING",
    "DEFAULT_LOG_LEVEL": "Information"
  }
}
```

-   `GEMINI_API_KEY`: Your API key for the Google Gemini API.
-   `SESSION_SECRET`: A long, random string of at least 32 characters that you create yourself. This is used to encrypt user session cookies.

---

## 4. Running the Application

To run the application, you need to start both the backend and frontend servers in **two separate terminal windows**.

### Terminal 1: Start the Backend (API)

1.  Navigate to the `api` directory:
    ```bash
    cd api
    ```
2.  Start the Azure Functions server:
    ```bash
    npm run start
    ```
    You should see output indicating that the Functions host has started and is listening for requests, typically on port `7071`.

### Terminal 2: Start the Frontend (Vite)

1.  Navigate to the project's **root** directory (if you are in the `api` directory, go back one level with `cd ..`).
2.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    This will start the frontend server, typically on port `5173`. It is configured to automatically proxy any requests to `/api` over to your backend server running on port `7071`.

### Accessing the App

Once both servers are running, open your browser and navigate to:

**[http://localhost:5173](http://localhost:5173)**

You should now see the application's login page, and it will be able to communicate with your local backend API without any errors.