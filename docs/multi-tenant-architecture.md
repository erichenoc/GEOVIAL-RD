# GEOVIAL-RD: Multi-Tenant Architecture Decision

## Multi-Tenancy Approach Evaluation

### Option 1: Separate Database Per Tenant
**How it works**: Each municipality gets its own Supabase project (separate PostgreSQL instance).

| Pros | Cons |
|------|------|
| Maximum data isolation | Supabase charges per project ($25/mo each) |
| Independent backups/restores | 50 municipalities = $1,250/mo in DB costs alone |
| No risk of cross-tenant leaks | Impossible to run cross-tenant analytics |
| Independent scaling | Connection management nightmare |
| | Code deploys must update all projects |
| | User management across projects is painful |

**Verdict**: Overkill for this use case. Only justified for regulated industries (healthcare, banking) where legal isolation is required.

### Option 2: Shared DB, Separate Schemas
**How it works**: One Supabase project, one PostgreSQL database, but each municipality gets its own schema (namespace).

| Pros | Cons |
|------|------|
| Good logical separation | Supabase RLS does NOT work across schemas |
| Schema-level permissions | Supabase Auth assumes `public` schema |
| Familiar SQL pattern | Supabase Dashboard only shows `public` schema |
| | Migrations must run N times (once per schema) |
| | Supabase client SDK does not support schema switching |
| | Storage policies tied to `public` schema |

**Verdict**: Architecturally sound on raw PostgreSQL, but **fights against Supabase at every turn**. Supabase is designed around the `public` schema. Using separate schemas breaks Auth, Storage, RLS, Dashboard, and the client SDK.

### Option 3: Shared DB with RLS (Row Level Security) -- RECOMMENDED
**How it works**: One database, one schema, all tenants share the same tables. Every table has an `organization_id` column. RLS policies on every table ensure users can only see rows belonging to their organization.

| Pros | Cons |
|------|------|
| Native Supabase pattern | Must be disciplined about RLS on every table |
| Single deployment/migration | Theoretical risk of policy misconfiguration |
| $25/mo total (not per tenant) | Large tables need proper indexing |
| Cross-tenant analytics possible | Requires careful testing of policies |
| Auth + Storage + RLS integrated | |
| Supabase Dashboard works natively | |
| Client SDK works out of the box | |
| Scales to thousands of tenants | |

**Verdict**: This is the correct choice for GEOVIAL-RD on Supabase. It is the platform's intended multi-tenancy pattern.

## How RLS-Based Multi-Tenancy Works

### The Core Mechanism

1. User signs up / is invited to an organization
2. Their `organization_id` is stored in `auth.users.raw_app_meta_data`
3. On every authenticated request, Supabase JWT contains this metadata
4. RLS policies extract `organization_id` from the JWT
5. Every SELECT/INSERT/UPDATE/DELETE is filtered by `organization_id`

```
User Request --> Supabase Auth (JWT with org_id) --> RLS Policy Check --> Data Access
```

### JWT Custom Claims

Supabase allows storing custom data in the JWT via `raw_app_meta_data`:

```json
{
  "sub": "user-uuid",
  "app_metadata": {
    "organization_id": "org-uuid",
    "role": "inspector"
  }
}
```

RLS policies read this via:
```sql
(auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
```

### Super-Admin Bypass

The SaaS owner (super-admin) needs to see all tenants. This is handled by:
1. A `role` field in `app_metadata` set to `super_admin`
2. RLS policies that check: "Is this user a super_admin? If yes, allow all rows. If no, filter by organization_id."

### Performance Considerations

- Every tenant-scoped table has a **composite index** on `(organization_id, ...)` for the most common query patterns
- `organization_id` is always the **first column** in composite indexes (PostgreSQL uses leftmost prefix)
- For tables with millions of rows, partitioning by `organization_id` can be added later without schema changes
- Supabase connection pooling (via Supavisor) handles concurrent connections from multiple tenants

## Data Model Overview

```
organizations (ayuntamientos)
  |
  |-- users (inspectors, supervisors, gerentes, admins)
  |-- zones
  |     |-- sectors
  |-- brigades
  |     |-- brigade_members (users assigned to brigades)
  |-- reports (damage reports)
  |     |-- report_photos (before/after images)
  |     |-- report_comments
  |     |-- status_history (audit trail)
  |
damage_types (shared catalog, no org_id)
damage_severities (shared catalog, no org_id)
```

### Key Design Decisions

1. **Catalogs are global**: `damage_types` and `damage_severities` are shared across all organizations. They have no `organization_id`. RLS allows all authenticated users to read them.

2. **Photos use Supabase Storage**: `report_photos` stores the storage path. Actual files live in Supabase Storage with bucket-level RLS policies.

3. **Status history is append-only**: No UPDATE or DELETE allowed. This creates a tamper-proof audit trail.

4. **Soft deletes on critical entities**: Organizations and users use `deleted_at` instead of hard deletes.

5. **GPS coordinates use PostGIS-compatible columns**: `latitude` and `longitude` as `DOUBLE PRECISION` for compatibility. If spatial queries are needed later, PostGIS extension can be enabled.
