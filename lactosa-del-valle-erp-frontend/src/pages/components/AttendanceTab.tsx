import React, { useState } from 'react';

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

interface AttendanceTabProps {
  employees: Employee[];
  attendance: Attendance[];
  attendanceForm: Attendance;
  setAttendanceForm: React.Dispatch<React.SetStateAction<Attendance>>;
  fetchAttendance: () => Promise<void>;
  deleteAttendance: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ employees, attendance, attendanceForm, setAttendanceForm, fetchAttendance, deleteAttendance, setError }) => {
  const calculateWorkedHours = (hora_entrada: string, hora_salida: string): number => {
    const entrada = hora_entrada.split(':').slice(0, 2).join(':');
    const salida = hora_salida.split(':').slice(0, 2).join(':');
    
    const entradaDate = new Date(`1970-01-01T${entrada}:00`);
    const salidaDate = new Date(`1970-01-01T${salida}:00`);
    
    let timeDiffMs = salidaDate.getTime() - entradaDate.getTime();
    if (timeDiffMs < 0) {
      timeDiffMs += 24 * 60 * 60 * 1000;
    }
    
    const hoursDiff = timeDiffMs / (1000 * 60 * 60);
    return Number.isFinite(hoursDiff) ? Number(hoursDiff.toFixed(2)) : 0;
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = attendanceForm.id_asistencia ? 'PUT' : 'POST';
      const url = attendanceForm.id_asistencia
        ? `http://localhost:5000/api/attendance/${attendanceForm.id_asistencia}`
        : 'http://localhost:5000/api/attendance';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_empleado: attendanceForm.id_empleado,
          fecha: attendanceForm.fecha,
          hora_entrada: attendanceForm.hora_entrada,
          hora_salida: attendanceForm.hora_salida,
          jornada: attendanceForm.jornada,
          estado: 1,
        }),
      });
      if (!response.ok) throw new Error('Failed to save attendance');
      await fetchAttendance();
      setAttendanceForm({
        id_asistencia: 0,
        id_empleado: 0,
        fecha: '',
        hora_entrada: '',
        hora_salida: '',
        estado: 1,
        jornada: 1,
        nombre: '', // Reset to empty string
        apellido: '', // Reset to empty string
      });
    } catch (err) {
      setError('Failed to save attendance');
    }
  };

  const simulateAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      for (const emp of employees) {
        // First shift (e.g., 8:00-12:00 ± 1 hour)
        const shift1Start = new Date(`1970-01-01T07:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`);
        const shift1End = new Date(shift1Start.getTime() + (3.5 + Math.random() * 1) * 60 * 60 * 1000);
        await fetch('http://localhost:5000/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_empleado: emp.id_empleado,
            fecha: today,
            hora_entrada: shift1Start.toTimeString().slice(0, 5),
            hora_salida: shift1End.toTimeString().slice(0, 5),
            jornada: 1,
            estado: 1,
          }),
        });

        // Second shift (e.g., 13:00-17:00 ± 1 hour)
        const shift2Start = new Date(`1970-01-01T12:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`);
        const shift2End = new Date(shift2Start.getTime() + (3.5 + Math.random() * 1) * 60 * 60 * 1000);
        await fetch('http://localhost:5000/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_empleado: emp.id_empleado,
            fecha: today,
            hora_entrada: shift2Start.toTimeString().slice(0, 5),
            hora_salida: shift2End.toTimeString().slice(0, 5),
            jornada: 2,
            estado: 1,
          }),
        });
      }
      await fetchAttendance();
    } catch (err) {
      setError('Failed to simulate attendance');
    }
  };

  const getDailyHours = (empId: number, date: string) => {
    const dayRecords = attendance.filter(a => a.id_empleado === empId && a.fecha === date);
    return dayRecords.reduce((sum, record) => sum + calculateWorkedHours(record.hora_entrada, record.hora_salida), 0).toFixed(2);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Registros de Asistencia</h2>
      <button onClick={simulateAttendance} className="bg-green-500 text-white p-2 mb-4">Simulate Attendance</button>
      <form onSubmit={handleAttendanceSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium">Empleado</label>
          <select
            value={attendanceForm.id_empleado}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, id_empleado: parseInt(e.target.value) })}
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
            value={attendanceForm.fecha}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, fecha: e.target.value })}
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Jornada</label>
          <select
            value={attendanceForm.jornada}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, jornada: parseInt(e.target.value) })}
            className="border p-2 w-full max-w-xs"
            required
          >
            <option value={1}>Jornada 1</option>
            <option value={2}>Jornada 2</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Hora Entrada</label>
          <input
            type="time"
            value={attendanceForm.hora_entrada}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, hora_entrada: e.target.value })}
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Hora Salida</label>
          <input
            type="time"
            value={attendanceForm.hora_salida}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, hora_salida: e.target.value })}
            className="border p-2 w-full max-w-xs"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          {attendanceForm.id_asistencia ? 'Actualizar' : 'Agregar'} Asistencia
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Empleado</th>
              <th className="py-2 px-4 border-b text-left">Fecha</th>
              <th className="py-2 px-4 border-b text-left">Jornada</th>
              <th className="py-2 px-4 border-b text-left">Entrada</th>
              <th className="py-2 px-4 border-b text-left">Salida</th>
              <th className="py-2 px-4 border-b text-left">Horas</th>
              <th className="py-2 px-4 border-b text-left">Total Diario</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((att) => {
              const hours = calculateWorkedHours(att.hora_entrada, att.hora_salida);
              const dailyTotal = getDailyHours(att.id_empleado, att.fecha);
              return (
                <tr key={att.id_asistencia} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{att.nombre} {att.apellido}</td>
                  <td className="py-2 px-4 border-b">{new Date(att.fecha).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">{att.jornada === 1 ? 'Jornada 1' : 'Jornada 2'}</td>
                  <td className="py-2 px-4 border-b">{att.hora_entrada}</td>
                  <td className="py-2 px-4 border-b">{att.hora_salida}</td>
                  <td className="py-2 px-4 border-b">{hours.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{dailyTotal}</td>
                  <td className="py-2 px-4 border-b">{att.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => setAttendanceForm({
                        ...att,
                        hora_entrada: att.hora_entrada.split(':').slice(0, 2).join(':'),
                        hora_salida: att.hora_salida.split(':').slice(0, 2).join(':'),
                      })}
                      className="bg-yellow-500 text-white p-1 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteAttendance(att.id_asistencia)}
                      className="bg-red-500 text-white p-1"
                    >
                      Eliminar
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

export default AttendanceTab;