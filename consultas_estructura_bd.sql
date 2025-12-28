-- ============================================
-- CONSULTAS PARA ANALIZAR ESTRUCTURA DE BD
-- ============================================
-- Estas consultas te ayudarán a entender la estructura de tus bases de datos
-- para poder crear los endpoints correctamente
-- ============================================

-- ============================================
-- SQL SERVER
-- ============================================

-- 1. LISTAR TODAS LAS TABLAS DE LA BASE DE DATOS (SOLO TABLAS DE USUARIO)
SELECT 
    TABLE_SCHEMA AS 'Esquema',
    TABLE_NAME AS 'Nombre_Tabla'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_NAME NOT LIKE 'MS%'  -- Excluir tablas de replicación
    AND TABLE_NAME NOT LIKE 'spt_%'  -- Excluir tablas del sistema
    AND TABLE_NAME NOT LIKE 'sys%'  -- Excluir tablas del sistema
ORDER BY TABLE_SCHEMA, TABLE_NAME;

-- 1b. VER EN QUÉ BASE DE DATOS ESTÁS CONECTADO
SELECT DB_NAME() AS 'Base_Datos_Actual';

-- 1c. LISTAR TODAS LAS BASES DE DATOS DISPONIBLES
SELECT name AS 'Nombre_Base_Datos'
FROM sys.databases
WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')  -- Excluir BDs del sistema
ORDER BY name;

-- 2. VER ESTRUCTURA COMPLETA DE UNA TABLA ESPECÍFICA
-- (Reemplaza 'NombreTabla' con el nombre real)
SELECT 
    COLUMN_NAME AS 'Columna',
    DATA_TYPE AS 'Tipo_Dato',
    CHARACTER_MAXIMUM_LENGTH AS 'Longitud_Max',
    IS_NULLABLE AS 'Permite_Null',
    COLUMN_DEFAULT AS 'Valor_Default',
    ORDINAL_POSITION AS 'Posicion'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'NombreTabla'  -- Cambiar por el nombre real
ORDER BY ORDINAL_POSITION;

-- 3. VER TODAS LAS COLUMNAS DE TODAS LAS TABLAS (SOLO TABLAS DE USUARIO)
SELECT 
    TABLE_SCHEMA AS 'Esquema',
    TABLE_NAME AS 'Tabla',
    COLUMN_NAME AS 'Columna',
    DATA_TYPE AS 'Tipo_Dato',
    CHARACTER_MAXIMUM_LENGTH AS 'Longitud',
    IS_NULLABLE AS 'Null',
    COLUMN_DEFAULT AS 'Default'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME NOT LIKE 'MS%'
    AND TABLE_NAME NOT LIKE 'spt_%'
    AND TABLE_NAME NOT LIKE 'sys%'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 4. VER PRIMARY KEYS DE TODAS LAS TABLAS (SOLO TABLAS DE USUARIO)
SELECT 
    tc.TABLE_SCHEMA AS 'Esquema',
    tc.TABLE_NAME AS 'Tabla',
    kc.COLUMN_NAME AS 'Columna_PK'
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kc
    ON tc.CONSTRAINT_NAME = kc.CONSTRAINT_NAME
WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
ORDER BY tc.TABLE_NAME;

-- 5. VER FOREIGN KEYS (RELACIONES ENTRE TABLAS)
SELECT 
    fk.TABLE_SCHEMA AS 'Esquema_Tabla',
    fk.TABLE_NAME AS 'Tabla_Origen',
    fk.COLUMN_NAME AS 'Columna_FK',
    pk.TABLE_SCHEMA AS 'Esquema_Referencia',
    pk.TABLE_NAME AS 'Tabla_Referencia',
    pk.COLUMN_NAME AS 'Columna_Referencia',
    fk.CONSTRAINT_NAME AS 'Nombre_FK'
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk
    ON rc.CONSTRAINT_NAME = fk.CONSTRAINT_NAME
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE pk
    ON rc.UNIQUE_CONSTRAINT_NAME = pk.CONSTRAINT_NAME
ORDER BY fk.TABLE_NAME;

-- 6. VER ÍNDICES DE UNA TABLA
SELECT 
    OBJECT_NAME(object_id) AS 'Tabla',
    name AS 'Nombre_Indice',
    type_desc AS 'Tipo',
    is_unique AS 'Es_Unico',
    is_primary_key AS 'Es_PK'
FROM sys.indexes
WHERE OBJECT_NAME(object_id) = 'NombreTabla'  -- Cambiar por el nombre real
ORDER BY name;

-- 7. VER DATOS DE EJEMPLO DE UNA TABLA (PRIMEROS 10 REGISTROS)
-- SELECT TOP 10 * FROM NombreTabla;  -- Cambiar por el nombre real

-- 8. CONTAR REGISTROS POR TABLA
SELECT 
    t.name AS 'Tabla',
    p.rows AS 'Cantidad_Registros'
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0,1)
ORDER BY p.rows DESC;

-- ============================================
-- MYSQL / MARIADB
-- ============================================

-- 1. LISTAR TODAS LAS TABLAS
SHOW TABLES;

-- 2. VER ESTRUCTURA DE UNA TABLA
DESCRIBE NombreTabla;  -- O también: DESCRIBE database.NombreTabla;

-- 3. VER TODAS LAS COLUMNAS DE TODAS LAS TABLAS
SELECT 
    TABLE_SCHEMA AS 'Base_Datos',
    TABLE_NAME AS 'Tabla',
    COLUMN_NAME AS 'Columna',
    DATA_TYPE AS 'Tipo_Dato',
    CHARACTER_MAXIMUM_LENGTH AS 'Longitud',
    IS_NULLABLE AS 'Null',
    COLUMN_DEFAULT AS 'Default',
    COLUMN_KEY AS 'Clave',
    EXTRA AS 'Extra'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'nombre_base_datos'  -- Cambiar por el nombre real
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 4. VER FOREIGN KEYS
SELECT 
    TABLE_NAME AS 'Tabla',
    COLUMN_NAME AS 'Columna_FK',
    REFERENCED_TABLE_NAME AS 'Tabla_Referencia',
    REFERENCED_COLUMN_NAME AS 'Columna_Referencia'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'nombre_base_datos'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ============================================
-- POSTGRESQL
-- ============================================

-- 1. LISTAR TODAS LAS TABLAS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. VER ESTRUCTURA DE UNA TABLA
SELECT 
    column_name AS 'Columna',
    data_type AS 'Tipo_Dato',
    character_maximum_length AS 'Longitud',
    is_nullable AS 'Null',
    column_default AS 'Default'
FROM information_schema.columns
WHERE table_name = 'nombre_tabla'  -- Cambiar por el nombre real
ORDER BY ordinal_position;

-- 3. VER FOREIGN KEYS
SELECT
    tc.table_name AS 'Tabla',
    kcu.column_name AS 'Columna_FK',
    ccu.table_name AS 'Tabla_Referencia',
    ccu.column_name AS 'Columna_Referencia'
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- ============================================
-- CONSULTAS ESPECÍFICAS PARA TU PROYECTO
-- ============================================

-- TABLAS ESPERADAS (ajustar según tu esquema real):

-- 1. USUARIOS
-- SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' OR TABLE_NAME = 'Users';
-- Campos esperados: id, nombre, login, password, rol, fecha_creacion, activo

-- 2. CIRCUITOS
-- SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'circuitos' OR TABLE_NAME = 'Circuits';
-- Campos esperados: id, codigo, numero, bloque, clientes, mw, zona, estado, coordenadas_lat, coordenadas_lng

-- 3. ASEGURAMIENTOS
-- SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'aseguramientos' OR TABLE_NAME = 'Aseguramientos';
-- Campos esperados: id, circuito_id, motivo, tipo, horario_inicio, horario_fin, activo

-- 4. ROTACIONES / HISTORIAL
-- SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME LIKE '%rotacion%' OR TABLE_NAME LIKE '%historial%';
-- Campos esperados: id, fecha, circuito_id, usuario_id, tipo_operacion, mw_afectado

-- 5. DASHBOARD / ESTADO SISTEMA
-- SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME LIKE '%dashboard%' OR TABLE_NAME LIKE '%estado%';
-- Campos esperados: id, fecha, deficit_mw, mw_afectados, mw_asegurados, alertas

-- ============================================
-- CONSULTA PARA EXPORTAR ESTRUCTURA COMPLETA
-- ============================================

-- SQL SERVER: Generar script de todas las tablas
-- EXEC sp_helpdb 'nombre_base_datos';

-- O usar SQL Server Management Studio:
-- Click derecho en la base de datos > Tasks > Generate Scripts

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Ejecuta estas consultas en cada una de tus bases de datos
-- 2. Guarda los resultados en un documento o archivo
-- 3. Identifica las relaciones entre tablas (Foreign Keys)
-- 4. Anota los tipos de datos para validar en el backend
-- 5. Verifica si hay campos calculados o triggers
-- 6. Revisa los índices para optimizar consultas

