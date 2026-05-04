import axios from 'axios';
import * as usuariosService from './usuariosService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('usuariosService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('obtenerUsuarios', () => {
    it('debe retornar usuarios desde localStorage en modo demo', async () => {
      const usuarios = await usuariosService.obtenerUsuarios();

      expect(usuarios).toBeDefined();
      expect(Array.isArray(usuarios)).toBe(true);
      expect(usuarios.length).toBeGreaterThan(0);
    });

    it('debe contener usuarios con propiedades correctas', async () => {
      const usuarios = await usuariosService.obtenerUsuarios();

      expect(usuarios[0]).toHaveProperty('id');
      expect(usuarios[0]).toHaveProperty('nombre');
      expect(usuarios[0]).toHaveProperty('login');
      expect(usuarios[0]).toHaveProperty('rol');
    });

    it('debe guardar usuarios en localStorage', async () => {
      localStorage.clear();

      await usuariosService.obtenerUsuarios();

      const stored = localStorage.getItem('usuarios_mock');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored)).toBeDefined();
    });

    it('debe retornar usuarios guardados en localStorage si existen', async () => {
      const customUsuarios = [
        {
          id: 99,
          nombre: 'Usuario Custom',
          login: 'custom',
          rol: 'admin',
        },
      ];

      localStorage.setItem('usuarios_mock', JSON.stringify(customUsuarios));

      const usuarios = await usuariosService.obtenerUsuarios();

      expect(usuarios).toEqual(customUsuarios);
      expect(usuarios[0].id).toBe(99);
    });

    it('debe contener usuario admin por defecto', async () => {
      localStorage.clear();

      const usuarios = await usuariosService.obtenerUsuarios();

      const adminUser = usuarios.find((u) => u.rol === 'admin');
      expect(adminUser).toBeDefined();
      expect(adminUser.login).toBe('bcastellano');
    });

    it('debe contener usuarios operadores por defecto', async () => {
      localStorage.clear();

      const usuarios = await usuariosService.obtenerUsuarios();

      const operadores = usuarios.filter((u) => u.rol === 'operador');
      expect(operadores.length).toBeGreaterThan(0);
    });

    it('debe simular latencia de red', async () => {
      const start = Date.now();
      await usuariosService.obtenerUsuarios();
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(500);
    });

    it('debe manejar localStorage corrupto gracefully', async () => {
      localStorage.setItem('usuarios_mock', '{invalid json}');

      const usuarios = await usuariosService.obtenerUsuarios();

      expect(usuarios).toBeDefined();
      expect(Array.isArray(usuarios)).toBe(true);
    });

    it('debe retornar datos mock si localStorage.getItem falla', async () => {
      const getItemSpy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const usuarios = await usuariosService.obtenerUsuarios();

      expect(usuarios).toBeDefined();
      expect(Array.isArray(usuarios)).toBe(true);

      getItemSpy.mockRestore();
    });
  });

  describe('crearUsuario', () => {
    it('debe crear un nuevo usuario en localStorage', async () => {
      const nuevoUsuario = {
        nombre: 'Nuevo Usuario',
        login: `newuser_${Date.now()}`,
        password: 'password123',
        rol: 'operador',
      };

      const resultado = await usuariosService.crearUsuario(nuevoUsuario);

      expect(resultado).toHaveProperty('id');
      expect(resultado.nombre).toBe(nuevoUsuario.nombre);
    });

    it('debe asignar ID único al crear usuario', async () => {
      const usuario1 = {
        nombre: 'Usuario 1',
        login: `user1_${Date.now()}`,
        password: 'pass1',
        rol: 'operador',
      };

      const usuario2 = {
        nombre: 'Usuario 2',
        login: `user2_${Date.now()}`,
        password: 'pass2',
        rol: 'operador',
      };

      const resultado1 = await usuariosService.crearUsuario(usuario1);
      const resultado2 = await usuariosService.crearUsuario(usuario2);

      expect(resultado1.id).not.toBe(resultado2.id);
    });

    it('debe guardar usuario creado en localStorage', async () => {
      const nuevoUsuario = {
        nombre: 'Persistencia Test',
        login: `persist_${Date.now()}`,
        password: 'pass',
        rol: 'operador',
      };

      const resultado = await usuariosService.crearUsuario(nuevoUsuario);

      const usuarios = await usuariosService.obtenerUsuarios();
      const usuarioGuardado = usuarios.find((u) => u.id === resultado.id);

      expect(usuarioGuardado).toBeDefined();
      expect(usuarioGuardado.nombre).toBe(nuevoUsuario.nombre);
    });

    it('debe rechazar usuario si login ya existe', async () => {
      const usuarioDuplicado = {
        nombre: 'Nombre Diferente',
        login: 'bcastellano',
        password: 'pass',
        rol: 'operador',
      };

      try {
        await usuariosService.crearUsuario(usuarioDuplicado);
        fail('Debería haber lanzado un error');
      } catch (error) {
        expect(error.message).toContain('login ya existe');
      }
    });

    it('no debe devolver contraseña en respuesta', async () => {
      const nuevoUsuario = {
        nombre: 'Sin Password',
        login: `sinpass_${Date.now()}`,
        password: 'secreto123',
        rol: 'operador',
      };

      const resultado = await usuariosService.crearUsuario(nuevoUsuario);

      expect(resultado).not.toHaveProperty('password');
    });
  });

  describe('obtenerUsuarioPorId', () => {
    it('debe conseguir usuario por ID (requiere backend)', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { id: 1, nombre: 'Test Usuario' },
      });

      const resultado = await usuariosService.obtenerUsuarioPorId(1);

      expect(resultado).toBeDefined();
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/usuarios/1');
    });
  });

  describe('eliminarUsuario', () => {
    it('debe eliminar usuario existente', async () => {
      const usuarios = await usuariosService.obtenerUsuarios();
      const usuarioAEliminar = usuarios[usuarios.length - 1];
      const countAntes = usuarios.length;

      const resultado = await usuariosService.eliminarUsuario(usuarioAEliminar.id);

      expect(resultado).toHaveProperty('message');
      expect(resultado).toHaveProperty('usuario');

      const usuariosActualizados = await usuariosService.obtenerUsuarios();
      expect(usuariosActualizados.length).toBe(countAntes - 1);
    });

    it('debe remover usuario de localStorage', async () => {
      const usuarios = await usuariosService.obtenerUsuarios();
      const usuarioAEliminar = usuarios[0];

      await usuariosService.eliminarUsuario(usuarioAEliminar.id);

      const usuariosActualizados = await usuariosService.obtenerUsuarios();
      const usuarioEliminado = usuariosActualizados.find((u) => u.id === usuarioAEliminar.id);

      expect(usuarioEliminado).toBeUndefined();
    });

    it('debe retornar error si usuario no existe', async () => {
      try {
        await usuariosService.eliminarUsuario(99999);
        fail('Debería haber lanzado un error');
      } catch (error) {
        expect(error.message).toContain('Usuario no encontrado');
      }
    });
  });

  describe('validarLoginUnico', () => {
    it('debe retornar true para login disponible', async () => {
      const loginUnico = `unique_login_${Date.now()}`;
      const disponible = await usuariosService.validarLoginUnico(loginUnico);

      expect(disponible).toBe(true);
    });

    it('debe retornar false para login existente', async () => {
      const disponible = await usuariosService.validarLoginUnico('bcastellano');

      expect(disponible).toBe(false);
    });

    it('debe retornar false para login de operador existente', async () => {
      const disponible = await usuariosService.validarLoginUnico('clopez');

      expect(disponible).toBe(false);
    });

    it('debe validar correctamente después de crear usuario', async () => {
      const nuevoLogin = `nuevo_${Date.now()}`;

      // Inicialmente debe estar disponible
      let disponible = await usuariosService.validarLoginUnico(nuevoLogin);
      expect(disponible).toBe(true);

      // Crear usuario
      await usuariosService.crearUsuario({
        nombre: 'Test Usuario',
        login: nuevoLogin,
        password: 'pass',
        rol: 'operador',
      });

      // Ahora no debería estar disponible
      disponible = await usuariosService.validarLoginUnico(nuevoLogin);
      expect(disponible).toBe(false);
    });
  });

  describe('Datos de prueba por defecto', () => {
    it('debe contener al menos 3 usuarios por defecto', async () => {
      localStorage.clear();
      const usuarios = await usuariosService.obtenerUsuarios();

      expect(usuarios.length).toBeGreaterThanOrEqual(3);
    });

    it('debe tener credenciales bcastellano/admin123 para admin', async () => {
      localStorage.clear();
      const usuarios = await usuariosService.obtenerUsuarios();
      const admin = usuarios.find((u) => u.login === 'bcastellano');

      expect(admin).toBeDefined();
      expect(admin.password).toBe('admin123');
      expect(admin.rol).toBe('admin');
    });

    it('debe tener credenciales clopez/operador123 para operador', async () => {
      localStorage.clear();
      const usuarios = await usuariosService.obtenerUsuarios();
      const operador = usuarios.find((u) => u.login === 'clopez');

      expect(operador).toBeDefined();
      expect(operador.password).toBe('operador123');
      expect(operador.rol).toBe('operador');
    });
  });

  describe('Integridad de datos', () => {
    it('debe mantener datos consistentes entre múltiples llamadas', async () => {
      const usuarios1 = await usuariosService.obtenerUsuarios();
      const usuarios2 = await usuariosService.obtenerUsuarios();

      expect(usuarios1).toEqual(usuarios2);
    });

    it('debe preservar createdAt al obtener usuarios', async () => {
      const usuarios = await usuariosService.obtenerUsuarios();

      usuarios.forEach((u) => {
        expect(u).toHaveProperty('createdAt');
      });
    });
  });
});
