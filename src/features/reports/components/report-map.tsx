'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

// Fix default marker icons for Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'low' | 'medium' | 'high' | 'critical'
type ReportStatus = 'submitted' | 'in_review' | 'approved' | 'in_progress' | 'completed' | 'rejected'

interface MapReport {
  id: string
  report_number: string
  title: string
  status: ReportStatus
  severity: Severity
  lat: number
  lng: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<Severity, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  submitted: 'Enviado',
  in_review: 'En Revision',
  approved: 'Aprobado',
  in_progress: 'En Proceso',
  completed: 'Completado',
  rejected: 'Rechazado',
}

const STATUS_BADGE: Record<ReportStatus, string> = {
  submitted: 'bg-blue-50 text-blue-700 border border-blue-200',
  in_review: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  approved: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  in_progress: 'bg-orange-50 text-orange-700 border border-orange-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
}

// ─── Mock data (15 markers across Santo Domingo) ──────────────────────────────

const MOCK_MAP_REPORTS: MapReport[] = [
  {
    id: '1',
    report_number: 'DN-000001',
    title: 'Bache profundo Av. Winston Churchill',
    status: 'in_progress',
    severity: 'critical',
    lat: 18.4757,
    lng: -69.9374,
  },
  {
    id: '2',
    report_number: 'DN-000002',
    title: 'Alcantarilla sin tapa Av. 27 de Febrero',
    status: 'submitted',
    severity: 'critical',
    lat: 18.4861,
    lng: -69.9312,
  },
  {
    id: '3',
    report_number: 'DN-000003',
    title: 'Grietas en calzada Av. Abraham Lincoln',
    status: 'approved',
    severity: 'high',
    lat: 18.4718,
    lng: -69.9264,
  },
  {
    id: '4',
    report_number: 'DN-000004',
    title: 'Hundimiento severo Calle El Conde',
    status: 'in_review',
    severity: 'critical',
    lat: 18.4748,
    lng: -69.8937,
  },
  {
    id: '5',
    report_number: 'DN-000005',
    title: 'Senalizacion faltante Autopista Duarte',
    status: 'completed',
    severity: 'medium',
    lat: 18.5012,
    lng: -69.9523,
  },
  {
    id: '6',
    report_number: 'DN-000006',
    title: 'Bache multiple Av. Independencia',
    status: 'in_progress',
    severity: 'high',
    lat: 18.4695,
    lng: -69.9187,
  },
  {
    id: '7',
    report_number: 'DN-000007',
    title: 'Acera deteriorada Calle Las Damas',
    status: 'submitted',
    severity: 'medium',
    lat: 18.4739,
    lng: -69.8921,
  },
  {
    id: '8',
    report_number: 'DN-000008',
    title: 'Inundacion recurrente Av. George Washington',
    status: 'approved',
    severity: 'high',
    lat: 18.4613,
    lng: -69.9298,
  },
  {
    id: '9',
    report_number: 'DN-000009',
    title: 'Demarcacion vial borrada Av. Lope de Vega',
    status: 'in_review',
    severity: 'low',
    lat: 18.4923,
    lng: -69.9441,
  },
  {
    id: '10',
    report_number: 'DN-000010',
    title: 'Escombros en via Calle El Peynado',
    status: 'rejected',
    severity: 'high',
    lat: 18.4832,
    lng: -69.9156,
  },
  {
    id: '11',
    report_number: 'DN-000011',
    title: 'Alumbrado publico apagado Av. Sarasota',
    status: 'in_review',
    severity: 'medium',
    lat: 18.4578,
    lng: -69.9487,
  },
  {
    id: '12',
    report_number: 'DN-000012',
    title: 'Piel de cocodrilo Av. Romulo Betancourt',
    status: 'submitted',
    severity: 'critical',
    lat: 18.4645,
    lng: -69.9612,
  },
  {
    id: '13',
    report_number: 'DN-000013',
    title: 'Tapa de alcantarilla rota Calle Barahona',
    status: 'in_progress',
    severity: 'high',
    lat: 18.4791,
    lng: -69.9034,
  },
  {
    id: '14',
    report_number: 'DN-000014',
    title: 'Ahuellamiento Av. John F. Kennedy',
    status: 'approved',
    severity: 'medium',
    lat: 18.4904,
    lng: -69.9789,
  },
  {
    id: '15',
    report_number: 'DN-000015',
    title: 'Arbol caido Calle Las Acacias',
    status: 'completed',
    severity: 'critical',
    lat: 18.4867,
    lng: -69.9234,
  },
]

const CENTER: [number, number] = [18.4861, -69.9312]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportMap() {
  return (
    <MapContainer
      center={CENTER}
      zoom={13}
      className="w-full h-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {MOCK_MAP_REPORTS.map((report) => (
        <CircleMarker
          key={report.id}
          center={[report.lat, report.lng]}
          radius={10}
          pathOptions={{
            fillColor: SEVERITY_COLORS[report.severity],
            fillOpacity: 0.85,
            color: '#ffffff',
            weight: 2,
          }}
        >
          <Popup className="report-popup" maxWidth={240}>
            <div className="p-1 font-sans">
              <p className="text-[10px] font-mono text-slate-400 mb-1">
                {report.report_number}
              </p>
              <p className="text-sm font-semibold text-slate-800 leading-snug mb-2">
                {report.title}
              </p>
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${STATUS_BADGE[report.status]}`}
                >
                  {STATUS_LABELS[report.status]}
                </span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: SEVERITY_COLORS[report.severity] + '22',
                    color: SEVERITY_COLORS[report.severity],
                    border: `1px solid ${SEVERITY_COLORS[report.severity]}44`,
                  }}
                >
                  {SEVERITY_LABELS[report.severity]}
                </span>
              </div>
              <Link
                href={`/reports/${report.id}`}
                className="text-xs font-medium text-green-600 hover:text-green-700 underline underline-offset-2"
              >
                Ver detalle
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
