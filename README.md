# Hub Nice State: The Workspace-Based AI Portal

## Overview

Hub Nice State is a sophisticated, workspace-based AI portal designed for organizations to create, manage, and deploy specialized AI assistants. The platform allows administrators to build isolated "workspaces," each tailored to a specific department, product, or function (e.g., Data Security, Sales, HR).

The application is architected as a modern Static Web App, featuring a fast, dynamic frontend built with TypeScript and a secure, serverless backend that handles authentication and all communication with external AI and Microsoft Graph services. This **Backend for Frontend (BFF)** pattern ensures that no secrets or sensitive tokens are ever exposed to the browser, providing enterprise-grade security.

## Key Features

- **Workspace-Based Architecture**: Create isolated workspaces for different teams or purposes. Each workspace has its own unique configuration.
- **Deep Customization**:
    - **Branding & Appearance**: Customize everything from login page text and logos to the specific colors of the chat interface for each workspace.
    - **Knowledge Base**: Upload files (PDFs, text, images) to provide each workspace's AI with a unique, private knowledge base for grounded, accurate responses.
    - **SharePoint Integration**: Securely connect to SharePoint to add files to the knowledge base or attach them directly to chats.
    - **Personas & Quick Questions**: Define the AI's personality and pre-populate the chat with relevant, context-aware starter questions.
- **Multi-Model Support**: Manage a central repository of AI models from various providers (e.g., Google Gemini, Groq). Administrators can assign specific models to each workspace.
- **AI-Powered Configuration**: The application uses AI to assist administrators in setting up new workspaces by suggesting descriptions, personas, quick questions, and even custom functions based on a simple name and type.
