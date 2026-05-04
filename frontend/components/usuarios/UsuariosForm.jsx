import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react";

export default function UsuariosForm({ 
  onSubmit, 
  loading, 
  loginUnico, 
  onValidarLogin,
  usuarios = [],
  resetTrigger = 0  // Prop para resetear el formulario desde fuera
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "operador",
  });

  // Resetear formulario cuando resetTrigger cambia
  useEffect(() => {
    if (resetTrigger > 0) {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "operador",
      });
    }
  }, [resetTrigger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "email") {
      onValidarLogin(value, usuarios);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <UserPlus size={20} className="text-green-600" /> Registrar Nuevo Usuario
      </h3>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Ej: Juan Pérez"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Ej: jperez@example.com"
              className={`w-full p-2 border rounded-lg outline-none focus:ring-2 ${
                loginUnico ? "focus:ring-blue-500" : "border-red-500 focus:ring-red-500"
              }`}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {formData.email && (
              <span className={`text-xs absolute right-2 top-2.5 ${loginUnico ? "text-green-600" : "text-red-600"}`}>
                {loginUnico ? "✓ Disponible" : "✗ Existe"}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contraseña *
          </label>
          <input
            type="password"
            name="password"
            placeholder="Mín. 6 caracteres"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirmar Contraseña *
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirma tu contraseña"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Rol *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="operador">Operador</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !loginUnico}
          className="mt-6 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-bold transition-colors"
        >
          {loading ? "Creando..." : "Crear Usuario"}
        </button>
      </form>
    </div>
  );
}
