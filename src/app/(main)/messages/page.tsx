'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Send, Mic, Phone, Video, Hash, User, MoreVertical } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Channel {
  id: string
  name: string
  type: 'channel' | 'direct'
  unread: number
  lastMessage: string
  lastTime: string
  memberCount?: number
  avatarInitials?: string
  online?: boolean
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderInitials: string
  content: string
  time: string
  isOwn: boolean
  type: 'text' | 'voice' | 'system'
  voiceDuration?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'General',
    type: 'channel',
    unread: 3,
    lastMessage: 'Reunion manana a las 9am',
    lastTime: '09:45',
    memberCount: 24,
  },
  {
    id: 'brigada-alpha',
    name: 'Brigada Alpha',
    type: 'channel',
    unread: 1,
    lastMessage: 'Terminamos el bacheo',
    lastTime: '08:30',
    memberCount: 6,
  },
  {
    id: 'brigada-beta',
    name: 'Brigada Beta',
    type: 'channel',
    unread: 0,
    lastMessage: 'Saliendo al campo',
    lastTime: 'Ayer',
    memberCount: 5,
  },
  {
    id: 'zona-norte',
    name: 'Zona Norte',
    type: 'channel',
    unread: 0,
    lastMessage: 'Reporte DN-000005 completado',
    lastTime: 'Ayer',
    memberCount: 12,
  },
]

const DIRECT_MESSAGES: Channel[] = [
  {
    id: 'dm-ana',
    name: 'Ana Rosario',
    type: 'direct',
    unread: 2,
    lastMessage: 'Revisaste el reporte DN-0003?',
    lastTime: '10:12',
    avatarInitials: 'AR',
    online: true,
  },
  {
    id: 'dm-miguel',
    name: 'Miguel Torres',
    type: 'direct',
    unread: 0,
    lastMessage: 'Listo, en camino',
    lastTime: '08:55',
    avatarInitials: 'MT',
    online: true,
  },
  {
    id: 'dm-sofia',
    name: 'Sofia Castro',
    type: 'direct',
    unread: 0,
    lastMessage: 'Gracias por el apoyo',
    lastTime: 'Ayer',
    avatarInitials: 'SC',
    online: false,
  },
]

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'carlos',
    senderName: 'Carlos Martinez',
    senderInitials: 'CM',
    content: 'Buenos dias equipo! Hoy tenemos 3 reportes criticos asignados en Zona Norte.',
    time: '08:01',
    isOwn: false,
    type: 'text',
  },
  {
    id: '2',
    senderId: 'ana',
    senderName: 'Ana Rosario',
    senderInitials: 'AR',
    content: 'Buenos dias. Voy a revisar el reporte DN-000001 primero, es el mas urgente segun el mapa.',
    time: '08:05',
    isOwn: false,
    type: 'text',
  },
  {
    id: 'sys-1',
    senderId: 'system',
    senderName: 'Sistema',
    senderInitials: '',
    content: 'Ana Rosario se unio al canal',
    time: '08:07',
    isOwn: false,
    type: 'system',
  },
  {
    id: '3',
    senderId: 'me',
    senderName: 'Tu',
    senderInitials: 'TU',
    content: 'Confirmo. Ya asigne la Brigada Alpha al DN-000001. Miguel, pueden salir a las 9?',
    time: '08:10',
    isOwn: true,
    type: 'text',
  },
  {
    id: '4',
    senderId: 'miguel',
    senderName: 'Miguel Torres',
    senderInitials: 'MT',
    content: 'Perfecto, estaremos listos. Tenemos todo el material necesario.',
    time: '08:12',
    isOwn: false,
    type: 'text',
  },
  {
    id: '5',
    senderId: 'miguel',
    senderName: 'Miguel Torres',
    senderInitials: 'MT',
    content: '',
    time: '08:13',
    isOwn: false,
    type: 'voice',
    voiceDuration: '0:12',
  },
  {
    id: '6',
    senderId: 'carlos',
    senderName: 'Carlos Martinez',
    senderInitials: 'CM',
    content: 'Tambien reporto un nuevo bache en Av. Independencia, ya lo subi al sistema como DN-000016.',
    time: '08:45',
    isOwn: false,
    type: 'text',
  },
  {
    id: '7',
    senderId: 'me',
    senderName: 'Tu',
    senderInitials: 'TU',
    content: 'Recibido Carlos. Lo agrego a la cola de revision para hoy.',
    time: '08:47',
    isOwn: true,
    type: 'text',
  },
  {
    id: '8',
    senderId: 'ana',
    senderName: 'Ana Rosario',
    senderInitials: 'AR',
    content: 'Ya aprobé el DN-000003. Brigada Beta puede proceder cuando terminen el actual.',
    time: '09:30',
    isOwn: false,
    type: 'text',
  },
  {
    id: '9',
    senderId: 'me',
    senderName: 'Tu',
    senderInitials: 'TU',
    content: 'Excelente trabajo equipo. Vamos bien con los objetivos del mes.',
    time: '09:45',
    isOwn: true,
    type: 'text',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChannelItem({
  channel,
  isActive,
  onClick,
}: {
  channel: Channel
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
        isActive
          ? 'bg-[#4A90D9]/10 border-l-2 border-[#4A90D9] rounded-l-none pl-2.5'
          : 'hover:bg-white/5'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {channel.type === 'channel' ? (
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
            isActive ? 'bg-[#4A90D9]/15 text-[#4A90D9]' : 'bg-white/10 text-slate-400'
          )}
        >
          <Hash size={14} />
        </div>
      ) : (
        <div className="relative shrink-0">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold',
              isActive ? 'bg-[#4A90D9] text-white' : 'bg-white/10 text-slate-300'
            )}
          >
            {channel.avatarInitials}
          </div>
          {channel.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0F1A2E]" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-[#4A90D9]' : 'text-slate-200'
            )}
          >
            {channel.name}
          </span>
          <span className="text-[10px] text-slate-400 shrink-0 ml-1">{channel.lastTime}</span>
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">{channel.lastMessage}</p>
      </div>

      {channel.unread > 0 && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4A017] text-white text-[10px] font-bold shrink-0">
          {channel.unread}
        </span>
      )}
    </button>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-[11px] text-slate-400 bg-white/10 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  if (message.isOwn) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-end gap-2 max-w-[75%]">
          {message.type === 'voice' ? (
            <div className="flex items-center gap-2.5 bg-[#4A90D9] text-white px-4 py-2.5 rounded-2xl rounded-br-sm">
              <button
                aria-label="Reproducir mensaje de voz"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <span className="text-xs">▶</span>
              </button>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-white/70 rounded-full"
                    style={{ height: `${4 + Math.sin(i * 0.8) * 8 + 4}px` }}
                  />
                ))}
              </div>
              <span className="text-xs opacity-80">{message.voiceDuration}</span>
            </div>
          ) : (
            <div className="bg-[#4A90D9] text-white px-4 py-2.5 rounded-2xl rounded-br-sm">
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mr-1">{message.time}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-end gap-2 max-w-[75%]">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-slate-300 text-xs font-bold shrink-0 mb-1"
          aria-hidden="true"
        >
          {message.senderInitials}
        </div>

        <div>
          <p className="text-[10px] text-slate-400 mb-1 ml-1">{message.senderName}</p>
          {message.type === 'voice' ? (
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-lg shadow-black/10">
              <button
                aria-label="Reproducir mensaje de voz"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-[#4A90D9]/10 hover:bg-[#4A90D9]/20 transition-colors"
              >
                <span className="text-xs text-[#4A90D9]">▶</span>
              </button>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-[#4A90D9]/40 rounded-full"
                    style={{ height: `${4 + Math.sin(i * 0.8) * 8 + 4}px` }}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">{message.voiceDuration}</span>
            </div>
          ) : (
            <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-lg shadow-black/10">
              <p className="text-sm text-slate-100 leading-relaxed">{message.content}</p>
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] text-slate-400 ml-9">{message.time}</span>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [activeChannelId, setActiveChannelId] = useState('general')
  const [activeTab, setActiveTab] = useState<'canales' | 'directos'>('canales')
  const [searchQuery, setSearchQuery] = useState('')
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChannel =
    [...CHANNELS, ...DIRECT_MESSAGES].find((c) => c.id === activeChannelId) ?? CHANNELS[0]

  const filteredChannels = CHANNELS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredDMs = DIRECT_MESSAGES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!inputMessage.trim()) return
    const newMsg: Message = {
      id: String(Date.now()),
      senderId: 'me',
      senderName: 'Tu',
      senderInitials: 'TU',
      content: inputMessage.trim(),
      time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: 'text',
    }
    setMessages((prev) => [...prev, newMsg])
    setInputMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] -m-6 bg-[#0F1A2E] overflow-hidden">

      {/* ── LEFT PANEL: Contacts ── */}
      <aside
        className="hidden md:flex flex-col w-72 bg-[#0F1A2E] border-r border-white/10 shrink-0"
        aria-label="Lista de conversaciones"
      >
        {/* Search */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar conversaciones"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent placeholder:text-slate-500 text-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-3 pt-2">
          {(['canales', 'directos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 pb-2 text-xs font-semibold capitalize transition-colors border-b-2',
                activeTab === tab
                  ? 'text-[#4A90D9] border-[#4A90D9]'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {activeTab === 'canales' ? (
            <>
              {filteredChannels.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>
              ) : (
                filteredChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannelId === channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {filteredDMs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>
              ) : (
                filteredDMs.map((dm) => (
                  <ChannelItem
                    key={dm.id}
                    channel={dm}
                    isActive={activeChannelId === dm.id}
                    onClick={() => setActiveChannelId(dm.id)}
                  />
                ))
              )}
            </>
          )}
        </div>
      </aside>

      {/* ── CENTER PANEL: Chat ── */}
      <main className="flex flex-col flex-1 min-w-0 bg-white/5">

        {/* Chat header */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#0F1A2E] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#4A90D9]/15 text-[#4A90D9] shrink-0">
              {activeChannel.type === 'channel' ? (
                <Hash size={16} />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {activeChannel.name}
              </p>
              <p className="text-xs text-slate-400">
                {activeChannel.type === 'channel'
                  ? `${activeChannel.memberCount} miembros`
                  : activeChannel.online
                  ? 'En linea'
                  : 'Desconectado'}
              </p>
            </div>
            {activeChannel.online && activeChannel.type === 'direct' && (
              <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" aria-label="En linea" />
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              aria-label="Llamada de voz"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-colors"
            >
              <Phone size={16} />
            </button>
            <button
              aria-label="Videollamada"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-colors"
            >
              <Video size={16} />
            </button>
            <button
              aria-label="Mas opciones"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          role="log"
          aria-label="Mensajes"
          aria-live="polite"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-[#0F1A2E] border-t border-white/10 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              aria-label="Grabar nota de voz"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-[#4A90D9] hover:bg-[#4A90D9]/10 transition-colors shrink-0"
            >
              <Mic size={18} />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              aria-label="Escribe un mensaje"
              className="flex-1 px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent placeholder:text-slate-500 text-white"
            />

            <button
              onClick={handleSend}
              disabled={!inputMessage.trim()}
              aria-label="Enviar mensaje"
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all shrink-0',
                inputMessage.trim()
                  ? 'bg-gradient-to-r from-[#4A90D9] to-[#1B3A6B] hover:opacity-90 text-white shadow-sm shadow-[#4A90D9]/30'
                  : 'bg-white/10 text-slate-400 cursor-not-allowed'
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL: Info (hidden on mobile/tablet) ── */}
      <aside
        className="hidden xl:flex flex-col w-64 bg-[#0F1A2E] border-l border-white/10 shrink-0"
        aria-label="Informacion del canal"
      >
        <div className="p-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-slate-100">
            {activeChannel.type === 'channel' ? 'Acerca del Canal' : 'Perfil'}
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Channel / person avatar */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4A90D9]/15 text-[#4A90D9]">
              {activeChannel.type === 'channel' ? (
                <Hash size={28} />
              ) : (
                <span className="text-xl font-bold">{activeChannel.avatarInitials}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-100">{activeChannel.name}</p>
            {activeChannel.type === 'channel' && (
              <p className="text-xs text-slate-400">{activeChannel.memberCount} miembros</p>
            )}
            {activeChannel.type === 'direct' && activeChannel.online && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#4A90D9]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                En linea
              </span>
            )}
          </div>

          {/* Quick stats */}
          {activeChannel.type === 'channel' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">
                  {activeChannel.memberCount}
                </p>
                <p className="text-[10px] text-slate-400">Miembros</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">127</p>
                <p className="text-[10px] text-slate-400">Mensajes</p>
              </div>
            </div>
          )}

          {/* Members preview (channels only) */}
          {activeChannel.type === 'channel' && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Miembros recientes</p>
              <div className="space-y-2">
                {['Carlos Martinez', 'Ana Rosario', 'Miguel Torres'].map((name) => {
                  const initials = name.split(' ').map((n) => n[0]).join('')
                  return (
                    <div key={name} className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-slate-300 text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <span className="text-xs text-slate-200 truncate">{name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 ml-auto" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
