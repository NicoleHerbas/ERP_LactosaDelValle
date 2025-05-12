import React, { useState, useEffect } from 'react';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import EmployeeTab from './components/EmployeeTab';
import AttendanceTab from './components/AttendanceTab';
import PayrollTab from './components/PayrollTab';
import PerformanceTab from './components/PerformanceTab';

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
  nombre: string;
  apellido: string;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  estado: number;
  jornada: number;
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

interface Performance {
  id_evaluacion: number;
  id_empleado: number;
  fecha_evaluacion: string;
  calificacion: number;
  comentarios: string;
  estado: number;
}

const RRHH: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [employeeForm, setEmployeeForm] = useState({
    id_empleado: 0,
    nombre: '',
    apellido: '',
    salario: 0,
    fecha_contratacion: ''
  });
  const [attendanceForm, setAttendanceForm] = useState<Attendance>({
    id_asistencia: 0,
    id_empleado: 0,
    fecha: '',
    hora_entrada: '',
    hora_salida: '',
    estado: 1,
    jornada: 1,
    nombre: '',
    apellido: ''
  });
  const [payrollForm, setPayrollForm] = useState({
    id_nomina: 0,
    id_empleado: 0,
    fecha: '',
    salario_bruto: 0,
    deducciones: 0,
    salario_neto: 0
  });
  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchEmployees(), fetchAttendance(), fetchPayrolls()]);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('RRHH load error:', err);
        setError(`Failed to load RRHH data: ${errorMessage}`);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchEmployees = async () => {
    const response = await fetch('http://localhost:5000/api/employees');
    if (!response.ok) throw new Error('Failed to fetch employees');
    setEmployees(await response.json());
  };

  const fetchAttendance = async () => {
    const response = await fetch('http://localhost:5000/api/attendance');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch attendance: ${response.status} - ${errorText}`);
    }
    setAttendance(await response.json());
  };

  const fetchPayrolls = async () => {
    const response = await fetch('http://localhost:5000/api/payroll');
    if (!response.ok) throw new Error('Failed to fetch payrolls');
    setPayrolls(await response.json());
  };

  const deleteEmployee = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchEmployees();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to delete employee: ${errorMessage}`);
    }
  };

  const deleteAttendance = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchAttendance();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to delete attendance: ${errorMessage}`);
    }
  };

  const deletePayroll = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payroll/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchPayrolls();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to delete payroll: ${errorMessage}`);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Módulo de Recursos Humanos</h1>
      <div className="mb-4">
        <label className="mr-2">Seleccione Rol:</label>
        <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'employee')} className="border p-2">
          <option value="admin">Administrador</option>
          <option value="employee">Empleado</option>
        </select>
        {role === 'employee' && (
          <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value))} className="border p-2 ml-2">
            <option value={0}>Seleccione Empleado</option>
            {employees.map(emp => <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre} {emp.apellido}</option>)}
          </select>
        )}
      </div>
      <Tabs>
        <TabList className="flex space-x-4 border-b mb-4">
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Empleados</Tab>
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Asistencia</Tab>
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Nóminas</Tab>
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Desempeño</Tab>
        </TabList>
        <TabPanel>
          <EmployeeTab
            employees={employees}
            employeeForm={employeeForm}
            setEmployeeForm={setEmployeeForm}
            fetchEmployees={fetchEmployees}
            deleteEmployee={deleteEmployee}
            setError={setError}
          />
        </TabPanel>
        <TabPanel>
          <AttendanceTab
            employees={employees}
            attendance={role === 'admin' ? attendance : attendance.filter(a => a.id_empleado === selectedEmployeeId)}
            attendanceForm={attendanceForm}
            setAttendanceForm={setAttendanceForm}
            fetchAttendance={fetchAttendance}
            deleteAttendance={deleteAttendance}
            setError={setError}
          />
        </TabPanel>
        <TabPanel>
          <PayrollTab
            employees={employees}
            payrolls={role === 'admin' ? payrolls : payrolls.filter(p => p.id_empleado === selectedEmployeeId)}
            payrollForm={payrollForm}
            setPayrollForm={setPayrollForm}
            fetchPayrolls={fetchPayrolls}
            deletePayroll={deletePayroll}
            setError={setError}
          />
        </TabPanel>
        <TabPanel>
          <PerformanceTab
            employees={employees}
            attendance={role === 'admin' ? attendance : attendance.filter(a => a.id_empleado === selectedEmployeeId)}
            performance={performance}
            setPerformance={setPerformance}
            setError={setError}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default RRHH;
