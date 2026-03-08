import type { DamageType } from '@/shared/types'

export const DAMAGE_TYPES: DamageType[] = [
  {
    code: 'pothole',
    name: 'Bache',
    icon: 'CircleDot',
    description: 'Cavidad o depresión en la superficie del pavimento causada por deterioro.',
  },
  {
    code: 'crack',
    name: 'Grieta / Fisura',
    icon: 'Zap',
    description: 'Fractura lineal o ramificada en el pavimento de diversas profundidades.',
  },
  {
    code: 'subsidence',
    name: 'Hundimiento',
    icon: 'TrendingDown',
    description: 'Depresión o asentamiento diferencial de la superficie vial.',
  },
  {
    code: 'open_manhole',
    name: 'Alcantarilla sin Tapa',
    icon: 'AlertOctagon',
    description: 'Alcantarilla o registro sin tapa, representando un peligro inmediato.',
  },
  {
    code: 'broken_manhole',
    name: 'Tapa de Alcantarilla Rota',
    icon: 'ShieldAlert',
    description: 'Tapa de alcantarilla fracturada o desalineada.',
  },
  {
    code: 'flooding',
    name: 'Inundación / Drenaje Deficiente',
    icon: 'Droplets',
    description: 'Acumulación de agua por drenaje insuficiente o tapado.',
  },
  {
    code: 'alligator_crack',
    name: 'Piel de Cocodrilo',
    icon: 'Grid3x3',
    description: 'Patrón de grietas interconectadas que indica falla estructural de la base.',
  },
  {
    code: 'rutting',
    name: 'Ahuellamiento',
    icon: 'Minus',
    description: 'Surcos paralelos en la huella de las ruedas por deformación permanente.',
  },
  {
    code: 'raveling',
    name: 'Disgregación / Peladura',
    icon: 'Layers',
    description: 'Pérdida progresiva del material de la capa de rodadura.',
  },
  {
    code: 'edge_break',
    name: 'Rotura de Borde',
    icon: 'CornerDownRight',
    description: 'Deterioro en los bordes laterales de la calzada.',
  },
  {
    code: 'damaged_sidewalk',
    name: 'Acera Deteriorada',
    icon: 'Footprints',
    description: 'Acera rota, levantada o en condición peligrosa para peatones.',
  },
  {
    code: 'missing_sign',
    name: 'Señalización Faltante / Dañada',
    icon: 'SignpostBig',
    description: 'Señal de tráfico ausente, dañada o ilegible.',
  },
  {
    code: 'faded_marking',
    name: 'Demarcación Vial Borrada',
    icon: 'PenLine',
    description: 'Líneas, pasos peatonales o marcas viales deterioradas o inexistentes.',
  },
  {
    code: 'broken_guardrail',
    name: 'Baranda / Guardarrail Dañado',
    icon: 'Fence',
    description: 'Baranda de protección rota, doblada o ausente.',
  },
  {
    code: 'street_light',
    name: 'Alumbrado Público Deficiente',
    icon: 'Lightbulb',
    description: 'Luminaria apagada, dañada o mal posicionada.',
  },
  {
    code: 'debris',
    name: 'Escombros en Vía',
    icon: 'Trash2',
    description: 'Materiales, escombros u objetos obstruyendo la vía.',
  },
  {
    code: 'tree_damage',
    name: 'Árbol Caído / Peligroso',
    icon: 'TreePine',
    description: 'Árbol caído sobre la vía o con riesgo inminente de caída.',
  },
  {
    code: 'other',
    name: 'Otro Daño Vial',
    icon: 'MoreHorizontal',
    description: 'Daño o incidencia vial no clasificada en las categorías anteriores.',
  },
]

export const DAMAGE_TYPE_MAP: Record<string, DamageType> = Object.fromEntries(
  DAMAGE_TYPES.map((dt) => [dt.code, dt])
)

export function getDamageType(code: string): DamageType | undefined {
  return DAMAGE_TYPE_MAP[code]
}
