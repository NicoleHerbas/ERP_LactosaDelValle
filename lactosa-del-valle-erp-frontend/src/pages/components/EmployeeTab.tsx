import React from 'react';

interface Employee {
  id_empleado: number;
  nombre: string;
  apellido: string;
  salario: number;
  fecha_contratacion: string;
  fechaRegistro: string;
  fechaActualizacion: string;
  estado: number;
}

interface EmployeeTabProps {
  employees: Employee[];
  employeeForm: { id_empleado: number; nombre: string; apellido: string; salario: number; fecha_contratacion: string };
  setEmployeeForm: React.Dispatch<React.SetStateAction<{ id_empleado: number; nombre: string; apellido: string; salario: number; fecha_contratacion: string }>>;
  fetchEmployees: () => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const EmployeeTab: React.FC<EmployeeTabProps> = ({ employees, employeeForm, setEmployeeForm, fetchEmployees, deleteEmployee, setError }) => {
  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = employeeForm.id_empleado ? 'PUT' : 'POST';
      const url = employeeForm.id_empleado
        ? `http://localhost:5000/api/employees/${employeeForm.id_empleado}`
        : 'http://localhost:5000/api/employees';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: employeeForm.nombre,
          apellido: employeeForm.apellido,
          salario: employeeForm.salario,
          fecha_contratacion: employeeForm.fecha_contratacion,
        }),
      });
      if (!response.ok) throw new Error('Failed to save employee');
      await fetchEmployees();
      setEmployeeForm({ id_empleado: 0, nombre: '', apellido: '', salario: 0, fecha_contratacion: '' });
    } catch (err) {
      setError('Failed to save employee');
    }
  };

  const formatDateForInput = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // Parse input value to handle both dot and comma as decimal separators
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(',', '.'); // Replace comma with dot
    const parsedValue = parseFloat(value) || 0; // Convert to number, default to 0 if invalid
    setEmployeeForm({ ...employeeForm, salario: parsedValue });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Lista de Empleados</h2>
      <form onSubmit={handleEmployeeSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            placeholder="Nombre"
            value={employeeForm.nombre}
            onChange={(e) => setEmployeeForm({ ...employeeForm, nombre: e.target.value })}
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Apellido</label>
          <input
            type="text"
            placeholder="Apellido"
            value={employeeForm.apellido}
            onChange={(e) => setEmployeeForm({ ...employeeForm, apellido: e.target.value })}
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Salario</label>
          <input
            type="number"
            placeholder="Salario"
            value={employeeForm.salario}
            onChange={handleSalaryChange}
            step="0.01" // Allow decimal inputs
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Fecha Contratación</label>
          <input
            type="date"
            value={employeeForm.fecha_contratacion || ''}
            onChange={(e) => setEmployeeForm({ ...employeeForm, fecha_contratacion: e.target.value })}
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          {employeeForm.id_empleado ? 'Actualizar' : 'Agregar'} Empleado
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Nombre</th>
              <th className="py-2 px-4 border-b text-left">Apellido</th>
              <th className="py-2 px-4 border-b text-left">Salario</th>
              <th className="py-2 px-4 border-b text-left">Fecha Contratación</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id_empleado} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{emp.id_empleado}</td>
                <td className="py-2 px-4 border-b">{emp.nombre}</td>
                <td className="py-2 px-4 border-b">{emp.apellido}</td>
                <td className="py-2 px-4 border-b">${emp.salario.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{new Date(emp.fecha_contratacion).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{emp.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => setEmployeeForm({
                      ...emp,
                      fecha_contratacion: formatDateForInput(emp.fecha_contratacion),
                    })}
                    className="bg-yellow-500 text-white p-1 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.id_empleado)}
                    className="bg-red-500 text-white p-1"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTab;