-- ============================================
-- CONSULTAS PARA LA BASE DE DATOS SIGERE
-- ============================================

-- PASO 1: Cambiar a la base de datos SIGERE
USE SIGERE;
GO

-- PASO 2: Verificar que estás en la base de datos correcta
SELECT DB_NAME() AS 'Base_Datos_Actual';
-- Debe mostrar: SIGERE

-- PASO 3: Listar TODAS las tablas de usuario en SIGERE
SELECT 
    TABLE_SCHEMA AS 'Esquema',
    TABLE_NAME AS 'Nombre_Tabla'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_NAME NOT LIKE 'MS%'
    AND TABLE_NAME NOT LIKE 'spt_%'
    AND TABLE_NAME NOT LIKE 'sys%'
ORDER BY TABLE_SCHEMA, TABLE_NAME;

-- PASO 4: Ver TODAS las columnas de TODAS las tablas (solo tablas de usuario)
SELECT 
    TABLE_SCHEMA AS 'Esquema',
    TABLE_NAME AS 'Tabla',
    COLUMN_NAME AS 'Columna',
    DATA_TYPE AS 'Tipo_Dato',
    CHARACTER_MAXIMUM_LENGTH AS 'Longitud',
    IS_NULLABLE AS 'Permite_Null',
    COLUMN_DEFAULT AS 'Valor_Default',
    ORDINAL_POSITION AS 'Posicion'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME NOT LIKE 'MS%'
    AND TABLE_NAME NOT LIKE 'spt_%'
    AND TABLE_NAME NOT LIKE 'sys%'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- PASO 5: Ver PRIMARY KEYS de todas las tablas
SELECT 
    tc.TABLE_SCHEMA AS 'Esquema',
    tc.TABLE_NAME AS 'Tabla',
    kc.COLUMN_NAME AS 'Columna_PK'
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kc
    ON tc.CONSTRAINT_NAME = kc.CONSTRAINT_NAME
WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    AND tc.TABLE_NAME NOT LIKE 'MS%'
    AND tc.TABLE_NAME NOT LIKE 'spt_%'
    AND tc.TABLE_NAME NOT LIKE 'sys%'
ORDER BY tc.TABLE_NAME;

-- PASO 6: Ver FOREIGN KEYS (relaciones entre tablas)
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
WHERE fk.TABLE_NAME NOT LIKE 'MS%'
    AND fk.TABLE_NAME NOT LIKE 'spt_%'
    AND fk.TABLE_NAME NOT LIKE 'sys%'
ORDER BY fk.TABLE_NAME;

-- PASO 7: Contar registros por tabla
SELECT 
    t.name AS 'Tabla',
    p.rows AS 'Cantidad_Registros'
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0,1)
    AND t.name NOT LIKE 'MS%'
    AND t.name NOT LIKE 'spt_%'
    AND t.name NOT LIKE 'sys%'
ORDER BY p.rows DESC;

-- ============================================
-- CONSULTAS ESPECÍFICAS POR TABLA
-- ============================================
-- Ejecuta estas después de ver qué tablas tienes
-- (Reemplaza 'NombreTabla' con el nombre real)

-- Ver estructura de una tabla específica
/*
SELECT 
    COLUMN_NAME AS 'Columna',
    DATA_TYPE AS 'Tipo_Dato',
    CHARACTER_MAXIMUM_LENGTH AS 'Longitud_Max',
    IS_NULLABLE AS 'Permite_Null',
    COLUMN_DEFAULT AS 'Valor_Default',
    ORDINAL_POSITION AS 'Posicion'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'NombreTabla'
ORDER BY ORDINAL_POSITION;
*/

-- Ver datos de ejemplo de una tabla (primeros 10 registros)
/*
SELECT TOP 10 * FROM NombreTabla;
*/
