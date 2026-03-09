'use client'

import { useState } from 'react'
import { Building2, Bell, Shield, Palette, Globe, Save, Upload } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1A30]">Configuracion</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra la configuracion de tu organizacion
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-white/5 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-[#4A90D9] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="eng-card divide-y divide-white/5">
          {/* Org Info */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Informacion de la Organizacion</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre del Ayuntamiento</label>
                <input
                  type="text"
                  defaultValue="Ayuntamiento del Distrito Nacional"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Slug / URL</label>
                <input
                  type="text"
                  defaultValue="ayuntamiento-dn"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-400 opacity-60 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email de Contacto</label>
                <input
                  type="email"
                  defaultValue="info@adn.gob.do"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Telefono</label>
                <input
                  type="tel"
                  defaultValue="+1 (809) 535-5115"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Direccion</label>
                <input
                  type="text"
                  defaultValue="Av. Jimenez Moya esq. Pedro Henriquez Urena, Distrito Nacional"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Logo de la Organizacion</h3>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#4A90D9]/10 border-2 border-dashed border-[#4A90D9]/30">
                <Building2 className="w-8 h-8 text-[#4A90D9]" />
              </div>
              <div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors">
                  <Upload className="w-4 h-4" />
                  Subir Logo
                </button>
                <p className="mt-1.5 text-[10px] text-slate-400">PNG, JPG o SVG. Maximo 2MB.</p>
              </div>
            </div>
          </div>

          {/* SLA Config */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-white mb-1">Tiempos de Respuesta (SLA)</h3>
            <p className="text-xs text-slate-400 mb-4">Define los tiempos maximos de respuesta por nivel de severidad</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { level: 'Critico', days: '1', color: 'border-l-red-500' },
                { level: 'Alto', days: '3', color: 'border-l-orange-500' },
                { level: 'Medio', days: '7', color: 'border-l-yellow-500' },
                { level: 'Bajo', days: '14', color: 'border-l-green-500' },
              ].map((sla) => (
                <div key={sla.level} className={cn('flex items-center justify-between rounded-lg border border-white/10 border-l-4 px-4 py-3 bg-white/5', sla.color)}>
                  <span className="text-sm font-medium text-slate-200">{sla.level}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={sla.days}
                      className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-center text-white focus:border-[#4A90D9] outline-none"
                    />
                    <span className="text-xs text-slate-400">dias</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="p-6 bg-white/5 flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#4A90D9] to-[#1B3A6B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="eng-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Preferencias de Notificacion</h3>
          {[
            { label: 'Nuevo reporte creado', description: 'Recibir notificacion cuando un inspector crea un reporte', enabled: true },
            { label: 'Reporte asignado', description: 'Cuando un reporte es asignado a una brigada', enabled: true },
            { label: 'Cambio de estatus', description: 'Cada vez que un reporte cambia de estatus', enabled: true },
            { label: 'Comentarios', description: 'Cuando alguien comenta en un reporte', enabled: false },
            { label: 'SLA por vencer', description: 'Alerta cuando un reporte esta cerca de superar el SLA', enabled: true },
            { label: 'Resumen diario', description: 'Email con resumen diario de actividad', enabled: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-200">{pref.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{pref.description}</p>
              </div>
              <button
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  pref.enabled ? 'bg-[#4A90D9]' : 'bg-white/10'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    pref.enabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="eng-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Cambiar Contrasena</h3>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Contrasena actual</label>
                <input type="password" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nueva contrasena</label>
                <input type="password" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirmar nueva contrasena</label>
                <input type="password" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 outline-none" />
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#4A90D9] to-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity mt-2">
                Actualizar Contrasena
              </button>
            </div>
          </div>
          <div className="eng-card p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Sesiones Activas</h3>
            <p className="text-xs text-slate-400 mb-4">Dispositivos donde tu cuenta esta activa</p>
            {[
              { device: 'MacBook Pro — Chrome', location: 'Santo Domingo, RD', current: true },
              { device: 'iPhone 15 — Safari', location: 'Santo Domingo, RD', current: false },
            ].map((session) => (
              <div key={session.device} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-200">{session.device}</p>
                  <p className="text-xs text-slate-400">{session.location}</p>
                </div>
                {session.current ? (
                  <span className="text-[10px] font-semibold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">Sesion actual</span>
                ) : (
                  <button className="text-xs text-red-400 hover:text-red-300 font-medium">Cerrar sesion</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="eng-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Tema y Personalizacion</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-3">Color Primario</label>
              <div className="flex gap-3">
                {['#22C55E', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4'].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-10 h-10 rounded-xl border-2 transition-all',
                      color === '#22C55E' ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-3">Idioma</label>
              <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 focus:border-[#4A90D9] outline-none" defaultValue="es">
                <option value="es">Espanol</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-3">Zona Horaria</label>
              <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 focus:border-[#4A90D9] outline-none" defaultValue="AST">
                <option value="AST">America/Santo_Domingo (AST, UTC-4)</option>
                <option value="EST">America/New_York (EST, UTC-5)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
