import React, { useState, useEffect } from 'react';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import CotizacionesTab from './components/CotizacionesTab';
//import SeguimientoPostventaTab from './components/SeguimientoPostventaTab';
import CampañasTab from './components/CampaniasTab';
import LeadsTab from './components/LeadsTab';
import ClientesTab from './components/ClientesTab';
import DashboardMarketingTab from './components/DashboardMarketingTab';

const MarketingVentas: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si necesitas cargar datos globales
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center">Cargando módulo...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Marketing</h1>
      <Tabs>
        <TabList className="flex space-x-4 border-b mb-4">
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Cotizaciones</Tab>
          {/* <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Seguimiento</Tab> */}
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Campañas</Tab>
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Leads</Tab>
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Clientes</Tab>
          <Tab className="cursor-pointer py-2 px-4 hover:bg-gray-200">Dashboard Marketing</Tab>
        </TabList>

        <TabPanel>
          <CotizacionesTab />
        </TabPanel>
       {/*  <TabPanel>
          <SeguimientoPostventaTab />
        </TabPanel> */}
        <TabPanel>
          <CampañasTab />
        </TabPanel>
        <TabPanel>
          <LeadsTab />
        </TabPanel>
          <TabPanel>
          <ClientesTab />
        </TabPanel>
        <TabPanel>
    <DashboardMarketingTab />
  </TabPanel>
      </Tabs>
    </div>
  );
};

export default MarketingVentas;
