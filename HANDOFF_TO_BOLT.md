# **Project Handoff: Welcome to Remodeling Live!**

Hello Bolt.new Team,

Congratulations on receiving the Remodeling Live project! We're incredibly excited to see you take this AI-powered widget from a fully-functional prototype to a production-grade application.

This document serves as your starting guide. It provides a high-level overview of the architecture and points you to the most important parts of the codebase to ensure a smooth and rapid transition.

---

## **High-Level Architectural Overview**

The application is built on a **Service-Oriented Architecture** designed specifically for this handoff. The core principle is a clean separation between the UI (React components) and the "backend" (service implementations).

*   **How it Works:** All UI components are "dumb." They do not contain any direct backend logic or API calls. Instead, they request data and actions from abstract service interfaces (e.g., `VoiceService`, `AgentService`).
*   **Dependency Injection:** These services are provided to the entire application using a React Context (`ServiceProvider`).
*   **Your Primary Task:** Your main job is to replace our **mock service implementations** (e.g., `MockVoiceServiceImpl`) with your production implementations that call your real backend APIs. Because the UI is coded against the interfaces, **no UI code changes will be required.**

This architecture is designed to give you maximum velocity. You can focus entirely on building the robust backend infrastructure while the frontend remains stable.

---

## **Key "Golden Path" User Flows**

This is a quick guide to help your developers and QA team test the main features and understand the application's capabilities.

*   **Testing the Sales Agent:**
    1.  Click the "Settings" button inside the widget.
    2.  Go to the **App Type** tab and select "Live Sales Agent".
    3.  Go to the **Agent Persona** tab and choose a sales style from the dropdown.
    4.  Close settings and click "Start Sales Call" to begin a session with that persona.

*   **Testing the Remodeling Consultant (Visual):**
    1.  In **Settings > App Type**, select "Remodeling Design Consultant".
    2.  Start a session. Use the green "Capture Image" button or yellow "Upload Image" button.
    3.  After an image is uploaded, a "Design Studio" panel will appear on the right.
    4.  You can now ask the agent for designs (e.g., "Show me a modern farmhouse look") or click the preset style buttons.

*   **Testing the Knowledge Base Agent:**
    1.  In **Settings > App Type**, select "Live Voice Agent".
    2.  Go to the **Knowledge Base** tab.
    3.  Use one of the methods (URL, Business Name, or File Upload) to generate a KB.
    4.  Once generated, start a session and ask the agent questions based on the KB content.

---

## **The "Brains" of the Operation: Core Files to Understand**

To save you time hunting through the codebase, here are the three most critical files that control the application's logic and state:

1.  **`src/contexts/WidgetContext.tsx`**
    *   This is the state management heart of the entire application. It contains all the UI state, settings, and core action functions (like `startLiveConsultation`, `endLiveConsultation`, etc.). Understanding this file is key to understanding the app's behavior.

2.  **`src/config/remodelingLiveConfig.ts`**
    *   This is the "Single Source of Truth" for all agent personas, system instructions, AI model names, and complex prompt templates. If you need to tweak an agent's core behavior, this is the place to do it.

3.  **`src/lib/contexts/ServiceContext.tsx`**
    *   This is the dependency injection point where our mock services are currently wired up. This is where you will swap in your production service implementations.

---

## **Migration Checklist Confirmation**

The main `README.md` file contains a detailed "Bolt.new Migration Checklist". We confirm that the current state of this prototype application successfully fulfills all items listed in the "From Google AI Studio" section. The scaffolding is complete and ready for your backend implementation.

We wish you the best of luck and look forward to seeing Remodeling Live in production!
