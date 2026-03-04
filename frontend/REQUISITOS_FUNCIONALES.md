# Requisitos Funcionales y No Funcionales del Sistema
## Sistema de Gestión de Rotación de Circuitos Eléctricos (SGRC)

---

## 📋 Tabla de Contenidos

1. [Requisitos Funcionales](#requisitos-funcionales)
   - [Gestión de Seguridad](#gestión-de-seguridad)
   - [Gestión de Usuarios](#gestión-de-usuarios)
   - [Gestión de Circuitos](#gestión-de-circuitos)
   - [Gestión de Rotación](#gestión-de-rotación)
   - [Gestión de Aseguramientos](#gestión-de-aseguramientos)
   - [Reportes y Exportación](#reportes-y-exportación)
   - [Dashboard y Monitoreo](#dashboard-y-monitoreo)
2. [Requisitos No Funcionales](#requisitos-no-funcionales)

---

# Requisitos Funcionales

## Gestión de Seguridad

### RF-001: Autenticar usuarios mediante credenciales
**Descripción:** El sistema debe permitir que los usuarios inicien sesión proporcionando usuario y contraseña.
**Actor:** Usuario del sistema
**Precondición:** Usuario registrado en el sistema
**Flujo principal:**
1. El usuario accede a la pantalla de login
2. Ingresa su usuario/correo y contraseña
3. El sistema valida las credenciales contra la base de datos
4. Si son correctas, se crea una sesión autenticada
**Postcondición:** Usuario autenticado y con acceso a funcionalidades según su rol

### RF-002: Cerrar sesión del usuario
**Descripción:** El sistema debe permitir que un usuario autenticado cierre su sesión activa.
**Actor:** Usuario autenticado
**Precondición:** Usuario con sesión activa
**Flujo principal:**
1. Usuario hace clic en la opción "Cerrar sesión"
2. Sistema invalida el token/sesión del usuario
3. Usuario es redirigido a la pantalla de login
**Postcondición:** Sesión cerrada y acceso eliminado

### RF-003: Validar credenciales contra base de datos legacy
**Descripción:** El sistema debe validar las credenciales del usuario contra la tabla `usuarios` en SQL Server 2008.
**Actor:** Sistema (automático)
**Precondición:** Sistema conectado a la base de datos
**Flujo principal:**
1. Backend recibe credenciales del frontend
2. Consulta base de datos para obtener usuario
3. Compara contraseña encriptada
4. Retorna resultado de validación
**Postcondición:** Validación completada

### RF-004: Verificar actividad y estado del usuario
**Descripción:** El sistema debe verificar que el usuario esté activo antes de permitir el acceso.
**Actor:** Sistema
**Precondición:** Credenciales válidas
**Flujo principal:**
1. Tras validar credenciales, sistema verifica campo `activo`
2. Si `activo = true`, permite acceso
3. Si `activo = false`, rechaza acceso y notifica
**Postcondición:** Acceso concedido solo a usuarios activos

### RF-005: Asignar rol al usuario autenticado
**Descripción:** El sistema debe asignar automáticamente el rol del usuario tras autenticación.
**Actor:** Sistema
**Precondición:** Usuario autenticado
**Flujo principal:**
1. Sistema obtiene el rol del usuario de la BD
2. Rol puede ser: 'Administrador' o 'Operador'
3. Rol se asigna a la sesión del usuario
**Postcondición:** Rol asignado a la sesión

---

## Gestión de Usuarios

### RF-006: Crear nuevo perfil de usuario
**Descripción:** El sistema debe permitir a administradores crear nuevos perfiles de usuario en el sistema.
**Actor:** Administrador
**Precondición:** Usuario autenticado con rol Administrador
**Flujo principal:**
1. Administrador accede a módulo de gestión de usuarios
2. Completa formulario con: nombre, usuario, contraseña, rol
3. Sistema valida que el usuario sea único
4. Contraseña se encripta antes de almacenar
5. Registro se guarda en base de datos
**Postcondición:** Nuevo usuario disponible en el sistema

### RF-007: Editar perfil de usuario existente
**Descripción:** El sistema debe permitir a administradores modificar datos de usuarios existentes.
**Actor:** Administrador
**Precondición:** Usuario a editar existe en el sistema
**Flujo principal:**
1. Administrador selecciona usuario de la lista
2. Modifica campos permitidos (nombre, rol, estado activo)
3. Sistema valida cambios
4. Cambios se guardan en la base de datos
**Postcondición:** Usuario actualizado

### RF-008: Despactivar usuario del sistema
**Descripción:** El sistema debe permitir a administradores desactivar usuarios sin eliminar sus registros históricos.
**Actor:** Administrador
**Precondición:** Usuario existe en el sistema
**Flujo principal:**
1. Administrador selecciona usuario
2. Ejecuta acción "Desactivar usuario"
3. Campo `activo` del usuario se establece en `false`
4. Usuario no podrá iniciar sesión
5. Historial de acciones del usuario se preserva
**Postcondición:** Usuario inactivo, historial preservado

### RF-009: Eliminar perfil de usuario
**Descripción:** El sistema debe permitir a administradores eliminar perfiles de usuario del sistema.
**Actor:** Administrador
**Precondición:** Usuario existe en el sistema
**Flujo principal:**
1. Administrador selecciona usuario a eliminar
2. Sistema solicita confirmación de eliminación
3. Registro se elimina de la tabla `usuarios`
**Postcondición:** Usuario eliminado del sistema

### RF-010: Listar todos los usuarios del sistema
**Descripción:** El sistema debe mostrar un listado completo de usuarios registrados.
**Actor:** Administrador
**Precondición:** Autenticado como Administrador
**Flujo principal:**
1. Administrador accede a módulo de gestión de usuarios
2. Sistema consulta tabla `usuarios` en base de datos
3. Muestra lista con: nombre, usuario, rol, estado activo, fecha de creación
4. Permite filtrar por rol o estado
**Postcondición:** Listado disponible

### RF-011: Cambiar rol de usuario
**Descripción:** El sistema debe permitir cambiar el rol de un usuario entre Administrador y Operador.
**Actor:** Administrador
**Precondición:** Usuario existe y está autenticado como Administrador
**Flujo principal:**
1. Administrador selecciona usuario
2. Modifica el campo rol (Admin ↔ Operador)
3. Cambio se guarda en la base de datos
4. Cambios toman efecto en la próxima sesión del usuario
**Postcondición:** Rol actualizado

---

## Gestión de Circuitos

### RF-012: Visualizar listado de circuitos eléctricos
**Descripción:** El sistema debe mostrar un listado completo de circuitos eléctricos disponibles.
**Actor:** Operador / Administrador
**Precondición:** Usuario autenticado
**Flujo principal:**
1. Usuario accede al módulo de circuitos
2. Sistema consulta tabla `circuitos` de la base de datos
3. Muestra columnas: código, número, bloque, zona, carga (MW), estado, clientes
4. Datos se cargan en tiempo real
**Postcondición:** Listado visible en pantalla

### RF-013: Visualizar variables en tiempo real de circuito
**Descripción:** El sistema debe mostrar las variables operacionales actuales de cada circuito.
**Actor:** Operador / Administrador
**Precondición:** Circuito existe en base de datos
**Flujo principal:**
1. Usuario selecciona un circuito del listado
2. Sistema consulta los datos del circuito
3. Muestra en tiempo real: estado, carga MW, MWh, clientes afectados, tiempo transcurrido si está apagado
**Postcondición:** Variables visibles

### RF-014: Filtrar circuitos por bloque
**Descripción:** El sistema debe permitir filtrar el listado de circuitos por número de bloque.
**Actor:** Operador / Administrador
**Precondición:** Listado de circuitos disponible
**Flujo principal:**
1. Usuario selecciona filtro "Bloque"
2. Ingresa o selecciona número de bloque
3. Sistema muestra solo circuitos del bloque seleccionado
**Postcondición:** Lista filtrada

### RF-015: Filtrar circuitos por estado
**Descripción:** El sistema debe permitir filtrar circuitos según su estado operacional.
**Actor:** Operador / Administrador
**Precondición:** Listado de circuitos disponible
**Flujo principal:**
1. Usuario selecciona filtro "Estado"
2. Puede elegir: Apagado, Servicio, Asegurado
3. Sistema filtra circuitos según estado seleccionado
**Postcondición:** Listado filtrado por estado

### RF-016: Filtrar circuitos por zona geográfica
**Descripción:** El sistema debe permitir filtrar circuitos según su zona de operación.
**Actor:** Operador / Administrador
**Precondición:** Listado de circuitos disponible
**Flujo principal:**
1. Usuario selecciona filtro "Zona"
2. Selecciona zona del listado desplegable
3. Sistema muestra solo circuitos de esa zona
**Postcondición:** Circuitos de zona específica visibles

### RF-017: Visualizar localización de circuitos en mapa
**Descripción:** El sistema debe mostrar la ubicación geográfica de los circuitos en un mapa interactivo.
**Actor:** Operador / Administrador
**Precondición:** Circuitos con coordenadas disponibles en base de datos
**Flujo principal:**
1. Usuario accede a vista de mapa
2. Sistema consulta coordenadas (latitud, longitud) de circuitos
3. Renderiza marcadores en mapa interactivo
4. Código de circuito visible en cada marcador
**Postcondición:** Mapa con circuitos visibles

### RF-018: Actualizar estado manual de circuito
**Descripción:** El sistema debe permitir actualizar manualmente el estado de un circuito cuando sea necesario.
**Actor:** Operador / Administrador
**Precondición:** Usuario autenticado, circuito existe
**Flujo principal:**
1. Usuario selecciona circuito
2. Modifica estado (Apagado → Servicio o viceversa)
3. Sistema registra la actualización con timestamp
4. Se registra quién realizó el cambio
**Postcondición:** Estado del circuito actualizado

---

## Gestión de Rotación

### RF-019: Registrar excepción operativa en circuito
**Descripción:** El sistema debe permitir registrar excepciones operacionales (averías, mantenimientos) en circuitos.
**Actor:** Operador / Administrador
**Precondición:** Circuito existe
**Flujo principal:**
1. Usuario selecciona opción "Registrar Excepción"
2. Completa formulario: circuito, tipo de excepción, descripción, fecha/hora
3. Sistema valida información
4. Excepción se almacena en base de datos
**Postcondición:** Excepción registrada

### RF-020: Calcular orden de rotación automático
**Descripción:** El sistema debe calcular automáticamente el orden de rotación basado en el algoritmo de déficit de generación.
**Actor:** Sistema (automático con disparador manual del operador)
**Precondición:** Valor de déficit generación ingresado, circuitos disponibles
**Flujo principal:**
1. Operador ingresa valor de déficit en MW
2. Sistema ejecuta algoritmo de rotación considerando:
   - Carga de cada circuito (MW)
   - Estado actual del circuito
   - Circuitos asegurados (excluir de rotación)
   - Orden histórico de rotación
3. Sistema genera propuesta de orden de afectación
4. Propuesta se muestra al operador
**Postcondición:** Orden de rotación generada

### RF-021: Visualizar propuesta de rotación generada
**Descripción:** El sistema debe mostrar la propuesta de rotación calculada por el algoritmo.
**Actor:** Operador
**Precondición:** Orden de rotación calculada
**Flujo principal:**
1. Tras ejecutar cálculo, propuesta aparece en pantalla
2. Muestra circuitos en orden de afectación
3. Indica MW que se afectarían con cada circuito
4. Muestra resumen: total MW a afectar, circuitos implicados
**Postcondición:** Propuesta visible para análisis

### RF-022: Modificar manualmente orden de rotación
**Descripción:** El sistema debe permitir que el operador ajuste manualmente la propuesta generada.
**Actor:** Operador / Administrador
**Precondición:** Propuesta de rotación generada
**Flujo principal:**
1. Operador puede reordenar circuitos en la propuesta
2. Puede añadir o remover circuitos de la lista
3. Sistema actualiza totales de MW en tiempo real
4. Cambios son registrados pero NO ejecutados
**Postcondición:** Propuesta modificada

### RF-023: Generar orden de afectación (apagado) de circuitos
**Descripción:** El sistema debe generar la orden ejecutable de apagado de circuitos.
**Actor:** Operador / Administrador
**Precondición:** Propuesta de rotación aprobada por operador
**Flujo principal:**
1. Operador aprueba propuesta de rotación
2. Sistema genera orden con: secuencia de circuitos, tiempo de ejecución, responsable
3. Orden se registra en tabla de historial con timestamp
4. Estado de circuitos afectados se actualiza a "Apagado"
**Postcondición:** Orden de afectación ejecutada y registrada

### RF-024: Generar orden de restablecimiento de circuitos
**Descripción:** El sistema debe generar la orden para restablecer circuitos apagados.
**Actor:** Operador / Administrador
**Precondición:** Circuitos en estado "Apagado"
**Flujo principal:**
1. Operador selecciona circuitos a restablecer
2. Sistema genera orden inversa de restablecimiento
3. Orden previene restablecimiento simultáneo (evita picos)
4. Se registra con timestamp y responsable
**Postcondición:** Orden de restablecimiento registrada

### RF-025: Simular escenarios de rotación
**Descripción:** El sistema debe permitir simular diferentes escenarios de déficit sin ejecutar cambios reales.
**Actor:** Operador / Administrador
**Precondición:** Autenticado
**Flujo principal:**
1. Usuario accede a modo "Simulación"
2. Ingresa hipotético déficit en MW
3. Sistema calcula rotación SIN alterar circuitos reales
4. Muestra resultados de simulación
5. Usuario puede explorar múltiples escenarios
**Postcondición:** Simulación completada sin afectar sistema real

### RF-026: Registrar historial de rotaciones ejecutadas
**Descripción:** El sistema debe mantener un registro completo de todas las rotaciones realizadas.
**Actor:** Sistema (automático)
**Precondición:** Orden de rotación ejecutada
**Flujo principal:**
1. Tras ejecutar rotación, sistema crea registro en tabla `rotaciones`
2. Datos: fecha/hora, circuitos apagados, responsable, déficit, aprobación
3. Registro vinculado a usuario que ejecutó
**Postcondición:** Historial registrado

---

## Gestión de Aseguramientos

### RF-027: Registrar aseguramiento permanente de circuito
**Descripción:** El sistema debe permitir registrar aseguramientos permanentes de circuitos que no deben ser apagados.
**Actor:** Operador / Administrador
**Precondición:** Circuito existe
**Flujo principal:**
1. Usuario selecciona opción "Crear Aseguramiento"
2. Selecciona circuito y tipo "Permanente"
3. Ingresa motivo (ej: Hospital Provincial, Estación de Bomberos)
4. Sistema registra aseguramiento en tabla `aseguramientos`
5. Circuito queda excluido de futuras rotaciones
**Postcondición:** Aseguramiento permanente activo

### RF-028: Registrar aseguramiento temporal de circuito
**Descripción:** El sistema debe permitir registrar aseguramientos temporales activos en horarios específicos.
**Actor:** Operador / Administrador
**Precondición:** Circuito existe
**Flujo principal:**
1. Usuario selecciona opción "Crear Aseguramiento"
2. Selecciona circuito y tipo "Temporal"
3. Ingresa: motivo, horario de inicio, horario de fin
4. Sistema registra con validación de horarios
5. Exclusión de rotación solo durante horario especificado
**Postcondición:** Aseguramiento temporal activo

### RF-029: Modificar aseguramiento existente
**Descripción:** El sistema debe permitir editar datos de un aseguramiento registrado.
**Actor:** Operador / Administrador
**Precondición:** Aseguramiento existe
**Flujo principal:**
1. Usuario selecciona aseguramiento de lista
2. Modifica: motivo, horarios (si es temporal), o tipo
3. Sistema valida cambios
4. Cambios se guardan con nuevo timestamp
**Postcondición:** Aseguramiento actualizado

### RF-030: Desactivar aseguramiento
**Descripción:** El sistema debe permitir desactivar un aseguramiento sin eliminarlo del historial.
**Actor:** Operador / Administrador
**Precondición:** Aseguramiento activo existe
**Flujo principal:**
1. Usuario selecciona aseguramiento
2. Ejecuta acción "Desactivar"
3. Campo `activo` se establece en `false`
4. Circuito vuelve a ser rotable
5. Historial se preserva
**Postcondición:** Aseguramiento inactivo

### RF-031: Listar aseguramientos activos
**Descripción:** El sistema debe mostrar listado de todos los aseguramientos activos en el sistema.
**Actor:** Operador / Administrador
**Precondición:** Autenticado
**Flujo principal:**
1. Usuario accede a módulo de aseguramientos
2. Sistema consulta tabla `aseguramientos` con filtro `activo = true`
3. Muestra: circuito, motivo, tipo, horarios (si aplica)
4. Permite filtrar por tipo
**Postcondición:** Listado visible

### RF-032: Validar aseguramientos en cálculo de rotación
**Descripción:** El sistema debe excluir automáticamente circuitos asegurados del cálculo de rotación.
**Actor:** Sistema (automático)
**Precondición:** Cálculo de rotación iniciado, aseguramientos registrados
**Flujo principal:**
1. Sistema ejecuta algoritmo de rotación
2. Antes de incluir circuito, verifica si tiene aseguramiento activo
3. Si horario actual está en rango de aseguramiento, excluye circuito
4. Si es permanente, siempre excluye
**Postcondición:** Lógica de validación aplicada

---

## Reportes y Exportación

### RF-033: Generar reporte de rotaciones por periodo
**Descripción:** El sistema debe permititr generar reportes históricos de rotaciones realizadas en un periodo específico.
**Actor:** Operador / Administrador
**Precondición:** Autenticado
**Flujo principal:**
1. Usuario accede a módulo de reportes
2. Selecciona: fecha inicial, fecha final
3. Sistema consulta tabla `rotaciones` en el rango
4. Consolida: circuitos afectados, fechas, responsables, déficit
5. Muestra reporte en pantalla
**Postcondición:** Reporte generado

### RF-034: Exportar reporte a formato PDF
**Descripción:** El sistema debe permitir descargar reportes en formato PDF.
**Actor:** Operador / Administrador
**Precondición:** Reporte generado en pantalla
**Flujo principal:**
1. Usuario hace clic en botón "Exportar PDF"
2. Sistema genera documento PDF con datos del reporte
3. Incluye: título, fecha de generación, datos tabulados, resumen
4. Archivo se descarga al dispositivo del usuario
**Postcondición:** Archivo PDF descargado

### RF-035: Exportar reporte a formato Excel
**Descripción:** El sistema debe permitir descargar reportes en formato Excel.
**Actor:** Operador / Administrador
**Precondición:** Reporte generado en pantalla
**Flujo principal:**
1. Usuario hace clic en botón "Exportar Excel"
2. Sistema genera archivo .xlsx con datos del reporte
3. Estructura: encabezados, datos por fila, resumen
4. Archivo se descarga al dispositivo del usuario
**Postcondición:** Archivo Excel descargado

### RF-036: Generar reporte de aseguramientos
**Descripción:** El sistema debe generar reportes sobre aseguramientos registrados.
**Actor:** Operador / Administrador
**Precondición:** Autenticado
**Flujo principal:**
1. Usuario accede a reportes de aseguramientos
2. Puede filtrar por: tipo (permanente/temporal), estado, circuito
3. Sistema consolida datos: circuito, motivo, tipo, vigencia, responsable
4. Genera reporte exportable
**Postcondición:** Reporte de aseguramientos disponible

### RF-037: Generar estadísticas de deficit y afectaciones
**Descripción:** El sistema debe generar reportes con estadísticas agregadas de déficit y circuitos afectados.
**Actor:** Operador / Administrador
**Precondición:** Histórico de rotaciones disponible
**Flujo principal:**
1. Sistema analiza histórico de rotaciones
2. Calcula: promedio de déficit, total de afectaciones, MW promedio afectado
3. Genera gráficos y tablas comparativas
4. Permite agrupar por período (día, semana, mes)
**Postcondición:** Estadísticas disponibles

---

## Dashboard y Monitoreo

### RF-038: Mostrar estado actual del sistema en dashboard
**Descripción:** El sistema debe mostrar indicadores resumidos del estado operacional en un dashboard principal.
**Actor:** Operador / Administrador
**Precondición:** Autenticado
**Flujo principal:**
1. Usuario accede a dashboard
2. Sistema consulta datos actuales de:
   - Deficit actual en MW
   - MW afectados en este momento
   - MW asegurados
   - Cantidad de alertas activas
3. Muestra indicadores en tarjetas resumidas
**Postcondición:** Dashboard visible

### RF-039: Mostrar indicador de déficit de generación
**Descripción:** El sistema debe mostrar un indicador destacado del déficit de generación actual.
**Actor:** Operador / Administrador
**Precondición:** Dashboard cargado
**Flujo principal:**
1. Indicador muestra valor actual en MW
2. Código de color: verde (normal), amarillo (alerta), rojo (crítico)
3. Actualiza en tiempo real
4. Permite ingreso manual del valor
**Postcondición:** Indicador visible

### RF-040: Mostrar indicador de MW afectados
**Descripción:** El sistema debe mostrar cuántos MW están actualmente apagados.
**Actor:** Operador / Administrador
**Precondición:** Dashboard cargado
**Flujo principal:**
1. Indicador sumatoriza carga (MW) de todos los circuitos en estado "Apagado"
2. Actualiza automáticamente con cambios de estado
3. Comparación visual con déficit requerido
**Postcondición:** Indicador visible

### RF-041: Mostrar indicador de MW asegurados
**Descripción:** El sistema debe mostrar cuántos MW están protegidos por aseguramientos.
**Actor:** Operador / Administrador
**Precondición:** Dashboard cargado
**Flujo principal:**
1. Indicador sumatoriza carga (MW) de circuitos con aseguramiento activo
2. Diferencia entre aseguramientos permanentes y temporales
3. Actualiza en tiempo real
**Postcondición:** Indicador visible

### RF-042: Mostrar contador de alertas activas
**Descripción:** El sistema debe mostrar cantidad de alertas o eventos que requieren atención.
**Actor:** Operador / Administrador
**Precondición:** Dashboard cargado
**Flujo principal:**
1. Sistema cuenta: circuitos con excepciones, aseguramientos por vencer, etc.
2. Muestra contador en dashboard
3. Enlace directo a detalle de alertas
**Postcondición:** Contador visible

### RF-043: Mostrar estado general del sistema
**Descripción:** El sistema debe mostrar un indicador resumido del estado operacional general.
**Actor:** Operador / Administrador
**Precondición:** Dashboard cargado
**Flujo principal:**
1. Sistema evalúa: déficit, MW afectados, aseguramientos
2. Clasifica estado: "Normal", "Alerta", "Crítico"
3. Lógica: Crítico si déficit > MW disponibles para afectar
4. Muestra con icono y color visual prominente
**Postcondición:** Estado general visible

### RF-044: Mostrar gráfico histórico de déficit (últimas 24 horas)
**Descripción:** El sistema debe mostrar una gráfica de tendencia del déficit en las últimas 24 horas.
**Actor:** Operador / Administrador
**Precondición:** Datos históricos disponibles
**Flujo principal:**
1. Sistema consulta datos de déficit con frecuencia horaria
2. Renderiza gráfico de línea con eje X (tiempo) e Y (MW de déficit)
3. Permite filtrar período (24h, 7d, 30d)
**Postcondición:** Gráfico visible

### RF-045: Mostrar gráfico de MW afectados vs deficit
**Descripción:** El sistema debe mostrar comparativa visual entre MW del déficit y MW actualmente afectados.
**Actor:** Operador / Administrador
**Precondición:** Dashboard cargado
**Flujo principal:**
1. Gráfico de comparación (barras o líneas)
2. Serie 1: MW déficit requerido
3. Serie 2: MW real afectado
4. Visualiza diferencia/equilibrio operacional
**Postcondición:** Gráfico visible

---

# Requisitos No Funcionales

## Usabilidad (RNF-001 a RNF-005)

### RNF-001: Interfaz intuitiva para operadores
**Descripción:** La interfaz debe ser clara y fácil de usar para operadores sin experiencia técnica profunda en sistemas.
**Métrica:** Usuarios nuevos deben completar operaciones básicas en menos de 5 minutos sin entrenamiento.
**Implementación:** Diseño con React, componentes predefinidos, guías contextuales.

### RNF-002: Diseño responsivo
**Descripción:** El sistema debe ser accesible desde dispositivos de diferentes tamaños (desktop, tablet).
**Métrica:** Funcionalidad completa en pantallas de 800px a 2560px de ancho.
**Implementación:** Tailwind CSS con sistema de grid responsivo.

### RNF-003: Accesibilidad WCAG
**Descripción:** La interfaz debe cumplir estándares de accesibilidad WCAG 2.1 nivel AA.
**Métrica:** Navegación completa con teclado, contraste suficiente, etiquetas ARIA.
**Implementación:** Validación de contrastes, navegación por Tab, roles semánticos.

### RNF-004: Mensajes de error claros
**Descripción:** Todos los mensajes de error deben ser comprensibles y accionables para el usuario.
**Métrica:** Cada error incluye: qué salió mal, por qué y cómo solucionarlo.
**Implementación:** Modal/Toast con mensajes contextuales.

### RNF-005: Confirmación de acciones críticas
**Descripción:** Acciones que alteren datos críticos requieren confirmación explícita del usuario.
**Métrica:** Confirmar: crear/editar/eliminar usuarios, ejecutar rotación, eliminar aseguramientos.
**Implementación:** Modal de confirmación antes de operación.

---

## Disponibilidad (RNF-006 a RNF-008)

### RNF-006: Acceso a través de intranet corporativa
**Descripción:** El sistema debe ser accesible solo a través de la red local corporativa.
**Métrica:** Sistema disponible 24/7 en red 10.0.0.0/24.
**Implementación:** Deployment en servidor interno, sin acceso externo.

### RNF-007: Disponibilidad del servicio
**Descripción:** El sistema debe estar disponible con 99% de uptime durante jornada laboral.
**Métrica:** Máximo 43 minutos de inactividad por mes.
**Implementación:** Health checks, auto-restart de procesos críticos.

### RNF-008: Tiempo de respuesta de consultas
**Descripción:** Todas las consultas deben responderse en menos de 2 segundos.
**Métrica:** P95 < 2s, P99 < 5s.
**Implementación:** Índices en BD, caché de resultados frecuentes.

---

## Seguridad (RNF-009 a RNF-015)

### RNF-009: Encriptación de contraseñas
**Descripción:** Las contraseñas deben almacenarse encriptadas usando estándar bcrypt.
**Métrica:** Salt length ≥ 10, cost factor ≥ 10.
**Implementación:** Librería bcrypt en NestJS, nunca almacenar en texto plano.

### RNF-010: Validación de entrada
**Descripción:** Todas las entradas del usuario deben validarse en frontend y backend.
**Métrica:** Tipos de dato, longitud, caracteres especiales, format
**Implementación:** Validadores en formularios React, reglas en servidor NestJS.

### RNF-011: Protección de rutas
**Descripción:** Las rutas del sistema deben estar protegidas por autenticación y autorización.
**Métrica:** Solo usuarios autenticados acceden a /app/*, rutas admin solo para rol Admin.
**Implementación:** Middleware de autenticación, verificación de rol en cada ruta.

### RNF-012: Prevención de SQL Injection
**Descripción:** Todas las consultas a BD deben usar prepared statements.
**Métrica:** 100% de consultas parametrizadas, sin string concatenation.
**Implementación:** ORM TypeORM en NestJS, nunca raw queries con interpolación.

### RNF-013: Gestión de sesiones seguras
**Descripción:** Las sesiones deben expirar automáticamente tras inactividad.
**Métrica:** Sesiones expiran tras 30 minutos de inactividad.
**Implementación:** Token JWT con expiración, refresh token.

### RNF-014: Auditoría de acciones críticas
**Descripción:** Todas las acciones que modifiquen datos deben registrarse con usuario y timestamp.
**Métrica:** Quién, qué, cuándo para: crear/editar/eliminar usuarios, ejecutar/anular rotación.
**Implementación:** Tabla de auditoría, middleware de logging.

### RNF-015: Privacidad de datos
**Descripción:** Los datos de usuarios no deben exponerse innecesariamente.
**Métrica:** Contraseñas nunca en logs, datos sensibles no en URLs.
**Implementación:** Sanitización de logs, validación de parámetros.

---

## Rendimiento (RNF-016 a RNF-019)

### RNF-016: Carga inicial rápida
**Descripción:** El sistema debe cargar completamente en menos de 3 segundos.
**Métrica:** Tiempo hasta interactividad < 3s, First Contentful Paint < 1.5s.
**Implementación:** Code splitting en React, lazy loading de componentes, optimización de assets.

### RNF-017: Manejo eficiente de listados grandes
**Descripción:** Listados con más de 1000 registros deben ser rápidos.
**Métrica:** Scroll suave, búsqueda < 500ms, paginación.
**Implementación:** Virtualización de listas, limit en consultas (paginar backend).

### RNF-018: Cálculos de algoritmo de rotación
**Descripción:** El algoritmo de rotación debe calcular en tiempo razonable.
**Métrica:** Cálculo para 500 circuitos < 2 segundos.
**Implementación:** Optimización de lógica iterativa, uso eficiente de estructuras de datos.

### RNF-019: Sincronización de datos
**Descripción:** Cambios en BD deben reflejarse sin necesidad de recargar página.
**Métrica:** Actualización máximo 5 segundos tras cambio.
**Implementación:** Polling o websockets, state management en React.

---

## Compatibilidad (RNF-020 a RNF-022)

### RNF-020: Base de datos legacy SQL Server 2008
**Descripción:** Sistema debe conectarse y operar con BD SQL Server 2008 sin migración forzada.
**Métrica:** 100% de operaciones CRUD funcionales, respeto a schemas existentes.
**Implementación:** Conexión ODBC/SQL Native Client, ORM compatible, sin use de features de versiones posteriores.

### RNF-021: Navegadores soportados
**Descripción:** Sistema debe funcionar en versiones recientes de Chrome y Edge.
**Métrica:** Funcionalidad completa en Chrome 90+, Edge 90+; Firefox 88+.
**Implementación:** No usar APIs experimentales, polyfills si es necesario.

### RNF-022: Diferentes resoluciones de pantalla
**Descripción:** Sistema debe funcionar en resoluciones desde 1280x720 hasta 4K.
**Métrica:** Interfaz usable sin scroll horizontal, escalado automático.
**Implementación:** CSS responsivo, media queries, viewport dinámico.

---

## Mantenibilidad (RNF-023 a RNF-026)

### RNF-023: Código estructurado y modular
**Descripción:** El código debe estar organizado en módulos independientes, reutilizables.
**Métrica:** Máximo 300 líneas por componente, servicios separados por dominio.
**Implementación:** Estructura carpetas por feature, componentes pequeños, servicios en lib/.

### RNF-024: Documentación de código
**Descripción:** Funciones y componentes complejos deben contar con documentación.
**Métrica:** 100% de funciones públicas documentadas, README actualizado.
**Implementación:** Comentarios JSDoc, archivo README.md por módulo.

### RNF-025: Facilidad de extensión
**Descripción:** Nueva funcionalidad debe poder agregarse sin modificar código existente.
**Métrica:** Agregar un nuevo rol debe requerir cambios en máximo 3 archivos.
**Implementación:** Patrones de diseño (Factory, Strategy), configuración centralizada.

### RNF-026: Versionamiento
**Descripción:** El proyecto debe usar versionamiento Git con commits descriptivos.
**Métrica:** Commits atómicos, mensajes claros (fix: ..., feat: ...).
**Implementación:** Workflow Git, conventional commits.

---

## Interoperabilidad (RNF-027 a RNF-030)

### RNF-027: Conexión confiable con BD legacy
**Descripción:** Conexión a SQL Server debe ser robusta ante desconexiones.
**Métrica:** Reintento automático, logging de fallos, alertas si BD no disponible.
**Implementación:** Connection pooling, retry logic en NestJS, middlewares de error.

### RNF-028: Conversión de tipos de datos
**Descripción:** Tipos de datos entre JavaScript y SQL Server deben convertirse automáticamente.
**Métrica:** Decimales, dates, booleans mapean correctamente sin pérdida.
**Implementación:** Transformadores en ORM, validadores de tipo.

### RNF-029: Transacciones ACID
**Descripción:** Operaciones críticas deben garantizar integridad con transacciones.
**Métrica:** Crear usuario + historial = operación atómica, sin datos inconsistentes.
**Implementación:** Transacciones en NestJS, rollback automático en error.

### RNF-030: API consistente
**Descripción:** Todos los endpoints deben seguir convenciones REST consistentes.
**Métrica:** Estructura respuestas uniforme, códigos HTTP correctos, documentación OpenAPI.
**Implementación:** Swagger en NestJS, middleware de respuesta estándar.

---

## Infraestructura (RNF-031 a RNF-032)

### RNF-031: Stack tecnológico especificado
**Descripción:** Proyecto debe usar tecnologías especificadas sin variaciones forzadas.
**Detalle:**
- **Frontend:** React 18+, Next.js
- **Backend:** NestJS, TypeScript
- **BD:** SQL Server 2008
- **Estilos:** Tailwind CSS
- **Package Manager:** npm

### RNF-032: Variables de entorno
**Descripción:** Configuración debe externalizar según ambiente (dev, prod).
**Métrica:** `.env` para desarrollo, variables de sistema para producción.
**Contenido:** URL BD, puertos, claves secretas, URLs internas/externas.

---

## Escalabilidad (RNF-033)

### RNF-033: Preparación para crecimiento futuro
**Descripción:** Sistema debe ser escalable para soportar crecimiento de usuarios y datos.
**Métrica:** 
- Arquitectura soporta hasta 1000 usuarios concurrentes
- Índices en BD permiten agregación rápida de datos
- API preparada para microservicios en futuro
**Implementación:** Diseño con separación de concerns, caché estratégico, logging para análisis.

---

## Cumplimiento (RNF-034)

### RNF-034: Conformidad con regulaciones de energía
**Descripción:** Sistema debe cumplir regulaciones locales sobre operación de sistemas eléctricos.
**Métrica:** Auditoría completa, rastreo de cambios críticos, reports para reguladores si aplica.
**Implementación:** Sistema de logs detallado, exportación de reportes, retención de datos según reglamento.

---

## Tabla Resumen

| Tipo de Requisito | Cantidad | Cobertura |
|---|---|---|
| **RF - Gestión de Seguridad** | 5 | Autenticación, cierre de sesión, validación BD, verificación de estado, asignación de rol |
| **RF - Gestión de Usuarios** | 6 | Crear, editar, desactivar, eliminar, listar, cambiar rol |
| **RF - Gestión de Circuitos** | 7 | Visualizar, filtrar (bloque, estado, zona), mapa, actualizar estado |
| **RF - Gestión de Rotación** | 8 | Registrar excepciones, calcular automático, visualizar, modificar, generar órdenes, simular, historial |
| **RF - Gestión de Aseguramientos** | 6 | Permanentes, temporales, modificar, desactivar, listar, validación en rotación |
| **RF - Reportes y Exportación** | 5 | Por período, PDF, Excel, aseguramientos, estadísticas |
| **RF - Dashboard y Monitoreo** | 8 | Estado general, déficit, MW afectados, asegurados, alertas, gráficos históricos |
| **TOTAL Requisitos Funcionales** | **45** | Sistema completo documentado |
| **RNF** | **34** | Usabilidad, Disponibilidad, Seguridad, Rendimiento, Compatibilidad, Mantenibilidad, Interoperabilidad, Infraestructura, Escalabilidad, Cumplimiento |

---

## Notas para la Tesis

1. **Validez de RF:** Todos los RF deben responder a acciones que el usuario final puede percibir o solicitar explícitamente. Las decisiones técnicas (localStorage, servicios, etc.) están en RNF o comentarios de implementación.

2. **Atomicidad:** Cada RF es independiente y completo. No existen sub-requisitos que fragmenten la funcionalidad.

3. **Trazabilidad:** Cada RF puede vincularse a:
   - Casos de uso específicos
   - Pruebas de aceptación
   - Criterios de definición de "hecho"

4. **Diferenciación RF vs RNF:**
   - **RF:** ¿Qué hace el sistema? (acciones percibidas)
   - **RNF:** ¿Cómo lo hace? ¿Qué limitaciones tiene? (propiedades técnicas)

5. **Alineación con Tribunal:**
   - Estos requisitos deben evaluarse en defensa de tesis
   - Cada RF debe tener pruebas de aceptación
   - Los RNF deben validarse mediante métricas medibles

---

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Estado:** Aprobado para fase de desarrollo
