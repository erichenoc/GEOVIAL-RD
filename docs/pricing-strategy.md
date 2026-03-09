# GEOVIAL-RD: Estrategia de Precios SaaS

## 1. Analisis del Mercado Competidor

### Competidores Internacionales

| Producto | Precio Anual | Modelo | Mercado |
|----------|-------------|--------|---------|
| Cartegraph (OpenGov) | $50,000 - $200,000+ USD/ano | Por activos gestionados, 3 tiers | Municipios medianos-grandes USA |
| Trimble Cityworks | $1,995 USD licencia + mantenimiento | Por usuario/modulo | Municipios USA con ArcGIS |
| FixMyStreet Pro (UK) | ~$23,000 USD/ano | Por autoridad local | Gobiernos locales UK |
| SeeClickFix (CivicPlus) | $5,000 - $40,000 USD/ano | Por tamano de municipio | Municipios USA |
| GovPilot | Desde ~$5,000 USD/ano | Por modulo/poblacion | Municipios USA pequenos-medianos |
| iWorQ Systems | $100 - $2,000 USD/mes | Por modulo | ~2,000 gobiernos locales USA/Canada |

### Observaciones Clave

1. **No existe competidor directo en RD/LATAM** para gestion vial municipal. Ventaja competitiva enorme.
2. Competidores internacionales cobran entre $5,000 y $200,000 USD/ano (presupuestos del primer mundo).
3. Modelo mas comun: **por tamano de municipio/poblacion**, no por usuario individual.
4. 82% de municipios prefieren **contratos multi-anuales con precio fijo** (GovTech Navigator).

---

## 2. Realidad Presupuestaria de Municipios en RD

### Datos Financieros Verificados

- **158 municipios + 235 distritos municipales** en RD
- Ayuntamientos reciben ~**RD$26,000 millones** en total (~$433M USD)
- Distribucion por ley: 60% gastos corrientes, 40% gastos de capital
- Transferencias basadas en **tamano de poblacion**
- Inversion estatal en vias 2025: **RD$43,450 millones**
- RD Vial proyecta recaudar **RD$12,400 millones** para obras viales

### Segmentacion por Tamano

| Categoria | Poblacion | Cantidad | Presupuesto Anual | Capacidad TI (1-3%) |
|-----------|-----------|----------|-------------------|---------------------|
| Micro | <15K hab | ~60 | RD$20-50M ($333K-833K USD) | $3,300-$25,000 USD |
| Pequeno | 15K-50K hab | ~55 | RD$50-150M ($833K-2.5M USD) | $8,300-$75,000 USD |
| Mediano | 50K-200K hab | ~30 | RD$150-500M ($2.5M-8.3M USD) | $25,000-$250,000 USD |
| Grande | 200K-500K hab | ~10 | RD$500M-1.5B ($8.3M-25M USD) | $83,000-$750,000 USD |
| Metro | 500K+ hab | ~3 | RD$1.5B+ ($25M+ USD) | $250,000+ USD |

*Tipo de cambio: ~RD$60 = 1 USD (marzo 2026)*

---

## 3. Estructura de Precios

### Modelo: Precio por Municipio (basado en poblacion)

**Por que NO cobrar por usuario:** Los municipios necesitan todos los usuarios posibles usando la plataforma. Cobrar por usuario desincentiva la adopcion. Cobrar por poblacion alinea precio con capacidad de pago y valor recibido.

**Factor de ajuste LATAM:** Precios de competidores USA/UK ajustados con factor 0.15-0.25x para reflejar poder adquisitivo, mercado sin competencia, y estrategia de penetracion.

---

### PLAN BASICO — RD$25,000/mes (~$417 USD)
**Pago anual: RD$240,000/ano (~$4,000 USD) — 20% descuento**

Para municipios pequenos (hasta 50,000 habitantes)

| Incluye | Detalle |
|---------|---------|
| Usuarios | Hasta 10 |
| Zonas territoriales | 1 zona |
| Reportes con foto + GPS | Ilimitados |
| Dashboard basico | KPIs principales |
| Mapa interactivo | Si |
| Historial de estados | Completo |
| Clasificacion de danos | 18 tipos |
| Almacenamiento fotos | 5 GB |
| Soporte | Email (horario laboral) |

**No incluye:** Asignacion de brigadas, mensajeria interna, SLA tracking, exportaciones, API, fotos antes/despues.

---

### PLAN PROFESIONAL — RD$65,000/mes (~$1,083 USD) — RECOMENDADO
**Pago anual: RD$624,000/ano (~$10,400 USD) — 20% descuento**

Para municipios medianos (50,000 - 200,000 habitantes)

| Incluye | Detalle |
|---------|---------|
| Todo del Plan Basico | + |
| Usuarios | Hasta 30 |
| Zonas territoriales | Hasta 5 |
| Asignacion de brigadas | Hasta 10 brigadas |
| Flujo completo | draft → submitted → in_review → approved → in_progress → completed |
| Fotos antes/despues | Rendicion de cuentas |
| Mensajeria interna | Chat + notas de voz |
| SLA tracking | Configurable por severidad |
| Dashboard avanzado | Analitica completa |
| Exportacion PDF/Excel | Ilimitada |
| Activity log | Auditoria completa |
| App movil PWA | Completa |
| Almacenamiento | 25 GB |
| Soporte | Prioritario (telefono + email) |
| Capacitacion | 4 horas incluidas |

---

### PLAN ENTERPRISE — RD$150,000/mes (~$2,500 USD)
**Pago anual: RD$1,440,000/ano (~$24,000 USD) — 20% descuento**

Para municipios grandes y areas metropolitanas (200,000+ habitantes)

| Incluye | Detalle |
|---------|---------|
| Todo del Plan Profesional | + |
| Usuarios | Ilimitados |
| Zonas territoriales | Ilimitadas |
| Brigadas | Ilimitadas |
| API de integracion | Webhooks + REST |
| SSO | Single Sign-On |
| Multi-departamento | Obras Publicas, Planificacion, Alcaldia |
| Dashboard ejecutivo | Personalizado |
| Personalizacion de marca | Logo, colores, dominio propio |
| Almacenamiento | 100 GB+ |
| SLA soporte | Respuesta < 4 horas |
| Gerente de cuenta | Dedicado |
| Capacitacion | Ilimitada + presencial |
| Disponibilidad | 99.9% garantizada |

---

## 4. Add-ons Opcionales

| Add-on | Precio Mensual |
|--------|---------------|
| Usuarios adicionales (bloque de 10) | RD$8,000/mes |
| Almacenamiento adicional (10GB) | RD$3,000/mes |
| Modulo IA (deteccion automatica por foto) | RD$20,000/mes |
| API de datos abiertos (Open Data) | RD$15,000/mes |
| Integracion WhatsApp ciudadano | RD$10,000/mes |

---

## 5. Comparacion de Valor

| Caracteristica | GEOVIAL ($10,400/ano) | SeeClickFix ($15,000+) | Cityworks ($50,000+) | Cartegraph ($100,000+) |
|---------------|----------------------|----------------------|---------------------|----------------------|
| Reportes foto+GPS | Si | Si | Si | Si |
| Mapa interactivo | Si | Si | Si (ArcGIS) | Si |
| Brigadas/ordenes | Si | No | Si | Si |
| Chat interno | Si | No | No | No |
| Notas de voz | Si | No | No | No |
| Division territorial RD | Pre-cargada | No | No | No |
| Espanol nativo | Si | Parcial | Parcial | No |
| SLA tracking | Si | No | Si | Si |
| App movil incluida | Si | Extra | Extra | Extra |
| Implementacion | 2 semanas | 4-8 semanas | 3-6 meses | 3-6 meses |

**GEOVIAL es 5-12x mas barato que la competencia, con funcionalidades superiores para LATAM.**

---

## 6. ROI para el Municipio

Un municipio mediano invirtiendo RD$624,000/ano (~$10,400 USD):

| Concepto | Sin GEOVIAL | Con GEOVIAL | Ahorro |
|----------|------------|-------------|--------|
| Coordinacion (horas perdidas) | $500/mes | $0 | $6,000/ano |
| Reparaciones duplicadas | $2,000/mes | $200/mes | $21,600/ano |
| Rutas no optimizadas | $800/mes | $300/mes | $6,000/ano |
| Perdida de datos/reportes | Inmedible | $0 | Alto |
| Solicitar presupuesto sin datos | Millones perdidos | Datos exactos | Muy alto |

**Ahorro minimo estimado: $33,600 USD/ano**
**Costo GEOVIAL Profesional: $10,400 USD/ano**
**ROI: 3.2x — El costo es menos del 0.5% del presupuesto vial tipico**

---

## 7. Estrategia de Descuentos

| Tipo | Descuento | Condicion |
|------|-----------|-----------|
| Pago anual | 20% (~2.4 meses gratis) | Pago adelantado |
| Contrato bianual | 30% | Compromiso 2 anos |
| Multi-municipio | 15% por municipio adicional | 3+ municipios misma provincia |
| Early adopter | 40% primer ano | Primeros 20 municipios |
| ONG/Cooperacion internacional | 40% | Financiado por organismo |

---

## 8. Go-to-Market

### Fase 1: Primeros 90 dias — Proof of Concept
- **3-5 municipios piloto gratis** (3 meses) para generar casos de exito
- Priorizar: Santiago, SDE, SDN (visibilidad alta)
- Convertir pilotos a Plan Profesional con descuento early adopter

### Fase 2: Meses 4-12 — Expansion RD
- Presentar en **FEDOMU** (Federacion Dominicana de Municipios)
- Alianza con **Liga Municipal Dominicana** como solucion recomendada
- Eventos demo por region (Norte, Sur, Este, Cibao)
- Programa de referidos: municipio que refiere = 1 mes gratis

### Fase 3: Ano 2 — LATAM
- Adaptar division territorial para Colombia, Mexico, Peru, Ecuador
- Alianzas con asociaciones municipales de cada pais
- Precio ajustado por poder adquisitivo local

---

## 9. Proyeccion de Revenue

| Metrica | Ano 1 | Ano 2 | Ano 3 |
|---------|-------|-------|-------|
| Municipios clientes | 10-15 | 30-50 | 80-120 |
| ARPU | ~$8,000 USD | ~$9,000 USD | ~$10,000 USD |
| ARR | $80K-$120K USD | $270K-$450K USD | $800K-$1.2M USD |
| Churn estimado | 10% | 5% | 3% |

---

## 10. Resumen Ejecutivo

| Plan | Poblacion | Usuarios | RD$/mes | USD/mes | USD/ano |
|------|-----------|----------|---------|---------|---------|
| **Basico** | <50K | 10 | 25,000 | ~417 | ~4,000 |
| **Profesional** | 50K-200K | 30 | 65,000 | ~1,083 | ~10,400 |
| **Enterprise** | 200K+ | Ilimitados | 150,000 | ~2,500 | ~24,000 |

---

## Fuentes

- [Cartegraph / OpenGov](https://cartegraph.com/)
- [Trimble Cityworks - Capterra](https://www.capterra.com/p/80839/CityWorks/)
- [FixMyStreet Pro - SocietyWorks](https://www.societyworks.org/services/highways/)
- [CivicPlus SeeClickFix - Capterra](https://www.capterra.com/p/202342/SeeClickFix/)
- [GovPilot Pricing](https://www.govpilot.com/pricing)
- [iWorQ Systems](https://iworq.com/systems/)
- [Inversion en obras viales RD - EHPlus](https://ehplus.do/inversion-en-obras-viales-en-santo-domingo-alcanza-rd6000-millones-en-lo-que-va-de-2025/)
- [Gobierno carreteras 2025 - Diario Libre](https://www.diariolibre.com/politica/gobierno/2026/03/05/cuanto-invirtio-el-gobierno-en-carreteras-en-2025/3459542)
- [RD Vial proyecciones - Diario Libre](https://www.diariolibre.com/actualidad/nacional/2025/12/26/fideicomiso-rd-vial-proyecta-recaudar-rd-12400-millones-en-2025/3387574)
- [Participaciones ayuntamientos - CEPAL](https://plataformaurbana.cepal.org/es/instrumentos/financiamiento/participaciones-de-los-ayuntamientos)
- [Transferencias a Ayuntamientos - Digepres](https://www.digepres.gob.do/)
- [Tipo de cambio - Banco Central RD](https://www.bancentral.gov.do/)
