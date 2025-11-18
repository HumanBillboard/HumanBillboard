# HumanBillboard — Minimal UML Class Diagrams (Plan A)

This file provides a concise, high-impact set of UML-style diagrams (Mermaid) to maximize rubric points: clear classes with attributes, methods, multiplicities, and one short sequence for a common flow.

Notes:
- Focus: domain model, server/auth layer, one key UI component.
- Diagrams map back to code files (file: path) so you can verify implementations quickly.
---

## 1) Domain Model — Classes & Associations

```mermaid
classDiagram
    class UserProfile {
      +id: string
      +email: string
      +full_name: string
      +user_type: string
      +company_name: string
      +created_at: Date
      +getProfile(id: string): Promise<UserProfile | null>
    }

    class Campaign {
      +id: UUID
      +business_id: string
      +title: string
      +description: string
      +compensation_amount: Decimal
      +compensation_type: string
      +location: string
      +duration_hours: int?
      +status: string
      +created_at: Date
      +create(businessId: string, data): Promise<Campaign>
      +update(id: UUID, data): Promise<boolean>
    }

    class Application {
      +id: UUID
      +campaign_id: UUID
      +advertiser_id: string
      +status: string
      +message: string?
      +created_at: Date
      +submit(campaignId: UUID, advertiserId: string, message?): Promise<Application>
    }

  %% Associations with multiplicity (directional per requested plan)
  Campaign "*" --> "1" UserProfile : createdBy
  Application "*" --> "1" Campaign : appliesTo
  UserProfile "1" --> "*" Application : submits
```

Mapping to code:
- `user_profiles` table / `lib/auth.ts` → UserProfile
- `campaigns` table / `components/campaign-form.tsx` → Campaign
- `applications` table / `components/application-form.tsx` → Application

---

## 2) Server & Auth Layer — key classes / functions

```mermaid
classDiagram
    class LibAuth {
      file: `lib/auth.ts`
      +auth(): Promise<UserData>
      +getUserProfile(): Promise<UserProfile | null>
    }

    class SupabaseServer {
      file: `lib/supabase/server.ts`
      +createClient(): SupabaseClient
      +query(sql): Promise<any>
    }

    class Middleware {
      file: `middleware.ts`
      +clerkMiddleware(cb)
      +protectRoute(req): void
    }

    LibAuth --> SupabaseServer : uses
    Middleware --> LibAuth : enforces
```

Notes:
- `createClient()` is a server helper that uses `next/headers` (server-only). Represented as `SupabaseServer.createClient()`.

---

## 3) Key UI Component as Class (Props & Methods)

```mermaid
classDiagram
    class CampaignForm {
      file: `components/campaign-form.tsx`
      +props: CampaignFormProps
      +handleSubmit(formData): Promise<void>
      +validate(data): Campaign
    }

    class ApplicationForm {
      file: `components/application-form.tsx`
      +props: ApplicationFormProps
      +handleSubmit(message?): Promise<void>
    }

    CampaignForm --> Campaign : creates/updates
    ApplicationForm --> Application : creates
```

UI notes:
- Indicate client vs server: the components above are client components (use `use client`). Server actions (e.g., `app/actions/check-campaign-limit.ts`) are represented in the server diagram.

```mermaid
classDiagram
    %% Explicit props interfaces for UI components
    class CampaignFormProps {
      +userId: UUID
      +campaign?: Campaign
      +onSuccess?: (campaign: Campaign) => void
      +onCancel?: () => void
    }

    class ApplicationFormProps {
      +campaignId: UUID
      +advertiserId?: UUID
      +onSuccess?: (application: Application) => void
    }
```