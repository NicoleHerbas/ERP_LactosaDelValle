import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Employees from './pages/Employees';
import Production from './pages/Production';
import Ordenes from './pages/Ordenes';
import Compras from './pages/Compras';
import ControlCalidad from './pages/ControlCalidad';
import DashboardProduccion from './pages/DashboardProduccion';
import { useState } from 'react';
import Inventario from './pages/Inventario';
import Direccion from './pages/Direccion';

function App() {
  const navigate = useNavigate();
  const [productionPath, setProductionPath] = useState('');

  const handleProductionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPath = e.target.value;
    if (selectedPath !== '') {
      setProductionPath('');
      navigate(selectedPath);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lactosa del Valle ERP</h1>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/employees" className="hover:underline">Empleados</Link></li>
              <li><Link to="/direccion" className="hover:underline">Direccion</Link></li>
              {/* ComboBox para Producción */}
              <li>
                <select
                  value={productionPath}
                  onChange={handleProductionChange}
                  className="text-black px-2 py-1 rounded"
                >
                  <option value="">Producción</option>
                  <option value="/inventario">Inventario</option>
                  <option value="/ordenes">Órdenes</option>
                  <option value="/compras">Compras</option>
                  <option value="/control-calidad">Control Calidad</option>
                  <option value="/dashboard">Dashboard</option>
                </select>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/control-calidad" element={<ControlCalidad />} />
          <Route path="/dashboard" element={<DashboardProduccion />} />
          <Route path="/direccion" element={<Direccion />} />

        </Routes>
      </main>
    </div>
  );
}

export default App;
