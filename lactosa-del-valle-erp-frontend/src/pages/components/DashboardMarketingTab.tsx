// src/pages/components/DashboardMarketingTab.tsx
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardMarketingTab: React.FC = () => {
  const dataPorFuente = {
    labels: ['Facebook', 'WhatsApp', 'Visita', 'Otro'],
    datasets: [
      {
        label: 'Leads por Fuente',
        data: [45, 30, 18, 7],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const dataPorCampaña = {
    labels: ['Lanzamiento Yogurt Natural', 'Campaña Verano', 'Campaña Leche Entera'],
    datasets: [
      {
        label: 'Leads por Campaña',
        data: [50, 20, 30],
        backgroundColor: ['#6366f1', '#34d399', '#f97316'],
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Dashboard de Marketing</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Leads por Fuente</h3>
          <Bar data={dataPorFuente} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Leads por Campaña</h3>
          <Pie data={dataPorCampaña} />
        </div>
      </div>
    </div>
  );
};

export default DashboardMarketingTab;
