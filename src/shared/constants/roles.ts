import type { UserRole } from '@/shared/types'

export type Permission =
  | 'reports:create'
  | 'reports:read'
  | 'reports:update'
  | 'reports:delete'
  | 'reports:approve'
  | 'reports:assign'
  | 'reports:submit'
  | 'brigades:read'
  | 'brigades:create'
  | 'brigades:update'
  | 'brigades:delete'
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'zones:read'
  | 'zones:create'
  | 'zones:update'
  | 'zones:delete'
  | 'dashboard:view'
  | 'reports:export'
  | 'settings:read'
  | 'settings:update'
  | 'organizations:manage'

export interface RoleConfig {
  label: string
  description: string
  permissions: Permission[]
  color: string
  bgColor: string
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  inspector: {
    label: 'Inspector',
    description: 'Crea y envía reportes de daños viales desde el campo.',
    permissions: [
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:submit',
      'brigades:read',
      'zones:read',
      'dashboard:view',
    ],
    color: 'text-sky-700',
    bgColor: 'bg-sky-100',
  },
  supervisor: {
    label: 'Supervisor',
    description: 'Revisa, aprueba y asigna reportes a brigadas.',
    permissions: [
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:submit',
      'reports:approve',
      'reports:assign',
      'brigades:read',
      'brigades:update',
      'users:read',
      'zones:read',
      'dashboard:view',
      'reports:export',
    ],
    color: 'text-violet-700',
    bgColor: 'bg-violet-100',
  },
  gerente: {
    label: 'Gerente',
    description: 'Gestiona operaciones, brigadas y tiene acceso completo a reportes.',
    permissions: [
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:delete',
      'reports:approve',
      'reports:assign',
      'reports:submit',
      'brigades:read',
      'brigades:create',
      'brigades:update',
      'users:read',
      'users:update',
      'zones:read',
      'zones:create',
      'zones:update',
      'dashboard:view',
      'reports:export',
      'settings:read',
    ],
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  admin: {
    label: 'Administrador',
    description: 'Administrador de la organización con acceso total.',
    permissions: [
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:delete',
      'reports:approve',
      'reports:assign',
      'reports:submit',
      'brigades:read',
      'brigades:create',
      'brigades:update',
      'brigades:delete',
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'zones:read',
      'zones:create',
      'zones:update',
      'zones:delete',
      'dashboard:view',
      'reports:export',
      'settings:read',
      'settings:update',
    ],
    color: 'text-rose-700',
    bgColor: 'bg-rose-100',
  },
  super_admin: {
    label: 'Super Admin',
    description: 'Acceso total al sistema, incluyendo gestión de organizaciones.',
    permissions: [
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:delete',
      'reports:approve',
      'reports:assign',
      'reports:submit',
      'brigades:read',
      'brigades:create',
      'brigades:update',
      'brigades:delete',
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'zones:read',
      'zones:create',
      'zones:update',
      'zones:delete',
      'dashboard:view',
      'reports:export',
      'settings:read',
      'settings:update',
      'organizations:manage',
    ],
    color: 'text-fuchsia-700',
    bgColor: 'bg-fuchsia-100',
  },
}

export const USER_ROLES = Object.keys(ROLE_CONFIG) as UserRole[]

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_CONFIG[role].permissions.includes(permission)
}
