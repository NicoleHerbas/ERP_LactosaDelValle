import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface KPIs {
  totalEmpleados: number;
  salarioTotal: number;
  ventasRealizadas: number;
  facturasPagadas: number;
}

interface Reportes {
  empleados: any[];
  ventas: any[];
  facturas: any[];
  nominas: any[];
}

interface Vendedor {
  nombre: string;
  totalVentas: number;
}

const Direccion = () => {
  const [kpis, setKpis] = useState<KPIs>({
    totalEmpleados: 0,
    salarioTotal: 0,
    ventasRealizadas: 0,
    facturasPagadas: 0,
  });
  const [reportes, setReportes] = useState<Reportes | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get('/api/direccion/kpis')
      .then(res => setKpis(res.data))
      .catch(err => {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        }
      });

    axios.get('/api/direccion/top-vendedores')
      .then(res => setVendedores(res.data));
  }, []);

  const generarReportes = () => {
    axios.get('/api/direccion/reportes').then(res => setReportes(res.data));
  };

  const exportarPDF = async () => {
    if (panelRef.current) {
      const canvas = await html2canvas(panelRef.current);
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('reporte_direccion.pdf');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Panel Estratégico - Dirección</h2>

      <div ref={panelRef}>
        {error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Total Empleados</h3>
              <p>{kpis.totalEmpleados}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Salario Total</h3>
              <p>{kpis.salarioTotal}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Ventas Completadas</h3>
              <p>{kpis.ventasRealizadas}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Facturas Pagadas</h3>
              <p>{kpis.facturasPagadas}</p>
            </div>
          </div>
        )}

        {vendedores.length > 0 && (
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-bold mb-3">Top 5 Vendedores</h3>
            <Bar
              data={{
                labels: vendedores.map(v => v.nombre),
                datasets: [{
                  label: 'Ventas Completadas',
                  data: vendedores.map(v => v.totalVentas),
                }]
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={generarReportes} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Generar Reportes
        </button>
        <button onClick={exportarPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Exportar PDF
        </button>
      </div>

      {reportes && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Resumen de Reportes</h3>
          <ul className="list-disc pl-6">
            <li>Empleados: {reportes.empleados.length}</li>
            <li>Ventas: {reportes.ventas.length}</li>
            <li>Facturas: {reportes.facturas.length}</li>
            <li>Nóminas: {reportes.nominas.length}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Direccion;