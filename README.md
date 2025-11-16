# Remodeling Live - Standalone AI Design Consultant

This project is a standalone web application featuring the **Remodeling Live** widget, architected for a seamless handoff and migration to a production backend.

**For a high-level project overview, architectural guide, and instructions on testing key user flows, please see `HANDOFF_TO_BOLT.md`.**

---

## Developer's Guide: Protecting Core Configuration

To ensure the long-term stability and reliability of this application, all critical, non-negotiable settings have been centralized into a single configuration file.

**Single Source of Truth:** `src/config/remodelingLiveConfig.ts`

This file contains the "secret sauce" of the application, including AI models, system instructions, and prompt templates.

**Development Mandate:** Any developer or AI assistant working on this project **MUST NOT** hardcode these values within the application logic. All core settings **MUST** be imported directly from `src/config/remodelingLiveConfig.ts`.

---

## Feature Deep-Dive: AI Water Damage Restoration Studio

This documentation outlines the specific multi-step AI architecture for the "Water Damage Restoration" persona. This feature is designed to provide architecturally consistent visual results by orchestrating a sequence of targeted calls to different Gemini models. This document serves as the technical source of truth to prevent future regressions.

### Core Architecture: The "Three-Phase Precision" Prompting Model

The success of this feature relies on a specific, three-phase sequence of AI calls. Each phase builds upon the last, creating a structured "source of truth" (a JSON report) that governs all subsequent visual generation steps, ensuring consistency.

---

### Phase 1: Damage Analysis & Architectural Lock-In

**Purpose:** To analyze the initial user-uploaded image, identify all structural elements that must be preserved, and assess the damage. The output of this phase is a structured JSON object that governs all subsequent steps.

*   **Model:** `gemini-2.5-pro`
*   **API Call Configuration:**
    *   `responseMimeType`: `"application/json"`
*   **Exact Prompt:**

```
You are an expert in water damage assessment for property insurance claims. Analyze the provided image of a water-damaged room. Your task is to identify key architectural features that MUST be preserved during restoration, assess the visible damage, list items that need to be removed, and provide a note about what elements can likely be preserved. Respond ONLY with a valid JSON object matching this schema:
{
  "architectural_features": { "room_dimensions": "e.g., approx. 12x15 ft", "walls": ["e.g., drywall, one window on the left"], "windows": ["e.g., one large casement window"], "doors": ["e.g., one wooden door on the right"], "ceiling": "e.g., flat, popcorn texture", "floor": "e.g., hardwood" },
  "damage_assessment": { "standing_water": { "present": boolean, "locations": ["e.g., center of the room"] }, "water_stains": ["e.g., dark stains on the lower 2ft of drywall"], "mold": { "present": boolean, "locations": ["e.g., along the baseboard on the left wall"] } },
  "items_to_remove": ["e.g., soaked rug", "damaged armchair"],
  "preservation_notes": "A brief summary of what can be saved, e.g., The main window and door frames appear structurally sound and may only need cosmetic repairs."
}
```

---

### Phase 2: The "Blank Slate" Cleanup Visualization

**Purpose:** To create a photorealistic "after" image of the room completely stripped down to a contractor-ready state. This is the most critical step for ensuring a clean final result. It uses the original image as input and the JSON from Phase 1 as crucial context.

*   **Model:** `gemini-2.5-flash-image`
*   **API Call Configuration:**
    *   `responseModalities`: `[Modality.IMAGE]`
*   **Exact Meta-Prompt Template:**

```
ROLE: You are an expert photo editor for a top-tier disaster restoration company.

TASK: The user has provided an image of a water-damaged room and a damage analysis report. Your task is to create a photorealistic "after" image showing the room completely cleaned, dried, and stripped to its structural elements, ready for a remodeling contractor to begin work.

CONTEXT FROM ANALYSIS:
- Architectural Features to Preserve: The walls, windows, doors, ceiling structure, and floor layout MUST be preserved exactly as described: ${JSON.stringify(report.architectural_features)}
- Items to Remove: ${report.items_to_remove.join(', ')}

STRICT RULES - YOU MUST FOLLOW THESE:
1.  **Preserve Architecture:** The final image's camera angle, perspective, lighting direction, and all architectural elements listed in the context MUST remain identical to the original photo.
2.  **Complete Debris Removal:** Remove all items listed for removal, plus any other furniture, decor, and debris. The room must be completely empty.
3.  **Surface Stripping:**
    - Remove all flooring material down to the subfloor (e.g., show clean plywood or concrete).
    - Remove all water stains, damage, and mold from the walls and ceiling.
    - Visualize the walls as clean, unpainted drywall or plaster, ready for primer.
4.  **DO NOT ADD NEW ELEMENTS:** Do not add any new paint, flooring, furniture, or decor. The room must look clean but entirely unfinished.
5.  **Realism is Critical:** The final image must be a high-quality, photorealistic photograph.

OUTPUT: Return ONLY the photorealistic image of the cleaned, stripped, and empty room.
```

---

### Phase 3: The "Total Remodel" Visualization

**Purpose:** To take the "blank slate" image from Phase 2 and apply a new, fully furnished interior design style selected by the user. This phase also uses the architectural data from the Phase 1 report to maintain structural integrity.

*   **Model:** `gemini-2.5-flash-image`
*   **API Call Configuration:**
    *   `responseModalities`: `[Modality.IMAGE]`
*   **Exact Meta-Prompt Template:**

```
ROLE: You are an expert AI interior designer and architectural visualizer.

TASK: The user has provided a clean, empty room and wants you to perform a complete virtual remodel in a specific style.

BASE IMAGE CONTEXT:
- You are starting with an image of a clean, empty room (the "blank slate" from Phase 2).
- The following architectural elements MUST be preserved in their exact size and location:
  - Walls: ${JSON.stringify(report.architectural_features.walls)}
  - Windows: ${JSON.stringify(report.architectural_features.windows)}
  - Doors: ${JSON.stringify(report.architectural_features.doors)}
  - Ceiling: ${report.architectural_features.ceiling}
  - Floor Layout: Preserved.

REQUESTED STYLE: "${user_selected_style_prompt}"

STRICT RULES - YOU MUST FOLLOW THESE:
1.  **Total Replacement:** You MUST completely replace all surfaces. This includes adding new flooring material, new wall paint or texture, and new ceiling texture if appropriate. NO original surfaces from the base image should be visible.
2.  **Preserve Architecture ONLY:** Adhere strictly to the architectural elements listed in the context. The room's structure, layout, and perspective must not change.
3.  **Furnish from Scratch:** Add all new furniture, lighting fixtures, decor, and accessories that are appropriate for the "REQUESTED STYLE". The room should look fully furnished and professionally designed.
4.  **Photorealism is Paramount:** The final image must be a high-quality, photorealistic photograph. Lighting and shadows must be consistent with the room's light sources (e.g., windows).

OUTPUT: Return ONLY the photorealistic image of the fully remodeled and furnished room.
```

---

## Bolt.new Migration Checklist

This checklist documents exactly what Bolt.new needs to implement for the production environment. The application is architected so that components will not require code changes; they will consume the real service implementations provided by Bolt.new.

### ✅ From Google AI Studio (Already Done)
- [X] Context Engineering architecture
- [X] Component library (Atoms, Molecules, Organisms)
- [X] Service interface definitions (`src/services/*/*Service.ts`)
- [X] TypeScript type system
- [X] Pure calculation functions (credit estimation, etc.)
- [X] UI/UX design patterns
- [X] Component composition patterns with dependency injection

---

### 🔧 For Bolt.new to Implement

#### Authentication & Authorization
- [ ] User registration and login
- [ ] Session management
- [ ] Protected route middleware
- [ ] OAuth providers (Google, GitHub)
- [ ] Email verification
- [ ] Password reset flow

#### Database & Backend
- [ ] Database schema (Supabase/Postgres)
- [ ] API route handlers for all service methods
- [ ] Database migrations
- [ ] Connection pooling & query optimization

#### Payment Integration
- [ ] Stripe (or chosen processor) setup
- [ ] Checkout flow UI and logic
- [ ] Webhook handler for successful payments
- [ ] Invoice generation
- [ ] Subscription management
- [ ] Credit purchase endpoints

#### Google Workspace Integration
- [ ] Implement `GoogleWorkspaceService` (`src/services/google/GoogleWorkspaceService.ts`)
- [ ] Set up Google Cloud project with OAuth 2.0 credentials.
- [ ] Handle server-side OAuth 2.0 flow for user authorization.
- [ ] Securely store and manage user refresh tokens.
- [ ] Implement Google Calendar API calls using authorized credentials.

#### Credit System Implementation
- [ ] Implement `CreditService` interface (`src/services/credit/CreditService.ts`)
- [ ] Connect to real database for `getCurrentBalance`, `deductCredits`, etc.
- [ ] Implement real-time balance updates (WebSocket/SSE)
- [ ] Implement robust transaction logging
- [ ] Implement usage tracking and audit trails

#### Voice Service Implementation
- [ ] Implement `VoiceService` interface (`src/services/voice/VoiceService.ts`)
- [ ] Handle Gemini Live Voice API integration with secure API key management
- [ ] Set up audio streaming infrastructure
- [ ] Implement server-side transcription processing and error handling
- [ ] Implement rate limiting

#### Memory Service Implementation
- [ ] Implement `MemoryService` interface (`src/services/memory/MemoryService.ts`)
- [ ] Implement session persistence in the database
- [ ] Store conversation history archives
- [ ] Store user preferences and custom agent configurations
- [ ] Implement caching strategies

#### Agent Service Implementation
- [ ] Implement `AgentService` interface (`src/services/agent/AgentService.ts`)
- [ ] Store and retrieve agent configurations from the database
- [ ] Handle knowledge base creation and storage securely

#### Widget Embed System
- [ ] Build widget hosting infrastructure
- [ ] Implement embed code generation logic
- [ ] Handle cross-origin communication (CORS)
- [ ] Implement widget authentication (e.g., using customer ID)
- [ ] Track usage per widget instance

#### Infrastructure
- [ ] Set up deployment (Vercel/Railway/Render)
- [ ] Configure environment variables securely
- [ ] Establish CI/CD pipeline
- [ ] Integrate monitoring and logging (Sentry, LogRocket)
- [ ] Perform performance optimization and security hardening

---

### 📝 Integration Notes

**Service Injection Pattern:**
All components expect services to be provided via a React Context. Bolt.new's primary task is to replace the mock service implementations with real, production-ready ones.

*Example:*
```typescript
// In the root of the application:
const services: ServiceContainer = {
  creditService: new ProductionCreditService(),             // Bolt.new implements
  voiceService: new ProductionVoiceService(),               // Bolt.new implements
  memoryService: new ProductionMemoryService(),             // Bolt.new implements
  agentService: new ProductionAgentService(),               // Bolt.new implements
  googleWorkspaceService: new ProductionGoogleService(),    // Bolt.new implements
};
```

**No Code Changes Needed in Components:**
Components are already designed to work with any implementation that matches the service interfaces. This ensures a clean handoff and a clear separation between the frontend presentation layer and the backend implementation.