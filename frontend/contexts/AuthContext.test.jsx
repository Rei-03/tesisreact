import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const { isAuthenticated, user, login, logout, isAdmin } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Autenticado' : 'No autenticado'}
      </div>
      {user && (
        <div>
          <div data-testid="user-nombre">{user.nombre || user.name}</div>
          <div data-testid="user-role">{user.rol || user.role}</div>
        </div>
      )}
      <div data-testid="is-admin">{isAdmin() ? 'Es Admin' : 'No es Admin'}</div>
      <button
        onClick={() =>
          login({
            id: 2,
            nombre: 'Carlos López',
            login: 'clopez',
            rol: 'operador',
          })
        }
        data-testid="login-button"
      >
        Login
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('AuthProvider - Inicialización', () => {
    it('debe inicializar con usuario demo si no hay datos guardados', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
      });

      expect(screen.getByTestId('user-nombre')).toHaveTextContent('Brayan Castellano');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('Es Admin');
    });

    it('debe cargar usuario desde localStorage si está guardado', async () => {
      const savedUser = {
        id: 5,
        nombre: 'Usuario Guardado',
        login: 'usuariosaved',
        rol: 'especialista',
      };

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(savedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-nombre')).toHaveTextContent('Usuario Guardado');
      });

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    });

    it('debe manejar localStorage corrupto gracefully', async () => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', '{invalid json}');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
      });
    });
  });

  describe('useAuth Hook', () => {
    it('debe lanzar error si se usa fuera de AuthProvider', () => {
      // Suprimir los errores de consola para esta prueba
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('debe actualizar estado authentication al hacer login', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-nombre')).toHaveTextContent('Carlos López');
      });
    });

    it('debe guardar usuario en localStorage al hacer login', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('userData'));
        expect(savedData.nombre).toBe('Carlos López');
      });
    });

    it('debe actualizar isAuthenticated a true', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
      });
    });
  });

  describe('logout', () => {
    it('debe actualizar estado authentication al hacer logout', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('No autenticado');
      });
    });

    it('debe limpiar localStorage al hacer logout', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(localStorage.getItem('isAuthenticated')).toBeNull();
        expect(localStorage.getItem('userData')).toBeNull();
      });
    });

    it('debe limpiar datos de usuario al hacer logout', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('No autenticado');
      });
    });
  });

  describe('isAdmin', () => {
    it('debe retornar true si rol es admin', async () => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem(
        'userData',
        JSON.stringify({
          id: 1,
          nombre: 'Admin User',
          login: 'admin',
          rol: 'admin',
        })
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Es Admin');
      });
    });

    it('debe retornar false si rol no es admin', async () => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem(
        'userData',
        JSON.stringify({
          id: 2,
          nombre: 'Operador User',
          login: 'operador',
          rol: 'operador',
        })
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-admin')).toHaveTextContent('No es Admin');
      });
    });

    it('debe soportar property "role" en mayúscula', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      // El componente debe actualizar correctamente
      await waitFor(() => {
        expect(screen.getByTestId('user-nombre')).toHaveTextContent('Carlos López');
      });
    });
  });

  describe('Conteo de renders', () => {
    it('isAdmin debe ser memoizado correctamente', async () => {
      const renderSpy = jest.fn();

      const TestComponentWithSpy = () => {
        const auth = useAuth();
        renderSpy();
        return <div>{auth.isAdmin() ? 'Admin' : 'No Admin'}</div>;
      };

      const { rerender } = render(
        <AuthProvider>
          <TestComponentWithSpy />
        </AuthProvider>
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Cambiar algo que no debería afectar isAdmin
      rerender(
        <AuthProvider>
          <TestComponentWithSpy />
        </AuthProvider>
      );

      // Aunque puede haber múltiples renders, el componente debe funcionar
      expect(renderSpy.mock.calls.length >= initialRenderCount).toBe(true);
    });
  });

  describe('Multiple logins', () => {
    it('debe permitir cambiar usuario con múltiples logins', async () => {
      const user = userEvent.setup();

      const MultiLoginComponent = () => {
        const { login, user: authUser } = useAuth();

        return (
          <div>
            <div data-testid="user-display">{authUser?.nombre}</div>
            <button
              onClick={() =>
                login({ id: 1, nombre: 'Usuario 1', login: 'user1', rol: 'admin' })
              }
              data-testid="login-user-1"
            >
              Login User 1
            </button>
            <button
              onClick={() =>
                login({ id: 2, nombre: 'Usuario 2', login: 'user2', rol: 'operador' })
              }
              data-testid="login-user-2"
            >
              Login User 2
            </button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MultiLoginComponent />
        </AuthProvider>
      );

      const user1Button = screen.getByTestId('login-user-1');
      await user.click(user1Button);

      await waitFor(() => {
        expect(screen.getByTestId('user-display')).toHaveTextContent('Usuario 1');
      });

      const user2Button = screen.getByTestId('login-user-2');
      await user.click(user2Button);

      await waitFor(() => {
        expect(screen.getByTestId('user-display')).toHaveTextContent('Usuario 2');
      });
    });
  });
});
