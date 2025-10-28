# HumanBillboard — Class Diagrams

This document contains high-level class/architecture diagrams (UML-style) represented with Mermaid so they render in Markdown viewers that support Mermaid.

Notes:
- Diagrams model modules and relationships (composition, uses, inheritance) rather than concrete TypeScript classes (the codebase is mostly functional React components). They aim to help reason about responsibilities and dependencies.
- File and route references use repository paths (e.g., `app/page.tsx`) so you can quickly jump to implementation.

## How to read these diagrams
- Boxes represent modules or conceptual classes.
- Arrows show relationships:
  - --> : uses / depends on
  - --|> : inheritance / specialization
  - <|-- : implementation / concrete component

---

## 1) High-level Architecture

```mermaid
classDiagram
    class WebApp {
        +pages
        +components
        +lib
        +hooks
        +public
    }

    class Pages
    class Components
    class Lib
    class Hooks
    class Public

    WebApp --> Pages : contains
    WebApp --> Components : contains
    WebApp --> Lib : contains
    WebApp --> Hooks : contains
    WebApp --> Public : assets

    Pages --> Components : uses
    Components --> Lib : depends on
    Components --> Hooks : uses
    Pages --> Lib : uses (auth/data)
```

This diagram shows the top-level separation: pages (routes), reusable components, library code (auth/utils/supabase), hooks, and public assets.

---

## 2) Pages & Routing (selected)

```mermaid
classDiagram
    class HomePage {
        file: `app/page.tsx`
        +render()
    }
    class Auth_Login {
        file: `app/auth/login/[[...rest]]/page.tsx`
    }
    class Auth_Signup {
        file: `app/auth/signup/[[...rest]]/page.tsx`
    }
    class Auth_Logout {
        file: `app/auth/logout/route.ts`
    }
    class Advertiser_Campaigns {
        file: `app/advertiser/campaigns/page.tsx`
    }
    class Business_Dashboard {
        file: `app/business/dashboard/page.tsx`
    }

    HomePage --> Auth_Login : link to
    HomePage --> Auth_Signup : link to
    Auth_Login --> LibAuth : uses
    Auth_Signup --> LibAuth : uses
    Advertiser_Campaigns --> Components : uses (campaign list)
    Business_Dashboard --> Components : uses
```

This diagram highlights a few route entry points and their dependencies on shared components and auth.

---

## 3) Data & Auth Layer

```mermaid
classDiagram
    class LibAuth {
        file: `lib/auth.ts`
        +getSession()
        +requireUser()
    }

    class SupabaseClient {
        file: `lib/supabase/client.ts`
        +query()
        +auth
    }

    class SupabaseServer {
        file: `lib/supabase/server.ts`
        +serverSideHelpers()
    }

    class Middleware {
        file: `lib/supabase/middleware.ts`
        +validateRequest()
    }

    LibAuth --> SupabaseClient : uses
    SupabaseServer --> SupabaseClient : wraps
    Pages --> LibAuth : calls
    Middleware --> LibAuth : validates
```

This shows the supabase-backed auth/data surface: `lib/auth.ts` uses `lib/supabase/client.ts`, and server helpers live in `lib/supabase/server.ts`.

---

## 4) UI Component Hierarchy (representative)

```mermaid
classDiagram
    class UIComponent {
        +props
        +render()
    }

    class Button {
        file: `components/ui/button.tsx`
        +onClick()
        +variant
    }
    class Card {
        file: `components/ui/card.tsx`
    }
    class Input {
        file: `components/ui/input.tsx`
    }
    class Modal {
        file: `components/ui/dialog.tsx`
    }
    class Toast {
        file: `components/ui/toast.tsx`
    }

    UIComponent <|-- Button
    UIComponent <|-- Card
    UIComponent <|-- Input
    UIComponent <|-- Modal
    UIComponent <|-- Toast

    Components --> UIComponent : composes
    Pages --> Button : uses
    Pages --> Card : uses
```

The actual project has many small UI components (see `components/ui/*`). This diagram groups them conceptually as specializations of a generic UI component.

---

## 5) Feature-level interactions (campaigns & applications)

```mermaid
classDiagram
    class CampaignService {
        file: `lib/utils.ts` (or business services)
        +listCampaigns()
        +getCampaign(id)
    }
    class CampaignPage {
        file: `app/advertiser/campaigns/[id]/apply/page.tsx`
        +apply()
    }
    class ApplicationForm {
        file: `components/application-form.tsx`
        +submit()
    }
    class ApplicationActions {
        file: `components/application-actions.tsx`
        +accept()
        +reject()
    }

    CampaignPage --> CampaignService : uses
    CampaignPage --> ApplicationForm : renders
    ApplicationForm --> LibAuth : needs user
    ApplicationActions --> SupabaseClient : updates data
```

This outlines how campaign pages, the application form, and application action controls interact with services and auth.

---

## Tips & next steps
- The diagrams are intentionally high-level. If you want class diagrams at the code level (methods, exact props, types), I can generate per-file diagrams for a selected subset (for example: `components/application-form.tsx`, `lib/auth.ts`) with extracted props and function signatures.
- You can render Mermaid in many Markdown previewers (VS Code Mermaid preview extension, GitHub's mermaid support in some contexts, etc.).

---

## Files referenced (quick jump list)
- `app/page.tsx` — Home page
- `app/auth/*` — Login/Signup/Onboarding/Logout
- `app/advertiser/*` — Advertiser campaign routes
- `app/business/*` — Business routes
- `components/*` — Page-specific components
- `components/ui/*` — Reusable UI atoms and molecules
- `lib/auth.ts`, `lib/supabase/*` — Auth and data layer

---

Generated on: 2025-10-28
