import React, { useEffect, useState } from 'react';

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

interface Attendance {
  id_asistencia: number;
  id_empleado: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  jornada?: number;
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
  payrollForm: { id_nomina: number; id_empleado: number; fecha: string; salario_bruto: number; deducciones: number; salario_neto: number };
  setPayrollForm: React.Dispatch<React.SetStateAction<{ id_nomina: number; id_empleado: number; fecha: string; salario_bruto: number; deducciones: number; salario_neto: number }>>;
  fetchPayrolls: () => Promise<void>;
  deletePayroll: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const PayrollTab: React.FC<PayrollTabProps> = ({ employees, payrolls, payrollForm, setPayrollForm, fetchPayrolls, deletePayroll, setError }) => {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);

  // Fetch attendance data for the selected employee and month
  const fetchAttendanceForEmployee = async (id_empleado: number, month: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      // Filter by employee and month (YYYY-MM format)
      const filteredData = data.filter((att: Attendance) => {
        const attMonth = att.fecha.slice(0, 7); // Extract YYYY-MM from fecha
        return att.id_empleado === id_empleado && attMonth === month && att.estado === 1;
      });
      setAttendanceData(filteredData);
    } catch (err) {
      setError('Failed to fetch attendance for payroll calculation');
    }
  };

  // Calculate hours worked for a single attendance record
  const calculateWorkedHours = (hora_entrada: string, hora_salida: string): number => {
    const entrada = hora_entrada.split(':').slice(0, 2).join(':');
    const salida = hora_salida.split(':').slice(0, 2).join(':');
    const entradaDate = new Date(`1970-01-01T${entrada}:00`);
    const salidaDate = new Date(`1970-01-01T${salida}:00`);
    let timeDiffMs = salidaDate.getTime() - entradaDate.getTime();
    if (timeDiffMs < 0) timeDiffMs += 24 * 60 * 60 * 1000;
    const hoursDiff = timeDiffMs / (1000 * 60 * 60);
    return Number.isFinite(hoursDiff) ? Number(hoursDiff.toFixed(2)) : 0;
  };

  useEffect(() => {
    if (payrollForm.id_empleado && payrollForm.fecha) {
      const month = payrollForm.fecha.slice(0, 7); // Extract YYYY-MM
      fetchAttendanceForEmployee(payrollForm.id_empleado, month);
    }
  }, [payrollForm.id_empleado, payrollForm.fecha]);

  useEffect(() => {
    const emp = employees.find(e => e.id_empleado === payrollForm.id_empleado);
    if (emp && attendanceData.length > 0) {
      const workingDays = 22; // Assume 22 working days per month
      const hourlyRate = emp.salario / (workingDays * 8); // Salary per hour
      // Sum total hours worked for the month
      const totalHours = attendanceData.reduce((sum, att) => {
        return sum + calculateWorkedHours(att.hora_entrada, att.hora_salida);
      }, 0);
      const expectedSalary = totalHours * hourlyRate;
      const deductions = payrollForm.deducciones || 0;
      setPayrollForm({ ...payrollForm, salario_bruto: expectedSalary, salario_neto: expectedSalary - deductions });
    }
  }, [payrollForm.id_empleado, payrollForm.deducciones, payrollForm.fecha, employees, attendanceData, setPayrollForm]);

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
        body: JSON.stringify({
          id_empleado: payrollForm.id_empleado,
          fecha: payrollForm.fecha,
          salario_bruto: payrollForm.salario_bruto,
          deducciones: payrollForm.deducciones,
          salario_neto: payrollForm.salario_neto,
        }),
      });
      if (!response.ok) throw new Error('Failed to save payroll');
      await fetchPayrolls();
      setPayrollForm({ id_nomina: 0, id_empleado: 0, fecha: '', salario_bruto: 0, deducciones: 0, salario_neto: 0 });
    } catch (err) {
      setError('Failed to save payroll');
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
          <label className="block text-sm font-medium">Salario Bruto</label>
          <input
            type="number"
            placeholder="Salario Bruto"
            value={payrollForm.salario_bruto}
            onChange={(e) => setPayrollForm({ ...payrollForm, salario_bruto: parseFloat(e.target.value.replace(',', '.')) || 0 })}
            step="0.01"
            className="border p-2 w-full max-w-xs"
            readOnly // Auto-calculated
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Deducciones</label>
          <input
            type="number"
            placeholder="Deducciones"
            value={payrollForm.deducciones}
            onChange={(e) => setPayrollForm({ ...payrollForm, deducciones: parseFloat(e.target.value.replace(',', '.')) || 0 })}
            step="0.01"
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Salario Neto</label>
          <input
            type="number"
            placeholder="Salario Neto"
            value={payrollForm.salario_neto}
            onChange={(e) => setPayrollForm({ ...payrollForm, salario_neto: parseFloat(e.target.value.replace(',', '.')) || 0 })}
            step="0.01"
            className="border p-2 w-full max-w-xs"
            readOnly // Auto-calculated
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
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Empleado</th>
              <th className="py-2 px-4 border-b text-left">Fecha</th>
              <th className="py-2 px-4 border-b text-left">Salario Bruto</th>
              <th className="py-2 px-4 border-b text-left">Deducciones</th>
              <th className="py-2 px-4 border-b text-left">Salario Neto</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((pay) => (
              <tr key={pay.id_nomina} className="hover:bg-gray-50">
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
                      salario_bruto: pay.salario_bruto,
                      deducciones: pay.deducciones,
                      salario_neto: pay.salario_neto,
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