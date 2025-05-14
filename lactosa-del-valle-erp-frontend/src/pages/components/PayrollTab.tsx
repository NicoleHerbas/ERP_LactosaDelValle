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

interface Payroll {
  id_nomina: number;
  id_empleado: number;
  nombre: string;
  apellido: string;
  fecha: string;
  salario_bruto: number;
  deducciones: number;
  salario_neto: number;
  estado: number;
}

interface PayrollTabProps {
  employees: Employee[];
  payrolls: Payroll[];
  payrollForm: {
    id_nomina: number;
    id_empleado: number;
    fecha: string;
    deducciones: number;
  };
  setPayrollForm: React.Dispatch<React.SetStateAction<{
    id_nomina: number;
    id_empleado: number;
    fecha: string;
    deducciones: number;
  }>>;
  fetchPayrolls: () => Promise<void>;
  deletePayroll: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const PayrollTab: React.FC<PayrollTabProps> = ({
  employees,
  payrolls,
  payrollForm,
  setPayrollForm,
  fetchPayrolls,
  deletePayroll,
  setError
}) => {
  const handlePayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = payrollForm.id_nomina ? 'PUT' : 'POST';
      const url = payrollForm.id_nomina
        ? `http://localhost:5000/api/payroll/${payrollForm.id_nomina}`
        : 'http://localhost:5000/api/payroll';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollForm),
      });
      if (!response.ok) throw new Error('Error al guardar la nómina.');
      await fetchPayrolls();
      setPayrollForm({
        id_nomina: 0,
        id_empleado: 0,
        fecha: '',
        deducciones: 0,
      });
    } catch (err) {
      setError('Error al guardar la nómina.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Nóminas</h2>
      <form onSubmit={handlePayrollSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium">Empleado</label>
          <select
            value={payrollForm.id_empleado}
            onChange={(e) => setPayrollForm({ ...payrollForm, id_empleado: parseInt(e.target.value) })}
            className="border p-2 w-full max-w-xs"
            required
          >
            <option value={0}>Seleccione Empleado</option>
            {employees.map((emp) => (
              <option key={emp.id_empleado} value={emp.id_empleado}>
                {emp.nombre} {emp.apellido}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Fecha</label>
          <input
            type="date"
            value={payrollForm.fecha}
            onChange={(e) => setPayrollForm({ ...payrollForm, fecha: e.target.value })}
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Deducciones</label>
          <input
            type="number"
            value={payrollForm.deducciones}
            onChange={(e) =>
              setPayrollForm({ ...payrollForm, deducciones: parseFloat(e.target.value.replace(',', '.')) || 0 })
            }
            step="0.01"
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          {payrollForm.id_nomina ? 'Actualizar' : 'Agregar'} Nómina
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Empleado</th>
              <th className="py-2 px-4 border-b">Fecha</th>
              <th className="py-2 px-4 border-b">Bruto</th>
              <th className="py-2 px-4 border-b">Deducciones</th>
              <th className="py-2 px-4 border-b">Neto</th>
              <th className="py-2 px-4 border-b">Estado</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((pay) => (
              <tr key={pay.id_nomina}>
                <td className="py-2 px-4 border-b">{pay.id_nomina}</td>
                <td className="py-2 px-4 border-b">{pay.nombre} {pay.apellido}</td>
                <td className="py-2 px-4 border-b">{new Date(pay.fecha).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">${pay.salario_bruto.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">${pay.deducciones.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">${pay.salario_neto.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{pay.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => setPayrollForm({
                      id_nomina: pay.id_nomina,
                      id_empleado: pay.id_empleado,
                      fecha: pay.fecha,
                      deducciones: pay.deducciones
                    })}
                    className="bg-yellow-500 text-white p-1 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletePayroll(pay.id_nomina)}
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

export default PayrollTab;
