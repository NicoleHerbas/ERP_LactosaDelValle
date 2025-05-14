import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface OrdenEstadistica {
  estado: string;
  total: number;
}

interface ProductoFabricado {
  nombre: string;
  total: number;
}

interface ProduccionDiaria {
  fecha: string;
  total: number;
}

const DashboardProduccion: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenEstadistica[]>([]);
  const [productos, setProductos] = useState<ProductoFabricado[]>([]);
  const [produccionDiaria, setProduccionDiaria] = useState<ProduccionDiaria[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resDashboard, resProduccion] = await Promise.all([
          axios.get('/api/production/dashboard'),
          axios.get('/api/production/dashboard/produccion-diaria')
        ]);

        setOrdenes(resDashboard.data.ordenes || []);
        setProductos(resDashboard.data.topProductos || []);
        setProduccionDiaria(resProduccion.data || []);
      } catch (err) {
        console.error('Error al obtener datos del dashboard', err);
      }
    };
    fetchData();
  }, []);

  const ordenesData = {
    labels: ordenes.map(o => o.estado),
    datasets: [
      {
        label: 'Órdenes por Estado',
        data: ordenes.map(o => o.total),
        backgroundColor: ['#FFCD56', '#36A2EB', '#4BC0C0']
      }
    ]
  };

  const productosData = {
    labels: productos.map(p => p.nombre),
    datasets: [
      {
        label: 'Productos más fabricados',
        data: productos.map(p => p.total),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }
    ]
  };

  const produccionLineaData = {
    labels: produccionDiaria.map(p => p.fecha),
    datasets: [
      {
        label: 'Producción por Día',
        data: produccionDiaria.map(p => p.total),
        fill: false,
        borderColor: '#36A2EB',
        backgroundColor: '#36A2EB',
        tension: 0.2
      }
    ]
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Dashboard de Producción</h2>

      <div style={{ marginBottom: '50px' }}>
        <h3>Órdenes por Estado</h3>
        <Bar data={ordenesData} />
      </div>

      <div style={{ marginBottom: '50px' }}>
        <h3>Productos Más Fabricados</h3>
        <Pie data={productosData} />
      </div>

      <div style={{ marginBottom: '50px' }}>
        <h3>Producción por Día</h3>
        <Line data={produccionLineaData} />
      </div>
    </div>
  );
};

export default DashboardProduccion;
