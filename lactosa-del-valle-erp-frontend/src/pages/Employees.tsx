import { useEffect, useState } from 'react';
import { fetchEmployees } from '../services/api';
interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  fecha_contratacion: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load employees');
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Employee List (Recursos Humanos)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Nombre</th>
              <th className="py-2 px-4 border-b text-left">Apellido</th>
              <th className="py-2 px-4 border-b text-left">Cargo</th>
              <th className="py-2 px-4 border-b text-left">Fecha Contratación</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{employee.id}</td>
                <td className="py-2 px-4 border-b">{employee.nombre}</td>
                <td className="py-2 px-4 border-b">{employee.apellido}</td>
                <td className="py-2 px-4 border-b">{employee.cargo}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(employee.fecha_contratacion).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
