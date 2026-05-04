# DIAGRAMA DE FLUJO - CREACIÓN DE PROTECCIÓN (ASEGURAMIENTO)

## 🔄 Flujo Completo de Creación de Protección

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React Next.js 4321)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. AseguramientosPage carga circuitos                                  │
│     └─ apiClient.circuitos.getApagables()                              │
│        → GET /circuitos?apagable=true                                  │
│                                                                          │
│  2. Usuario abre formulario                                             │
│     └─ AseguramientosForm.jsx                                          │
│        ├─ CircuitoCombobox (NUEVO)                                     │
│        │  ├─ Input de búsqueda → filtra circuitos                      │
│        │  └─ Dropdown mostrado: "CircuitoP (id)"                       │
│        ├─ Fecha Inicial (datetime-local)                              │
│        ├─ Fecha Final (datetime-local)                                │
│        ├─ Observaciones (textarea)                                     │
│        ├─ MW (number, opcional)                                        │
│        └─ Tipo (select: Programado/Emergencia/Preventivo)             │
│                                                                          │
│  3. Usuario selecciona opciones y click "Guardar"                      │
│     └─ handleSubmitForm                                                │
│        ├─ Validaciones (fechas, observaciones, circuito)              │
│        └─ crearAseguramiento(datos)                                   │
│           └─ apiClient.aseguramientos.create()  ← DTO VALIDADO ✅    │
│              → POST /rotaciones/aseguramientos                        │
│                                                                          │
└───────────────────────────│────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (NestJS 3000)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /rotaciones/aseguramientos                                            │
│  ├─ @Post()                                                            │
│  │  ├─ Recibe CreateAseguramientoDto                                 │
│  │  ├─ Class-Validator valida tipos ✅                               │
│  │  │  • id_CircuitoP: @IsNumber()                                   │
│  │  │  • CircuitoP: @IsString()                                      │
│  │  │  • fechaInicial: @Type(Date)                                   │
│  │  │  • fechaFinal: @Type(Date)                                    │
│  │  │  • Observaciones: @IsString()                                  │
│  │  │  • tipo: @IsString()                                           │
│  │  │  • mw: @IsOptional() - puede ser null                         │
│  │  └─ Envía NATS: client.send('aseguramientos.create', dto)         │
│  │     → Rotaciones MS                                               │
│  │                                                                     │
│  ├─ @Get()                                                             │
│  │  ├─ Query params: page, pageSize, fecha, circuitoP ✅ (NUEVO)    │
│  │  ├─ Convierte: page → skip/take                                  │
│  │  └─ Envía NATS: client.send('aseguramientos.findAll', {          │
│  │     page, pageSize, fecha, circuitoP                             │
│  │  })                                                                │
│  │                                                                     │
│  └─ Respuestas:                                                       │
│     ├─ POST: { ...aseguramiento creado }                             │
│     └─ GET: { results: [...], meta: { page, totalPages, total } }   │
│                                                                          │
└───────────────────────────│────────────────────────────────────────────┘
                            │
                            ▼
          ─────────────────────────────────
          │  NATS MessageQueue (NATS)  │
          └─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  ROTACIONES MICROSERVICE (NestJS 3003)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  @MessagePattern('aseguramientos.create')                              │
│  ├─ AseguramientosController recibe mensaje                          │
│  └─ AseguramientosService.create(dto)                                │
│     └─ AseguramientosRepository.create({                             │
│        id_CircuitoP, CircuitoP, fechaInicial, fechaFinal,           │
│        Observaciones, tipo, mw                                        │
│     })                                                                 │
│        └─ SQL INSERT:                                                │
│           INSERT INTO ap_Aseguramientos                              │
│           (id_CircuitoP, CircuitoP, fechaInicial, fechaFinal,       │
│            Observaciones, mw, tipo)                                  │
│           VALUES (...)                                               │
│           OUTPUT INSERTED.*                                          │
│                                                                          │
│  @MessagePattern('aseguramientos.findAll')                            │
│  ├─ AseguramientosController recibe: {page, pageSize, fecha, circuitoP}
│  └─ AseguramientosService.findAll(take, skip, fecha, circuitoP ✅)  │
│     └─ AseguramientosRepository.findMany({                           │
│        select: {},                                                   │
│        where: { fecha, circuitoP },  ← FILTRADO ✅                 │
│        take, skip                                                    │
│     })                                                                │
│        └─ Construye WHERE dinámicamente:                            │
│           • if(fecha): agregua condición fecha                      │
│           • if(circuitoP): agrega LIKE '%circuitoP%' ✅             │
│           • if(ambos): combina con AND                             │
│           • else: sin WHERE (historial completo)                   │
│                                                                          │
│        └─ Devuelve: { records: [], total: N }                       │
│           Formatea con paginación en servicio                       │
│                                                                          │
└───────────────────────────│────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │   MSSQL DATABASE     │
                  │  ap_Aseguramientos   │
                  └──────────────────────┘
                           │
                           │ INSERT
                           ▼
                  ┌──────────────────────┐
                  │  Nuevo registro DB   │
                  │  id_CircuitoP: 1     │
                  │  CircuitoP: "NAME"   │
                  │  fechaInicial: ...   │
                  │  fechaFinal: ...     │
                  │  mw: 50.5            │
                  └──────────────────────┘
```

## 📊 Flujo de GET/Listado (con filtrado CircuitoP)

```
Frontend                    API Gateway              Rotaciones MS              Database
   │                           │                         │                        │
   ├─ GET /rotaciones/         │                         │                        │
   │  aseguramientos?          │                         │                        │
   │  page=1&                  │                         │                        │
   │  pageSize=10&             │                         │                        │
   │  fecha=2025-04-17&        │                         │                        │
   │  circuitoP=CIRCUIT         │                         │                        │
   │         ──────────────────>│                         │                        │
   │                            ├─ Validar parámetros    │                        │
   │                            ├─ Convertir:            │                        │
   │                            │  page → skip=(1-1)*10  │                        │
   │                            │  pageSize → take=10    │                        │
   │                            │                        │                        │
   │                            ├─ NATS: send           │                        │
   │                            │  ('aseguramientos.    │                        │
   │                            │   findAll', {          │                        │
   │                            │    page:1,             │                        │
   │                            │    pageSize:10,        │                        │
   │                            │    fecha:'2025-04..',  │                        │
   │                            │    circuitoP:'CIRCUIT' │                        │
   │                            │   })                   │                        │
   │                            │         ──────────────>│                        │
   │                            │                        ├─ Service.findAll()    │
   │                            │                        ├─ Repo.findMany({      │
   │                            │                        │   where: {             │
   │                            │                        │    fecha: <Date>,      │
   │                            │                        │    circuitoP: '...'    │
   │                            │                        │   },                   │
   │                            │                        │   take: 10,            │
   │                            │                        │   skip: 0              │
   │                            │                        │ })                     │
   │                            │                        ├─ Query SQL dinamicaa  │
   │                            │                        │  WHERE:                │
   │                            │                        │   fecha BETWEEN        │
   │                            │                        │   AND                  │
   │                            │                        │   CircuitoP LIKE...    │
   │                            │                        │         ──────────────>│
   │                            │                        │                        ├─ SELECT...
   │                            │                        │                        │  FROM ap_Aseguramientos
   │                            │                        │                        │  WHERE ...
   │                            │                        │                        │  ORDER BY
   │                            │                        │                        │  OFFSET 0
   │                            │                        │                        │  FETCH NEXT 10
   │                            │                        │                        │
   │                            │                        │<──── 10 records ──────┤
   │                            │<──── message result ──┤                        │
   │                            │                        │                        │
   │<── response JSON ──────────┤                        │                        │
   │  {                         │                        │                        │
   │   results: [...],          │                        │                        │
   │   meta: {                  │                        │                        │
   │    page: 1,                │                        │                        │
   │    totalPages: 5,          │                        │                        │
   │    total: 50,              │                        │                        │
   │    pageSize: 10            │                        │                        │
   │   }                        │                        │                        │
   │  }                         │                        │                        │
   │                            │                        │                        │
```

## 🎯 Puntos Clave

### ✅ Combobox (Frontend)
- Input + Dropdown combinado
- Búsqueda en tiempo real
- Formato: "CircuitoP (idCircuitoP)"
- Valida que id_CircuitoP sea numérico

### ✅ DTOs Coherentes
- Todos los campos tienen tipos @IsXXX
- Nombres alineados con BD (CircuitoP, Observaciones)
- mw es opcional (@IsOptional)

### ✅ Filtrado CircuitoP
- Parámetro GET: ?circuitoP=NOMBRE
- Implementado en Controller → Service → Repository
- Usa LIKE para búsqueda parcial
- Se combina dinámicamente con fecha si ambos están presentes

### ✅ Create Implementado
- Repository.create() hace INSERT
- Service.create() mapea DTO
- Retorna registro insertado (OUTPUT INSERTED.*)

