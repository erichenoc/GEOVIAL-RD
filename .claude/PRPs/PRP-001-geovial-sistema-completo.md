# PRP-001: GEOVIAL-RD - Sistema de Gestion Vial Multi-Tenant

> **Estado**: PENDIENTE APROBACION
> **Fecha**: 2026-03-08
> **Proyecto**: GEOVIAL-RD
> **Alcance**: Republica Dominicana (MVP) → Expansion LATAM

---

## Objetivo

Construir una plataforma SaaS multi-tenant de gestion vial donde ayuntamientos/municipalidades puedan reportar, asignar y dar seguimiento a danos en infraestructura vial. Cada municipalidad opera de forma aislada con sus propios datos, usuarios y brigadas.

## Por Que

| Problema | Solucion |
|----------|----------|
| Reportes de baches por telefono/papel, se pierden | App movil con foto + GPS automatico |
| Sin trazabilidad de trabajos asignados | Flujo de estatus con historial inmutable |
| Gerencia sin visibilidad de operaciones | Dashboard en tiempo real con KPIs |
| Cada municipio necesita su propio sistema | Multi-tenant SaaS: una plataforma, N clientes |
| No hay evidencia de trabajos completados | Fotos antes/despues como evidencia |

**Valor de negocio**: Modelo SaaS recurrente vendido a 158+ municipios en RD, expandible a toda LATAM (16,000+ municipios potenciales).

## Vision de Alcance

- **Fase 1 (MVP)**: Republica Dominicana - Division territorial oficial (158 municipios, 12,813 barrios)
- **Fase 2**: Expansion LATAM - Arquitectura preparada para cargar division territorial de cualquier pais
- **Fase 3**: Portal ciudadano - Los ciudadanos reportan directamente

**Decisiones de internacionalizacion ya tomadas:**
- Tablas territoriales genericas (`territorial_regions`, `territorial_provinces`, etc.) no acopladas a RD
- Campo `country_code` se agregara a `organizations` para soporte multi-pais
- UI en espanol (idioma comun LATAM), i18n preparado pero no implementado en MVP
- Moneda configurable por organizacion (futuro)

---

## Perfiles de Usuario

### 1. Inspector de Campo
- **Dispositivo**: Telefono movil (Android/iOS)
- **Accion principal**: Reportar danos viales
- **Flujo**: Abre app → Toma foto → GPS auto → Elige tipo de dano + sector → Comenta → Envia
- **Necesita**: PWA instalable, carga rapida, funciona con 3G

### 2. Supervisor de Brigada de Operaciones
- **Dispositivo**: Tablet/Desktop
- **Accion principal**: Gestionar reportes y asignar brigadas
- **Flujo**: Ve reportes nuevos → Evalua prioridad → Asigna brigada → Monitorea progreso → Marca completado
- **Necesita**: Vista de mapa, filtros avanzados, cambio de estatus rapido

### 3. Gerente / Reporteria
- **Dispositivo**: Desktop
- **Accion principal**: Ver dashboards y generar reportes
- **Flujo**: Ve KPIs generales → Filtra por zona/periodo → Exporta PDF/Excel para reuniones
- **Necesita**: Graficos, metricas, exportacion

### 4. Admin de Organizacion
- **Dispositivo**: Desktop
- **Accion principal**: Configurar su ayuntamiento
- **Flujo**: Invita usuarios → Crea brigadas → Configura zonas → Gestiona roles

### 5. Super Admin (Dueno del SaaS)
- **Dispositivo**: Desktop
- **Accion principal**: Gestionar plataforma completa
- **Flujo**: Onboarda municipios → Monitorea uso → Gestiona suscripciones

---

## Criterios de Exito

- [ ] Inspector puede crear reporte con foto + GPS en menos de 30 segundos
- [ ] Supervisor ve reporte nuevo en menos de 5 segundos (realtime)
- [ ] Datos de un ayuntamiento son 100% invisibles para otro (RLS)
- [ ] Dashboard carga en menos de 2 segundos
- [ ] App funciona como PWA en telefono sin app store
- [ ] Exportacion PDF/Excel funcional para gerencia
- [ ] Mapa interactivo con pines por reporte
- [ ] Fotos antes/despues como evidencia de trabajo
- [ ] Historial inmutable de cada cambio de estatus

---

## Stack Tecnologico (Golden Path)

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| Framework | Next.js 16 + React 19 + TypeScript | Full-stack, SSR, App Router |
| Estilos | Tailwind CSS 3.4 + shadcn/ui | Utility-first, componentes accesibles |
| Backend | Supabase (Auth + DB + Storage + Realtime) | PostgreSQL + RLS = multi-tenant nativo |
| Estado | Zustand | Minimal, sin boilerplate |
| Data Fetching | TanStack Query + Supabase | Cache, optimistic updates, pagination |
| Formularios | react-hook-form + Zod | Validacion type-safe |
| Mapas | Leaflet + react-leaflet | Gratis, OSM tiles, zero cost |
| Graficos | Recharts | React-native, tree-shakable |
| PDF Export | jspdf + jspdf-autotable | Server-side, ligero |
| Excel Export | exceljs | Streaming, buen styling |
| Imagenes | browser-image-compression | Compresion client-side pre-upload |
| Notificaciones | Supabase Realtime | Channels por organizacion |
| PWA | @serwist/next | Service worker, offline |
| Toasts | Sonner | Animaciones smooth |
| Iconos | Lucide React | Consistente, tree-shakable |
| Fechas | date-fns | Ligero, modular |

---

## Arquitectura Feature-First

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── signup/[token]/page.tsx      # Invitation signup
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/page.tsx           # Home dashboard
│   │   ├── reports/
│   │   │   ├── page.tsx                 # Report list + map
│   │   │   ├── new/page.tsx             # Create report
│   │   │   └── [id]/page.tsx            # Report detail
│   │   ├── brigades/
│   │   │   ├── page.tsx                 # Brigade list
│   │   │   └── [id]/page.tsx            # Brigade detail
│   │   ├── zones/page.tsx               # Zone/sector management
│   │   ├── users/page.tsx               # User management
│   │   ├── settings/page.tsx            # Org settings
│   │   ├── analytics/page.tsx           # Executive reporting
│   │   ├── notifications/page.tsx       # Notification center
│   │   ├── messages/page.tsx            # Chat de mensajeria interna
│   │   └── layout.tsx                   # App shell (sidebar, topbar)
│   ├── (admin)/                         # Super admin routes
│   │   ├── organizations/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── layout.tsx
│   ├── (public)/                        # Landing/marketing
│   │   ├── page.tsx                     # Landing page
│   │   ├── pricing/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── export/pdf/route.ts
│   │   └── export/excel/route.ts
│   ├── layout.tsx
│   └── globals.css
│
├── features/
│   ├── auth/
│   │   ├── components/                  # LoginForm, SignupForm, ForgotPassword
│   │   ├── hooks/                       # useAuth, useSession, useRole
│   │   ├── services/                    # authService (signIn, signUp, signOut)
│   │   ├── types/                       # User, Session, Role types
│   │   └── store/                       # authStore (Zustand)
│   │
│   ├── reports/
│   │   ├── components/                  # ReportCard, ReportForm, ReportDetail,
│   │   │                                # ReportList, ReportMap, StatusBadge,
│   │   │                                # PhotoCapture, PhotoGallery, StatusTimeline
│   │   ├── hooks/                       # useReports, useReport, useReportForm
│   │   ├── services/                    # reportService (CRUD, status changes)
│   │   ├── types/                       # Report, ReportFilters, etc.
│   │   └── store/                       # reportFilterStore
│   │
│   ├── brigades/
│   │   ├── components/                  # BrigadeCard, BrigadeForm, MemberList
│   │   ├── hooks/                       # useBrigades, useBrigade
│   │   ├── services/                    # brigadeService
│   │   ├── types/
│   │   └── store/
│   │
│   ├── dashboard/
│   │   ├── components/                  # StatCard, ReportsByStatus, ReportsByZone,
│   │   │                                # RecentReports, SeverityChart, TrendChart
│   │   ├── hooks/                       # useDashboardStats
│   │   ├── services/                    # dashboardService (calls RPCs)
│   │   └── types/
│   │
│   ├── analytics/
│   │   ├── components/                  # TimeSeriesChart, ZoneHeatmap,
│   │   │                                # BrigadePerformance, SLACompliance,
│   │   │                                # ExportControls
│   │   ├── hooks/                       # useAnalytics, useExport
│   │   ├── services/                    # analyticsService, exportService
│   │   └── types/
│   │
│   ├── territories/
│   │   ├── components/                  # ZoneList, SectorList, ZoneForm, TerritoryPicker
│   │   ├── hooks/                       # useZones, useSectors, useTerritories
│   │   ├── services/                    # territoryService
│   │   └── types/
│   │
│   ├── users/
│   │   ├── components/                  # UserTable, InviteForm, RoleSelector
│   │   ├── hooks/                       # useUsers, useInvitations
│   │   ├── services/                    # userService, invitationService
│   │   └── types/
│   │
│   ├── notifications/
│   │   ├── components/                  # NotificationBell, NotificationList, NotificationItem
│   │   ├── hooks/                       # useNotifications, useRealtimeNotifications
│   │   ├── services/                    # notificationService
│   │   ├── types/
│   │   └── store/                       # notificationStore (unread count)
│   │
│   ├── organizations/
│   │   ├── components/                  # OrgForm, OrgSettings, LogoUpload
│   │   ├── hooks/                       # useOrganization
│   │   ├── services/                    # orgService
│   │   └── types/
│   │
│   ├── messaging/
│   │   ├── components/                  # ChatWindow, ChannelList, MessageBubble,
│   │   │                                # VoiceRecorder, ContactList, PresenceIndicator
│   │   ├── hooks/                       # useMessages, useChannels, usePresence, useVoiceRecorder
│   │   ├── services/                    # messagingService (send, receive, channels)
│   │   ├── types/                       # Message, Channel, Participant
│   │   └── store/                       # messagingStore (active channel, unread counts)
│   │
│   └── super-admin/
│       ├── components/                  # OrgTable, TenantStats, OnboardingWizard
│       ├── hooks/                       # useTenants, usePlatformStats
│       ├── services/                    # superAdminService
│       └── types/
│
└── shared/
    ├── components/
    │   ├── ui/                          # shadcn/ui components (Button, Card, etc.)
    │   ├── layout/                      # Sidebar, Topbar, MobileNav, PageHeader
    │   ├── data/                        # DataTable, Pagination, EmptyState, LoadingState
    │   └── feedback/                    # ConfirmDialog, ErrorBoundary
    ├── hooks/
    │   ├── useDebounce.ts
    │   ├── useGeolocation.ts
    │   ├── useMediaQuery.ts
    │   └── usePermission.ts
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts                # Browser client
    │   │   ├── server.ts                # Server Component client
    │   │   ├── middleware.ts             # Edge-compatible client
    │   │   └── admin.ts                 # Service role client (server only)
    │   ├── query-client.ts              # TanStack Query provider
    │   └── utils.ts                     # cn(), formatDate(), etc.
    ├── types/
    │   ├── database.ts                  # Supabase generated types
    │   ├── api.ts                       # API response types
    │   └── enums.ts                     # Shared enums matching DB
    └── constants/
        ├── roles.ts                     # Role permissions map
        ├── statuses.ts                  # Status flow + colors
        └── config.ts                    # App-wide config
```

---

## Modelo de Datos

### Tablas Existentes (Migraciones 1-6)
- `organizations` - Ayuntamientos (tenants)
- `user_profiles` - Usuarios con roles
- `zones` - Zonas por organizacion
- `sectors` - Sectores dentro de zonas
- `brigades` - Brigadas de trabajo
- `brigade_members` - Miembros de brigadas
- `damage_types` - Catalogo global (18 tipos)
- `damage_severities` - Catalogo global (4 niveles)
- `reports` - Reportes de dano vial
- `report_photos` - Fotos antes/durante/despues
- `report_comments` - Comentarios en reportes
- `status_history` - Historial inmutable de estatus
- `invitations` - Sistema de invitaciones
- `territorial_*` - 6 tablas de division territorial RD

### Tablas Pendientes (Migraciones 7-10)
- `notifications` - Notificaciones por usuario
- `activity_log` - Log de actividad (auditoria extendida)
- Analytics RPCs (funciones para dashboards)
- Storage bucket para logos de organizaciones

---

## Blueprint (Assembly Line)

> Solo FASES. Subtareas se generan al entrar a cada fase con mapeo de contexto.

### Fase 0: Infraestructura y Dependencias
**Objetivo**: Proyecto listo para desarrollar - dependencias instaladas, Supabase conectado, estructura base, tipos generados
**Dependencias**: Ninguna (punto de partida)
**Validacion**: `npm run build` exitoso, Supabase client conecta, tipos generados
**Complejidad**: L

### Fase 1: Sistema de Autenticacion Multi-Tenant
**Objetivo**: Login, signup por invitacion, session management, middleware de proteccion, role context
**Dependencias**: Fase 0
**Validacion**: Login funcional, signup con token funcional, rutas protegidas, JWT con org_id+role
**Complejidad**: XL

### Fase 2: App Shell y Navegacion
**Objetivo**: Layout autenticado con sidebar, topbar, navegacion responsive, role-based menu, breadcrumbs
**Dependencias**: Fase 1
**Validacion**: Navegacion fluida, sidebar collapse en mobile, menu items segun rol
**Complejidad**: L

### Fase 3: Gestion de Territorios
**Objetivo**: CRUD de zonas y sectores, picker de territorio para formularios, visualizacion de estructura territorial
**Dependencias**: Fase 2
**Validacion**: Admin puede crear/editar/desactivar zonas y sectores, picker funcional en formularios
**Complejidad**: M

### Fase 4: Creacion de Reportes (Core del Inspector)
**Objetivo**: Formulario de reporte con captura de foto, GPS automatico, seleccion de tipo/severidad/zona/sector, compresion de imagen, upload a Storage
**Dependencias**: Fase 2, Fase 3
**Validacion**: Inspector crea reporte completo con foto en <30 seg, GPS correcto, foto en Storage, reporte en DB
**Complejidad**: XL

### Fase 5: Lista y Detalle de Reportes
**Objetivo**: Vista de lista con filtros (estatus, zona, tipo, fecha, severidad), vista de detalle con timeline de estatus, galeria de fotos, comentarios, mapa individual
**Dependencias**: Fase 4
**Validacion**: Filtros funcionales, paginacion, detalle completo con historial, mapa con pin
**Complejidad**: XL

### Fase 6: Vista de Mapa Interactivo
**Objetivo**: Mapa Leaflet con pines por reporte, colores por severidad/estatus, clustering, filtros sincronizados con lista, click para ver detalle
**Dependencias**: Fase 5
**Validacion**: Mapa carga con todos los reportes, clusters en zoom out, filtros funcionan, click abre detalle
**Complejidad**: L

### Fase 7: Gestion de Brigadas
**Objetivo**: CRUD de brigadas, asignacion de miembros, lider de brigada, carga de trabajo visible
**Dependencias**: Fase 2
**Validacion**: Admin/supervisor puede crear brigadas, asignar miembros, ver carga actual
**Complejidad**: M

### Fase 8: Flujo del Supervisor
**Objetivo**: Asignacion de brigada a reporte, cambio de estatus con validacion de flujo, comentarios del supervisor, fotos de evidencia (durante/despues), resolucion de reporte
**Dependencias**: Fase 5, Fase 7
**Validacion**: Supervisor asigna brigada, cambia estatus paso a paso, sube foto despues, marca completado
**Complejidad**: L

### Fase 9: Dashboard Ejecutivo
**Objetivo**: KPIs principales (total reportes, pendientes, en proceso, completados, tasa de completitud, tiempo promedio de respuesta), graficos por estatus/zona/tipo/severidad, tendencias mensuales
**Dependencias**: Fase 5
**Validacion**: Dashboard carga en <2seg, datos correctos, graficos interactivos
**Complejidad**: L

### Fase 10: Gestion de Usuarios
**Objetivo**: Tabla de usuarios, invitacion por email con rol, cambio de rol, desactivacion, vista de usuarios activos/inactivos
**Dependencias**: Fase 2
**Validacion**: Admin invita usuario, usuario se registra con token, admin cambia rol, admin desactiva usuario
**Complejidad**: M

### Fase 11: Sistema de Notificaciones
**Objetivo**: Notificaciones realtime (nuevo reporte, estatus cambiado, brigada asignada), bell icon con badge, lista de notificaciones, marcar como leida
**Dependencias**: Fase 8
**Validacion**: Supervisor recibe notificacion cuando llega reporte, inspector notificado cuando se completa
**Complejidad**: L

### Fase 12: Analytics y Exportacion
**Objetivo**: Dashboard analitico avanzado (series de tiempo, heatmap por zona, rendimiento de brigadas, cumplimiento SLA), exportacion PDF y Excel
**Dependencias**: Fase 9
**Validacion**: Graficos avanzados funcionales, PDF genera correctamente, Excel con datos formateados
**Complejidad**: XL

### Fase 13: Panel Super Admin
**Objetivo**: Dashboard del dueno del SaaS - lista de organizaciones, stats por tenant, onboarding wizard, gestion de suscripciones
**Dependencias**: Fase 9
**Validacion**: Super admin ve todos los tenants, puede crear nuevo org, ve metricas globales
**Complejidad**: L

### Fase 14: Landing Page Publica
**Objetivo**: Pagina de marketing para vender el SaaS - hero, features, pricing, CTA, testimonios, responsive
**Dependencias**: Fase 0 (independiente del resto)
**Validacion**: Pagina carga rapida, responsive, SEO optimizada, formulario de contacto funcional
**Complejidad**: M

### Fase 15: PWA y Experiencia Movil
**Objetivo**: Service worker, manifest.json, instalable en home screen, cache de assets, experiencia nativa en movil
**Dependencias**: Fase 4
**Validacion**: App instalable desde Chrome, icono en home screen, splash screen, funciona offline para fotos
**Complejidad**: L

### Fase 16: Configuracion de Organizacion
**Objetivo**: Pagina de settings - perfil del org, logo upload, datos de contacto, configuraciones operativas
**Dependencias**: Fase 2
**Validacion**: Admin edita perfil, sube logo, cambia datos de contacto
**Complejidad**: M

### Fase 17: Audit Trail Completo
**Objetivo**: Activity log visible, filtrable por entidad/usuario/fecha, exportable
**Dependencias**: Fase 8
**Validacion**: Toda accion queda registrada, admin puede filtrar y ver historial completo
**Complejidad**: M

### Fase 18: Seguridad y Hardening
**Objetivo**: Rate limiting, CSRF protection, input sanitization audit, RLS verification, security headers, error boundaries
**Dependencias**: Fase 8
**Validacion**: Audit de seguridad pasa, no hay datos leaking entre tenants, error boundaries funcionan
**Complejidad**: M

### Fase 19: Accesibilidad y Pulido UI
**Objetivo**: ARIA labels, keyboard navigation, focus management, contrast ratios, responsive final, empty states, loading states, error states
**Dependencias**: Todas las fases de UI
**Validacion**: Lighthouse accessibility >90, todos los estados cubiertos, responsive perfecto
**Complejidad**: M

### Fase 20: Chat de Mensajeria Interna
**Objetivo**: Sistema de mensajeria en tiempo real entre miembros de la organizacion. Canales por brigada, zona y general. Soporte para mensajes de texto y notas de voz. Lista de contactos del personal. Indicador de presencia (en linea/desconectado). Historial de conversaciones.
**Dependencias**: Fase 1, Fase 2, Fase 11
**Validacion**: Supervisor puede enviar mensaje a inspector en tiempo real, notas de voz se graban y reproducen, canales por brigada funcionan, historial persistente
**Complejidad**: XL

### Fase 21: Testing y Produccion
**Objetivo**: Test suite (unit + integration), CI/CD, deploy a Vercel, dominio, SSL, monitoreo
**Dependencias**: Todas las fases
**Validacion**: Tests pasan, build exitoso, deploy funcional, dominio configurado
**Complejidad**: XL

---

## Orden de Ejecucion Recomendado

```
Fase 0  → Fase 1  → Fase 2 (Infraestructura → Auth → Shell)
                       ↓
              ┌────────┼────────────┬──────────┐
              ↓        ↓            ↓          ↓
           Fase 3   Fase 7      Fase 10    Fase 16
           (Territ) (Brigadas)  (Users)    (Settings)
              ↓        ↓
           Fase 4   Fase 14 (Landing - paralelo)
              ↓
           Fase 5 ──→ Fase 6 (Mapa)
              ↓
           Fase 8 (Supervisor) ← Fase 7
              ↓
           Fase 9 (Dashboard)
              ↓
     ┌────────┼────────┬──────────┐
     ↓        ↓        ↓          ↓
  Fase 11  Fase 12  Fase 13    Fase 17
  (Notif)  (Export) (SuperAdm) (Audit)
              ↓
           Fase 15 (PWA)
              ↓
           Fase 18 → Fase 19 → Fase 20
```

---

## Decisiones Arquitectonicas Clave

1. **Mapas**: Leaflet + react-leaflet (gratis, OSM). Migrar a Mapbox si necesario
2. **Data Fetching**: TanStack Query wrapping Supabase para cache y optimistic updates
3. **Formularios**: react-hook-form + Zod resolvers
4. **Graficos**: Recharts (mejor integracion React que Chart.js)
5. **PDF**: Server-side con jspdf (evita bundle pesado en cliente)
6. **Excel**: exceljs (streaming, buen styling)
7. **Imagenes**: Compresion client-side con browser-image-compression (800px max, <500KB)
8. **Realtime**: Solo para notificaciones (no para listas de reportes)
9. **i18n**: Espanol unico para MVP. Estructura preparada para next-intl si necesario
10. **Territorial**: Tablas genericas que pueden cargar division territorial de cualquier pais

---

## Gotchas

- [ ] Leaflet requiere dynamic import con `ssr: false` (no funciona en SSR)
- [ ] Supabase RLS: siempre wrappear `auth.jwt()` en `(SELECT ...)` para performance
- [ ] Geolocation API requiere HTTPS (funciona en localhost pero no en HTTP)
- [ ] `browser-image-compression` es async - mostrar loading mientras comprime
- [ ] Storage upload paths deben empezar con `{organization_id}/` (RLS)
- [ ] Recharts no funciona en SSR - usar dynamic import
- [ ] Next.js 16 middleware runs at edge - Supabase client debe ser edge-compatible
- [ ] Las fotos HEIC (iPhone) deben convertirse a JPEG antes de subir

## Anti-Patrones

- NO usar `service_role` key en el cliente (bypasses RLS)
- NO hacer queries sin filtro de organization_id (RLS lo hace pero es defense-in-depth)
- NO guardar archivos sin comprimir (redes 3G en campo)
- NO usar localStorage para datos sensibles
- NO hacer polling para notificaciones (usar Supabase Realtime)
- NO hardcodear la division territorial de RD (debe ser dinamica para expansion LATAM)

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

*(Vacia - se llena durante ejecucion)*

---

*PRP pendiente aprobacion. No se ha modificado codigo de aplicacion.*
