# Guía de Integración Frontend-Backend - SGRC

**Objetivo:** Facilitar la transición de datos mock a conexión real con el backend  
**Estado:** Pronto a implementarse (Backend en desarrollo)

---

## Paso 1: Configurar Cliente API

En el frontend ya existe un cliente base que débería ser expandido:

```javascript
// lib/api/apiClient.js - ESTRUCTURA ESPERADA

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
};

export const apiClient = {
  // ====== AUTENTICACIÓN ======
  auth: {
    login: async (login, password) => {
      return fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      }).then(handleResponse);
    },

    logout: async () => {
      return fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    verify: async (token) => {
      return fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(handleResponse);
    }
  },

  // ====== CIRCUITOS ======
  circuitos: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.apagable) params.append('apagable', filters.apagable);
      if (filters.bloque) params.append('bloque', filters.bloque);
      if (filters.zona) params.append('zona', filters.zona);

      const url = `${API_BASE_URL}/circuitos${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getApagables: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.bloque) params.append('bloque', filters.bloque);

      const url = `${API_BASE_URL}/circuitos/apagables${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getById: async (id) => {
      return fetch(`${API_BASE_URL}/circuitos/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getBloques: async () => {
      return fetch(`${API_BASE_URL}/circuitos/bloques`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getProxApertura: async (id) => {
      return fetch(`${API_BASE_URL}/circuitos/${id}/proxima-apertura`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    }
  },

  // ====== ASEGURAMIENTOS ======
  aseguramientos: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.activos) params.append('activos', filters.activos);
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);
      if (filters.tipo) params.append('tipo', filters.tipo);

      const url = `${API_BASE_URL}/aseguramientos${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getById: async (id) => {
      return fetch(`${API_BASE_URL}/aseguramientos/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    create: async (data) => {
      return fetch(`${API_BASE_URL}/aseguramientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    update: async (id, data) => {
      return fetch(`${API_BASE_URL}/aseguramientos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    delete: async (id) => {
      return fetch(`${API_BASE_URL}/aseguramientos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    }
  },

  // ====== ROTACIONES ======
  rotaciones: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);
      if (filters.bloque) params.append('bloque', filters.bloque);
      if (filters.usuario) params.append('usuario', filters.usuario);

      const url = `${API_BASE_URL}/rotaciones${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getById: async (id) => {
      return fetch(`${API_BASE_URL}/rotaciones/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    generar: async (data) => {
      return fetch(`${API_BASE_URL}/rotaciones/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    update: async (id, data) => {
      return fetch(`${API_BASE_URL}/rotaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    delete: async (id) => {
      return fetch(`${API_BASE_URL}/rotaciones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    }
  },

  // ====== USUARIOS ======
  usuarios: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.activos) params.append('activos', filters.activos);

      const url = `${API_BASE_URL}/usuarios${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getById: async (id) => {
      return fetch(`${API_BASE_URL}/usuarios/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    create: async (data) => {
      return fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    update: async (id, data) => {
      return fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    cambiarContrasena: async (id, passwordActual, passwordNueva) => {
      return fetch(`${API_BASE_URL}/usuarios/${id}/cambiar-contrasena`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ passwordActual, passwordNueva })
      }).then(handleResponse);
    },

    delete: async (id) => {
      return fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    }
  },

  // ====== REPORTES ======
  reportes: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);
      if (filters.tipo) params.append('tipo', filters.tipo);

      const url = `${API_BASE_URL}/reportes${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getById: async (id) => {
      return fetch(`${API_BASE_URL}/reportes/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    descargar: async (id, formato = 'pdf') => {
      const url = `${API_BASE_URL}/reportes/${id}/descargar?formato=${formato}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const blob = await response.blob();
      return blob;
    },

    getAseguramientos: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);

      const url = `${API_BASE_URL}/reportes/aseguramientos${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    descargarAseguramientos: async (formato = 'pdf', filters = {}) => {
      const params = new URLSearchParams();
      params.append('formato', formato);
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);

      const url = `${API_BASE_URL}/reportes/aseguramientos/descargar?${params}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const blob = await response.blob();
      return blob;
    },

    getEstadisticas: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);

      const url = `${API_BASE_URL}/reportes/estadisticas${params ? '?' + params : ''}`;
      return fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    descargarEstadisticas: async (formato = 'pdf', filters = {}) => {
      const params = new URLSearchParams();
      params.append('formato', formato);
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);

      const url = `${API_BASE_URL}/reportes/estadisticas/descargar?${params}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const blob = await response.blob();
      return blob;
    }
  },

  // ====== DASHBOARD ======
  dashboard: {
    getResumen: async () => {
      return fetch(`${API_BASE_URL}/dashboard/resumen`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    },

    getGraficos: async (periodo = 'mes') => {
      return fetch(`${API_BASE_URL}/dashboard/graficos?periodo=${periodo}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(handleResponse);
    }
  }
};

// ====== HELPERS ======
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export { saveToken, getToken };
```

---

## Paso 2: Actualizar Servicios para Usar API Real

### Antes (Con mocks):
```javascript
export const obtenerCircuitos = async () => {
  // Retorna datos mocks directamente
  return circuitosMock;
};
```

### Después (Con API real):
```javascript
import { apiClient } from "@/lib/api/apiClient";

export const obtenerCircuitos = async (filtros = {}) => {
  try {
    // Cambiar flag para usar API
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      // Mantener fallback para desarrollo local
      return circuitosMock;
    }

    // Llamar a API real
    const response = await apiClient.circuitos.getAll(filtros);
    return response.data || [];
  } catch (error) {
    console.error("Error obteniendo circuitos:", error);
    // Fallback a mocks en caso de error
    return circuitosMock;
  }
};
```

---

## Paso 3: Variables de Entorno Frontend

Crear `.env.local`:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Modo desarrollo (usa mocks si el backend no está disponible)
NEXT_PUBLIC_USE_MOCK=false

# Timeout de solicitudes (ms)
NEXT_PUBLIC_REQUEST_TIMEOUT=30000
```

Para producción: `.env.production.local`:

```env
NEXT_PUBLIC_API_URL=https://api.ejemplo.com/api
NEXT_PUBLIC_USE_MOCK=false
```

---

## Paso 4: Actualizar AuthContext para Usar API Real

```javascript
// contexts/AuthContext.jsx - VERSIÓN CON BACKEND

const login = async (login, password) => {
  try {
    const response = await apiClient.auth.login(login, password);
    
    if (response.success) {
      const { token, user } = response.data;
      
      // Guardar token
      saveToken(token);
      
      // Actualizar estado
      setIsAuthenticated(true);
      setUser(user);
      
      // Persistir en localStorage
      localStorage.setItem("userData", JSON.stringify(user));
      
      return { success: true, user };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const logout = async () => {
  try {
    await apiClient.auth.logout();
  } catch (error) {
    console.error("Error en logout:", error);
  } finally {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  }
};
```

---

## Paso 5: Checklist de Integración

- [ ] Backend API implementado y corriendo en puerto 3001
- [ ] Base de datos SQL Server conectada
- [ ] Endpoints de autenticación funcionando (login/logout/verify)
- [ ] Endpoints de circuitos implementados y retornando datos reales
- [ ] Endpoints de aseguramientos implementados
- [ ] Endpoints de rotaciones implementados
- [ ] CORS configurado correctamente
- [ ] JWT validado en middleware
- [ ] Archivos `.env` frontend configurados
- [ ] apiClient.js completamente implementado
- [ ] Servicios actualizados para usar API
- [ ] AuthContext actualizado con login real
- [ ] Pruebas de integración exitosas
- [ ] Manejo de errores implementado
- [ ] Logging funcionando en backend

---

## Paso 6: Prueba de Integración Manual

### 1. Iniciar Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Verificar Health Check
```bash
curl http://localhost:3001/health
# Esperado: { "status": "OK", "timestamp": "..." }
```

### 3. Probar Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"bcastellano","password":"admin123"}'
```

### 4. Probar Endpoint Protegido
```bash
curl http://localhost:3001/api/circuitos \
  -H "Authorization: Bearer {token_obtenido}"
```

### 5. En Frontend
- Actualizar `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Cambiar `NEXT_PUBLIC_USE_MOCK=false`
- Reiniciar servidor de desarrollo
- Probar flujos en UI

---

## Paso 7: Consideraciones de Seguridad

### En Frontend:
```javascript
// NO hacer esto:
const token = 'hardcoded_token'; // ❌

// Hacer esto:
const token = localStorage.getItem('token'); // ✅ Se obtiene dinámicamente
```

### En Backend:
```javascript
// Validar siempre token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ...}); // ✅
};
```

### CORS Frontend
```javascript
// El backend debe permitir el origen del frontend
cors({
  origin: 'http://localhost:3000' // Puerto de Next.js
})
```

---

## Paso 8: Manejo de Errores Uniforme

**Crear interceptor de errores:**

```javascript
// lib/api/errorHandler.js

export const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Token expirado - redirigir a login
    window.location.href = '/loguin';
    return;
  }

  if (error.response?.status === 403) {
    // Sin permisos
    return 'No tienes permisos para esta acción';
  }

  if (error.response?.status === 404) {
    // Recurso no encontrado
    return 'El recurso solicitado no existe';
  }

  return error.response?.data?.message || 'Error desconocido';
};
```

---

## Paso 9: Performance y Caché

Para optimizar, implementar caché local:

```javascript
// lib/api/cache.js

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Usar en servicios:
export const obtenerCircuitos = async () => {
  const cached = getCachedData('circuitos');
  if (cached) return cached;

  const data = await apiClient.circuitos.getAll();
  setCachedData('circuitos', data);
  return data;
};
```

---

## Paso 10: Testing de Integración

```javascript
// tests/integration.test.js

describe('Frontend-Backend Integration', () => {
  test('Login y obtener circuitos', async () => {
    // 1. Login
    const loginRes = await apiClient.auth.login('bcastellano', 'admin123');
    expect(loginRes.success).toBe(true);
    saveToken(loginRes.data.token);

    // 2. Obtener circuitos
    const circuitosRes = await apiClient.circuitos.getAll();
    expect(circuitosRes.success).toBe(true);
    expect(circuitosRes.data).toBeInstanceOf(Array);

    // 3. Logout
    const logoutRes = await apiClient.auth.logout();
    expect(logoutRes.success).toBe(true);
  });
});
```

---

## Timeline Recomendado

1. **Semana 1**: Setup backend + endpoints básicos (auth, circuitos)
2. **Semana 2**: Endpoints de aseguramientos y rotaciones
3. **Semana 3**: Reportes y dashboard
4. **Semana 4**: Testing, optimización, documentación

---

## Soporte y Debugging

**Si el backend no responde:**
1. Verificar que esté corriendo: `curl http://localhost:3001/health`
2. Revisar logs del backend
3. Validar CORS: `Access-Control-Allow-Origin`
4. Verificar JWT token no esté expirado
5. Usar DevTools Network tab para ver requests

**Útiles para debugging:**
- Postman o Insomnia para probar endpoints
- Logs detallados en backend (log4js)
- Browser DevTools Network tab
- Console logs en frontend

---

Este documento proporciona la hoja de ruta completa para integrar el frontend con el backend.
