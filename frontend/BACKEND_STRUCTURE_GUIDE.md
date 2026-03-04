# Estructura Recomendada del Backend - SGRC

**Tecnología recomendada:** Node.js + Express.js / NestJS  
**Base de datos:** SQL Server 2008 (legacy) + Tabla de auditoría contemporánea  
**Autenticación:** JWT (JSON Web Tokens)

---

## Estructura de Carpetas

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de conexión SQL Server
│   │   ├── jwt.js              # Configuración de JWT
│   │   └── cors.js             # Configuración de CORS
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── circuitosController.js
│   │   ├── aseguramientosController.js
│   │   ├── rotacionesController.js
│   │   ├── usuariosController.js
│   │   ├── reportesController.js
│   │   └── dashboardController.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── circuitos.js
│   │   ├── aseguramientos.js
│   │   ├── rotaciones.js
│   │   ├── usuarios.js
│   │   ├── reportes.js
│   │   └── dashboard.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── circuitosService.js
│   │   ├── aseguramientosService.js
│   │   ├── rotacionesService.js
│   │   ├── usuariosService.js
│   │   ├── reportesService.js
│   │   └── dashboardService.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js    # Verificación JWT
│   │   ├── errorHandler.js      # Manejo de errores centralizado
│   │   ├── validationMiddleware.js # Validación de requests
│   │   ├── loggingMiddleware.js # Logging centralizado
│   │   └── roleMiddleware.js    # Verificación de permisos
│   │
│   ├── models/
│   │   ├── userModel.js
│   │   ├── circuitoModel.js
│   │   ├── aseguramientoModel.js
│   │   ├── rotacionModel.js
│   │   └── reporteModel.js
│   │
│   ├── utils/
│   │   ├── validators.js        # Validaciones compartidas
│   │   ├── helpers.js           # Funciones auxiliares
│   │   ├── fileGenerator.js     # Generación de PDF/Excel
│   │   └── queries.js           # Queries SQL reutilizables
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   └── 001_create_tables.sql
│   │   └── seeds/
│   │       └── 001_seed_users.sql
│   │
│   └── app.js                   # Configuración principal de Express
│
├── tests/
│   ├── auth.test.js
│   ├── circuitos.test.js
│   ├── rotaciones.test.js
│   └── integration.test.js
│
├── .env                         # Variables de entorno (gitignored)
├── .env.example                 # Template de variables
├── package.json
├── server.js                    # Entry point
└── README.md
```

---

## Dependencias Recomendadas

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.3",
    "mssql": "^9.0.1",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "joi": "^17.9.2",
    "log4js": "^6.7.0",
    "multer": "^1.4.5",
    "jspdf": "^2.5.1",
    "xlsx": "^0.18.5",
    "async": "^3.2.4",
    "moment": "^2.29.4"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "nodemon": "^2.0.22",
    "eslint": "^8.40.0"
  }
}
```

---

## Variables de Entorno (.env)

```env
# Servidor
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Base de Datos (SQL Server legacy)
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=tu_base_datos
DB_USER=sa
DB_PASSWORD=tu_password
DB_ENCRYPT=false
DB_TRUST_CERT=true

# JWT
JWT_SECRET=tu_clave_secreta_super_larga_y_segura
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# Email (si se implementa notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password

# PDF/Excel
PDF_TEMP_DIR=./temp/pdfs
EXCEL_TEMP_DIR=./temp/excels
```

---

## Ejemplo: server.js

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const log4js = require('log4js');

// Importar rutas
const authRoutes = require('./src/routes/auth');
const circuitosRoutes = require('./src/routes/circuitos');
const aseguramientosRoutes = require('./src/routes/aseguramientos');
const rotacionesRoutes = require('./src/routes/rotaciones');
const usuariosRoutes = require('./src/routes/usuarios');
const reportesRoutes = require('./src/routes/reportes');
const dashboardRoutes = require('./src/routes/dashboard');

// Importar middleware
const { errorHandler } = require('./src/middleware/errorHandler');
const { loggingMiddleware } = require('./src/middleware/loggingMiddleware');

// Configurar variables de entorno
dotenv.config();

// Configurar logger
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    file: { type: 'file', filename: process.env.LOG_FILE || './logs/app.log' }
  },
  categories: { default: { appenders: ['out', 'file'], level: 'debug' } }
});

const logger = log4js.getLogger();

// Crear app
const app = express();

// Middleware global
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(loggingMiddleware);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/circuitos', circuitosRoutes);
app.use('/api/aseguramientos', aseguramientosRoutes);
app.use('/api/rotaciones', rotacionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handler (al final)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Servidor ejecutándose en puerto ${PORT}`);
});

module.exports = app;
```

---

## Ejemplo: Middleware de Autenticación

```javascript
// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol admin'
    });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
```

---

## Ejemplo: Servicio de Circuitos

```javascript
// src/services/circuitosService.js
const { getConnection } = require('../config/database');
const { AppError } = require('../utils/helpers');

class CircuitosService {
  /**
   * Obtiene todos los circuitos
   */
  static async getAll(filters = {}) {
    try {
      const conn = await getConnection();
      const request = conn.request();

      let query = 'SELECT TOP 1000 * FROM SIGERE.ap_circuitos WHERE 1=1';

      if (filters.apagable) {
        query += ' AND Apagable = 1';
      }
      if (filters.bloque) {
        query += ` AND Bloque = ${filters.bloque}`;
      }
      if (filters.zona) {
        query += ` AND ZonaAfectada LIKE '%${filters.zona}%'`;
      }

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new AppError('Error obteniendo circuitos', 500, error);
    }
  }

  /**
   * Obtiene solo circuitos apagables
   */
  static async getApagables() {
    return this.getAll({ apagable: true });
  }

  /**
   * Obtiene un circuito por ID
   */
  static async getById(id) {
    try {
      const conn = await getConnection();
      const result = await conn
        .request()
        .input('id', id)
        .query('SELECT * FROM SIGERE.ap_circuitos WHERE idCircuitoP = @id');

      if (result.recordset.length === 0) {
        throw new AppError('Circuito no encontrado', 404);
      }

      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene próxima apertura de un circuito
   */
  static async getProxApertura(id) {
    try {
      const conn = await getConnection();
      const result = await conn
        .request()
        .input('id', id)
        .query('SELECT * FROM PSFV.ap_ProxAperturas WHERE id_Circuito = @id');

      if (result.recordset.length === 0) {
        throw new AppError('Próxima apertura no encontrada', 404);
      }

      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene bloques disponibles
   */
  static async getBloques() {
    try {
      const conn = await getConnection();
      const result = await conn
        .request()
        .query('SELECT DISTINCT Bloque FROM SIGERE.ap_circuitos WHERE Bloque IS NOT NULL ORDER BY Bloque');

      return result.recordset.map(r => r.Bloque);
    } catch (error) {
      throw new AppError('Error obteniendo bloques', 500, error);
    }
  }
}

module.exports = CircuitosService;
```

---

## Ejemplo: Controller de Circuitos

```javascript
// src/controllers/circuitosController.js
const CircuitosService = require('../services/circuitosService');

exports.getAllCircuitos = async (req, res, next) => {
  try {
    const { apagable, bloque, zona } = req.query;
    
    const filters = {};
    if (apagable) filters.apagable = apagable === 'true';
    if (bloque) filters.bloque = parseInt(bloque);
    if (zona) filters.zona = zona;

    const data = await CircuitosService.getAll(filters);

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    next(error);
  }
};

exports.getApagables = async (req, res, next) => {
  try {
    const data = await CircuitosService.getApagables();
    
    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await CircuitosService.getById(id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.getBloques = async (req, res, next) => {
  try {
    const data = await CircuitosService.getBloques();
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.getProxApertura = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await CircuitosService.getProxApertura(id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
```

---

## Ejemplo: Rutas

```javascript
// src/routes/circuitos.js
const express = require('express');
const router = express.Router();
const circuitosController = require('../controllers/circuitosController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET
router.get('/', circuitosController.getAllCircuitos);
router.get('/apagables', circuitosController.getApagables);
router.get('/bloques', circuitosController.getBloques);
router.get('/prox-apertura/:id', circuitosController.getProxApertura);
router.get('/:id', circuitosController.getById);

module.exports = router;
```

---

## Configuración de Base de Datos

```javascript
// src/config/database.js
const sql = require('mssql');
const log4js = require('log4js');

const logger = log4js.getLogger();

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableKeepAlive: true
  }
};

let pool;

const createPool = async () => {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    logger.info('Conectado a SQL Server');
    return pool;
  } catch (error) {
    logger.error('Error conectando a BD:', error);
    throw error;
  }
};

const getConnection = async () => {
  if (!pool) {
    await createPool();
  }
  return pool;
};

const closePool = async () => {
  if (pool) {
    await pool.close();
  }
};

module.exports = { getConnection, createPool, closePool };
```

---

## Modelo de Respuesta de Error

```javascript
// src/utils/helpers.js
class AppError extends Error {
  constructor(message, statusCode, originalError = null) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

const sendErrorResponse = (error, res) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.originalError?.message 
    })
  });
};

module.exports = { AppError, sendErrorResponse };
```

---

## Manejo de Errores Centralizado

```javascript
// src/middleware/errorHandler.js
const log4js = require('log4js');
const { sendErrorResponse } = require('../utils/helpers');

const logger = log4js.getLogger();

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  sendErrorResponse(err, res);
};

module.exports = { errorHandler };
```

---

## Script de Migración SQL Server

```sql
-- db/migrations/001_create_tables.sql

-- Tabla de Usuarios (nueva)
CREATE TABLE sgrc_usuarios (
  id INT PRIMARY KEY IDENTITY(1,1),
  nombre NVARCHAR(255) NOT NULL,
  login NVARCHAR(100) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  rol NVARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'operador')),
  activo BIT DEFAULT 1,
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  lastLogin DATETIME NULL
);

-- Tabla de Rotaciones (nueva)
CREATE TABLE sgrc_rotaciones (
  id INT PRIMARY KEY IDENTITY(1,1),
  idRotacion NVARCHAR(50) UNIQUE NOT NULL,
  fecha DATETIME NOT NULL DEFAULT GETDATE(),
  tipo NVARCHAR(100) NOT NULL,
  bloque INT,
  generadoPor NVARCHAR(255),
  usuario NVARCHAR(100),
  cantidadCircuitos INT,
  mwTotal DECIMAL(10,2),
  duracion NVARCHAR(50),
  observaciones NVARCHAR(MAX),
  estado NVARCHAR(50) DEFAULT 'Completada',
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE()
);

-- Tabla de Relación Rotaciones-Circuitos (nueva)
CREATE TABLE sgrc_rotaciones_circuitos (
  id INT PRIMARY KEY IDENTITY(1,1),
  rotacionId INT NOT NULL,
  circuitoId INT NOT NULL,
  mw DECIMAL(10,2),
  FOREIGN KEY (rotacionId) REFERENCES sgrc_rotaciones(id)
);

-- Tabla de Reportes (nueva)
CREATE TABLE sgrc_reportes (
  id INT PRIMARY KEY IDENTITY(1,1),
  idRotacion NVARCHAR(50),
  fecha DATETIME NOT NULL DEFAULT GETDATE(),
  tipo NVARCHAR(100),
  formato NVARCHAR(10),
  rutaArchivo NVARCHAR(500),
  generadoPor NVARCHAR(100),
  createdAt DATETIME DEFAULT GETDATE()
);

-- Crear índices
CREATE INDEX idx_sgrc_usuarios_login ON sgrc_usuarios(login);
CREATE INDEX idx_sgrc_rotaciones_fecha ON sgrc_rotaciones(fecha);
CREATE INDEX idx_sgrc_rotaciones_usuario ON sgrc_rotaciones(usuario);
```

---

## Testing con Jest y Supertest

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
  test('POST /api/auth/login - Login exitoso', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        login: 'bcastellano',
        password: 'admin123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('id');
  });

  test('POST /api/auth/login - Credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        login: 'bcastellano',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
```

---

## Scripts en package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "migrate": "node scripts/migrate.js"
  }
}
```

---

## Consideraciones Adicionales

### 1. **Conexión a BD Legacy**
- Usar librería `mssql` para SQL Server 2008
- Pool de conexiones para mejor rendimiento
- Manejo robusto de timeouts y reconexiones

### 2. **Validación de Datos**
- Usar librería `joi` para validación de schemas
- Validar todas las entradas del usuario
- Sanitizar datos para prevenir SQL injection

### 3. **Seguridad**
- Usar bcryptjs para hash de contraseñas (no plaintext)
- JWT con expiración corta (24h)
- HTTPS en producción
- Rate limiting
- CORS configurado correctamente

### 4. **Logging y Auditoría**
- Log de todas las operaciones CRUD
- Log de intentos fallidos de autenticación
- Registrar quién hizo qué y cuándo
- Retención de logs según compliance

### 5. **Generación de Reportes**
- Usar jspdf y xlsx en el backend
- Guardar temporalmente en carpeta /temp
- Limpiar archivos antiguos (cron job)
- Permitir descarga directa sin almacenar permanentemente

### 6. **Performance**
- Índices en columnas de búsqueda
- Paginación para listas grandes
- Caché de circuitos (no cambian frecuentemente)
- Queries optimizadas

### 7. **Mantenimiento**
- Documentación clara de endpoints
- Versionamiento de API (v1, v2, etc.)
- Changelog de cambios
- Plan de deprecación para endpoints antiguos

---

**Este documento proporciona la base arquitectónica para implementar el backend.**  
**Adaptar según las preferencias del equipo de desarrollo.**
