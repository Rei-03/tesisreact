// lib/services/usuariosService.js

/**
 * Servicio para gestionar usuarios (CRUD)
 * MODO DEMO: Usa datos simulados en localStorage cuando el backend no está disponible
 */

// Datos mock iniciales
const USUARIOS_MOCK = [
  {
    id: 1,
    nombre: "Brayan Castellano",
    login: "bcastellano",
    password: "admin123",
    rol: "admin",
    createdAt: new Date("2025-01-15").toISOString(),
  },
  {
    id: 2,
    nombre: "Carlos López",
    login: "clopez",
    password: "operador123",
    rol: "operador",
    createdAt: new Date("2025-02-01").toISOString(),
  },
  {
    id: 3,
    nombre: "María García",
    login: "mgarcia",
    password: "operador123",
    rol: "operador",
    createdAt: new Date("2025-02-05").toISOString(),
  },
];

/**
 * Credenciales de demostración
 * bcastellano / admin123 (admin)
 * clopez / operador123 (operador)
 * mgarcia / operador123 (operador)
 */

// Flag para modo demo (cambiar a false cuando backend esté listo)
const USAR_MOCK = true;

/**
 * Obtiene usuarios desde localStorage (simulado) o del backend
 */
const obtenerUsuariosDelStorage = () => {
  try {
    const stored = localStorage.getItem("usuarios_mock");
    if (stored) {
      return JSON.parse(stored);
    }
    // Si no hay datos guardados, usar los mock iniciales
    localStorage.setItem("usuarios_mock", JSON.stringify(USUARIOS_MOCK));
    return USUARIOS_MOCK;
  } catch (e) {
    console.error("Error accediendo al storage:", e);
    return USUARIOS_MOCK;
  }
};

const guardarUsuariosEnStorage = (usuarios) => {
  try {
    localStorage.setItem("usuarios_mock", JSON.stringify(usuarios));
  } catch (e) {
    console.error("Error guardando en storage:", e);
  }
};

/**
 * Obtiene la lista de todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export const obtenerUsuarios = async () => {
  try {
    if (USAR_MOCK) {
      // Modo demo: devolver datos del localStorage
      await new Promise((r) => setTimeout(r, 500)); // Simular latencia
      return obtenerUsuariosDelStorage();
    }

    // Modo producción: conectar con el backend
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: GET /api/usuarios

    const response = await fetch("/api/usuarios", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const datos = await response.json();
    return datos || [];
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    // En caso de error, volver a los datos mock
    if (!USAR_MOCK) {
      return obtenerUsuariosDelStorage();
    }
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} datos - Datos del nuevo usuario
 * @param {string} datos.nombre - Nombre completo del usuario
 * @param {string} datos.login - Login/username único
 * @param {string} datos.password - Contraseña (será encriptada en el backend)
 * @param {string} datos.rol - Rol del usuario ('admin' o 'operador')
 * @returns {Promise<Object>} Usuario creado
 */
export const crearUsuario = async (datos = {}) => {
  try {
    if (USAR_MOCK) {
      // Modo demo: guardar en localStorage
      await new Promise((r) => setTimeout(r, 300)); // Simular latencia
      const usuarios = obtenerUsuariosDelStorage();
      
      // Validar que el login sea único
      if (usuarios.some((u) => u.login === datos.login)) {
        throw new Error("El login ya existe");
      }

      const nuevoUsuario = {
        id: Math.max(...usuarios.map((u) => u.id), 0) + 1,
        nombre: datos.nombre,
        login: datos.login,
        rol: datos.rol,
        createdAt: new Date().toISOString(),
      };

      usuarios.push(nuevoUsuario);
      guardarUsuariosEnStorage(usuarios);
      
      // No devolver la contraseña
      const { ...usuarioSinPassword } = nuevoUsuario;
      return usuarioSinPassword;
    }

    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: POST /api/usuarios
    // El backend debe encriptar la contraseña y validar datos

    const response = await fetch("/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || `Error: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado;
  } catch (error) {
    console.error("Error creando usuario:", error);
    throw error;
  }
};

/**
 * Obtiene un usuario por ID
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const obtenerUsuarioPorId = async (usuarioId) => {
  try {
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: GET /api/usuarios/{id}
    
    const response = await fetch(`/api/usuarios/${usuarioId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    throw error;
  }
};

/**
 * Actualiza un usuario
 * @param {number} usuarioId - ID del usuario
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const actualizarUsuario = async (usuarioId, datos = {}) => {
  try {
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: PUT /api/usuarios/{id}
    
    const response = await fetch(`/api/usuarios/${usuarioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado;
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {number} usuarioId - ID del usuario a eliminar
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarUsuario = async (usuarioId) => {
  try {
    if (USAR_MOCK) {
      // Modo demo: eliminar de localStorage
      await new Promise((r) => setTimeout(r, 300)); // Simular latencia
      const usuarios = obtenerUsuariosDelStorage();
      
      const indice = usuarios.findIndex((u) => u.id === usuarioId);
      if (indice === -1) {
        throw new Error("Usuario no encontrado");
      }

      const usuarioEliminado = usuarios[indice];
      usuarios.splice(indice, 1);
      guardarUsuariosEnStorage(usuarios);

      return {
        message: `Usuario "${usuarioEliminado.nombre}" eliminado exitosamente`,
        usuario: usuarioEliminado,
      };
    }

    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: DELETE /api/usuarios/{id}
    // El backend debe validar que no se pueda eliminar el último admin

    const response = await fetch(`/api/usuarios/${usuarioId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || `Error: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado;
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw error;
  }
};

/**
 * Valida que un login sea único
 * @param {string} login - Login a validar
 * @returns {Promise<boolean>} true si es único, false si ya existe
 */
export const validarLoginUnico = async (login) => {
  try {
    if (USAR_MOCK) {
      const usuarios = obtenerUsuariosDelStorage();
      const disponible = !usuarios.some((u) => u.login === login);
      return disponible;
    }

    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: GET /api/usuarios/validar-login?login={login}

    const response = await fetch(`/api/usuarios/validar-login?login=${encodeURIComponent(login)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado.disponible || true;
  } catch (error) {
    console.error("Error validando login:", error);
    return false;
  }
};

/**
 * Autentica un usuario (SOLO PARA MODO DEMO)
 * @param {string} login - Login del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario sin password si es correcto
 */
export const autenticarUsuario = async (login, password) => {
  try {
    if (USAR_MOCK) {
      // Modo demo: validar contra datos locales
      await new Promise((r) => setTimeout(r, 500)); // Simular latencia
      const usuarios = obtenerUsuariosDelStorage();
      
      const usuario = usuarios.find((u) => u.login === login);
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      if (usuario.password !== password) {
        throw new Error("Contraseña incorrecta");
      }

      // Devolver usuario sin contraseña
      const { password: _, ...usuarioSinPassword } = usuario;
      return usuarioSinPassword;
    }

    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: POST /api/auth/login
    // El backend debe encriptar contraseñas y usar JWT/sesiones

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || `Error: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado.usuario;
  } catch (error) {
    console.error("Error autenticando usuario:", error);
    throw error;
  }
};
