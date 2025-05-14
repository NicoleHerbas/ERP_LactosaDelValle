import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Employee {
  id_empleado: number;
  nombre: string;
  apellido: string;
  salario: number;
  estado: number;
}

interface Attendance {
  id_empleado: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  estado: number;
}

interface Performance {
  id_evaluacion: number;
  id_empleado: number;
  fecha_evaluacion: string;
  calificacion: number;
  comentarios: string;
  nombre?: string;
  apellido?: string;
}

interface Props {
  employees: Employee[];
  attendance: Attendance[];
  setError: (msg: string | null) => void;
}

const PerformanceTab: React.FC<Props> = ({ employees, attendance, setError }) => {
  const [evaluaciones, setEvaluaciones] = useState<Performance[]>([]);

  const expectedWorkingDays = 22;
  const expectedHours = expectedWorkingDays * 8;

  const calculateWorkedHours = (entrada: string, salida: string): number => {
    const entradaDate = new Date(`1970-01-01T${entrada}`);
    const salidaDate = new Date(`1970-01-01T${salida}`);
    let diff = salidaDate.getTime() - entradaDate.getTime();
    if (diff < 0) diff += 24 * 60 * 60 * 1000;
    return +(diff / (1000 * 60 * 60)).toFixed(2);
  };

  const calculatePerformanceScore = (id_empleado: number): number => {
    const registros = attendance.filter(a => a.id_empleado === id_empleado && a.estado === 1);
    const totalHoras = registros.reduce((sum, a) => sum + calculateWorkedHours(a.hora_entrada, a.hora_salida), 0);
    const porcentaje = totalHoras / expectedHours * 100;
    return Math.min(100, Math.max(0, +porcentaje.toFixed(2)));
  };

  const getComentario = (score: number) => {
    return score >= 90 ? 'Excelente asistencia' :
           score >= 75 ? 'Buena asistencia' :
           score >= 50 ? 'Regular' : 'Deficiente';
  };

  const handleEvaluar = async (e: React.FormEvent, empleado: Employee) => {
    e.preventDefault();
    const score = calculatePerformanceScore(empleado.id_empleado);
    const nuevaEvaluacion: Omit<Performance, 'id_evaluacion'> = {
      id_empleado: empleado.id_empleado,
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      calificacion: score,
      comentarios: getComentario(score),
    };

    try {
      const res = await fetch('http://localhost:5000/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaEvaluacion)
      });

      if (!res.ok) throw new Error("Error al guardar evaluación");
      await fetchEvaluaciones();
    } catch (err) {
      setError('Error al evaluar desempeño');
    }
  };

  const fetchEvaluaciones = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/performance');
      const data = await res.json();
      setEvaluaciones(data);
    } catch (err) {
      setError("No se pudo cargar historial");
    }
  };

  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const exportCSV = () => {
    const csv = Papa.unparse(evaluaciones.map(e => ({
      Empleado: `${e.nombre} ${e.apellido}`,
      Fecha: e.fecha_evaluacion,
      Calificación: e.calificacion,
      Comentarios: e.comentarios
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'evaluaciones.csv');
  };

  // Datos para gráfico
  const graficoData = {
    labels: [...new Set(evaluaciones.map(e => `${e.nombre} ${e.apellido}`))],
    datasets: [{
      label: 'Promedio de Desempeño (%)',
      data: evaluaciones.reduce((acc, e) => {
        const key = `${e.nombre} ${e.apellido}`;
        acc[key] = acc[key] ? [...acc[key], e.calificacion] : [e.calificacion];
        return acc;
      }, {} as Record<string, number[]>),
    }]
  };

  // Convertir los datos a promedio por empleado
  graficoData.datasets[0].data = Object.values(graficoData.datasets[0].data).map(arr => (
    +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
  ));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Evaluaciones de Desempeño</h2>

      <h3 className="text-lg font-semibold">Evaluar Asistencia</h3>
      <table className="min-w-full border mt-2 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Empleado</th>
            <th className="py-2 px-4 border">Calificación (%)</th>
            <th className="py-2 px-4 border">Comentarios</th>
            <th className="py-2 px-4 border">Acción</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => {
            const score = calculatePerformanceScore(emp.id_empleado);
            return (
              <tr key={emp.id_empleado}>
                <td className="py-2 px-4 border">{emp.nombre} {emp.apellido}</td>
                <td className="py-2 px-4 border">{score.toFixed(2)}</td>
                <td className="py-2 px-4 border">{getComentario(score)}</td>
                <td className="py-2 px-4 border">
                  <button onClick={(e) => handleEvaluar(e, emp)} className="bg-blue-500 text-white px-2 py-1 rounded">
                    Evaluar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 className="text-lg font-semibold">Historial de Evaluaciones</h3>
      <button onClick={exportCSV} className="mb-2 bg-green-600 text-white px-3 py-1 rounded">
        Descargar CSV
      </button>
      <table className="min-w-full border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Empleado</th>
            <th className="py-2 px-4 border">Fecha</th>
            <th className="py-2 px-4 border">Calificación</th>
            <th className="py-2 px-4 border">Comentario</th>
          </tr>
        </thead>
        <tbody>
          {evaluaciones.map(e => (
            <tr key={e.id_evaluacion}>
              <td className="py-2 px-4 border">{e.nombre} {e.apellido}</td>
              <td className="py-2 px-4 border">{e.fecha_evaluacion}</td>
              <td className="py-2 px-4 border">{e.calificacion.toFixed(2)}%</td>
              <td className="py-2 px-4 border">{e.comentarios}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-semibold mb-2">Promedio por Empleado</h3>
      <Bar
        data={{
          labels: graficoData.labels,
          datasets: [{
            label: 'Promedio de Desempeño (%)',
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            data: graficoData.datasets[0].data
          }]
        }}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }}
      />
    </div>
  );
};

export default PerformanceTab;
