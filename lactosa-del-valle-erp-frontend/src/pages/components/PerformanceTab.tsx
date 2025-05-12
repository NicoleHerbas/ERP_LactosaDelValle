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

interface Performance {
  id_evaluacion: number;
  id_empleado: number;
  fecha_evaluacion: string;
  calificacion: number;
  comentarios: string;
  estado: number;
}

interface PerformanceTabProps {
  employees: Employee[];
  attendance: any[]; // Adjust based on actual attendance data
  performance: Performance[];
  setPerformance: React.Dispatch<React.SetStateAction<Performance[]>>;
  setError: (error: string | null) => void;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ employees, attendance, performance, setPerformance, setError }) => {
  const calculateAttendanceScore = (empId: number) => {
    const daysWorked = attendance.filter(a => a.id_empleado === empId && a.estado === 1).length / 2; // Two shifts per day
    const daysWithFullHours = attendance.filter(a => a.id_empleado === empId && calculateWorkedHours(a.hora_entrada, a.hora_salida) >= 4).length / 2; // At least 4 hours per shift
    return daysWorked > 0 ? (daysWithFullHours / daysWorked) * 100 : 0;
  };

  const calculateWorkedHours = (hora_entrada: string, hora_salida: string): number => {
    const entrada = hora_entrada.split(':').slice(0, 2).join(':');
    const salida = hora_salida.split(':').slice(0, 2).join(':');
    const entradaDate = new Date(`1970-01-01T${entrada}:00`);
    const salidaDate = new Date(`1970-01-01T${salida}:00`);
    let timeDiffMs = salidaDate.getTime() - entradaDate.getTime();
    if (timeDiffMs < 0) timeDiffMs += 24 * 60 * 60 * 1000;
    return Number.isFinite(timeDiffMs / (1000 * 60 * 60)) ? Number((timeDiffMs / (1000 * 60 * 60)).toFixed(2)) : 0;
  };

  const handlePerformanceSubmit = async (e: React.FormEvent, empId: number) => {
    e.preventDefault();
    const score = calculateAttendanceScore(empId);
    const newPerformance = {
      id_evaluacion: performance.length + 1,
      id_empleado: empId,
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      calificacion: score,
      comentarios: score >= 80 ? 'Good attendance' : 'Needs improvement',
      estado: 1,
    };
    setPerformance([...performance, newPerformance]);
    // Simulate backend save (replace with actual API call)
    console.log('Performance saved:', newPerformance);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Evaluaciones de Desempeño</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Empleado</th>
              <th className="py-2 px-4 border-b text-left">Calificación (%)</th>
              <th className="py-2 px-4 border-b text-left">Comentarios</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const score = calculateAttendanceScore(emp.id_empleado);
              return (
                <tr key={emp.id_empleado} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{emp.nombre} {emp.apellido}</td>
                  <td className="py-2 px-4 border-b">{score.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{score >= 80 ? 'Good attendance' : 'Needs improvement'}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={(e) => handlePerformanceSubmit(e, emp.id_empleado)} className="bg-blue-500 text-white p-1">
                      Evaluar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceTab;