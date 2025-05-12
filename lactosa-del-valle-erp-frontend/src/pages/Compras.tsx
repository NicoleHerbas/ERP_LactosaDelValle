import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Proveedor {
  id_proveedor: number;
  nombre: string;
}

interface Insumo {
  id_insumo: number;
  nombre: string;
}

interface Compra {
  id_compra: number;
  proveedor: string;
  insumo: string;
  cantidad: number;
  fecha_compra: string;
}

const Compras: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [form, setForm] = useState({
    id_proveedor: '',
    id_insumo: '',
    cantidad: '',
    fecha_compra: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProveedores, resInsumos, resCompras] = await Promise.all([
          axios.get('/api/production/proveedores'),
          axios.get('/api/production/insumos'),
          axios.get('/api/production/compras')
        ]);
        setProveedores(resProveedores.data);
        setInsumos(resInsumos.data);
        setCompras(resCompras.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/production/compras', form);
      alert('Compra registrada con éxito');
      setForm({ id_proveedor: '', id_insumo: '', cantidad: '', fecha_compra: '' });
      const resCompras = await axios.get('/api/production/compras');
      setCompras(resCompras.data);
    } catch (error) {
      console.error('Error al registrar compra:', error);
      alert('Error al registrar compra');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Registrar Compra de Insumos</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label className="block font-semibold mb-1">Proveedor:</label>
          <select
            name="id_proveedor"
            value={form.id_proveedor}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id_proveedor} value={prov.id_proveedor}>
                {prov.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Insumo:</label>
          <select
            name="id_insumo"
            value={form.id_insumo}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Seleccione un insumo</option>
            {insumos.map((ins) => (
              <option key={ins.id_insumo} value={ins.id_insumo}>
                {ins.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Cantidad:</label>
          <input
            type="number"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Fecha de compra:</label>
          <input
            type="date"
            name="fecha_compra"
            value={form.fecha_compra}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Registrar Compra
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-10 mb-4">Historial de Compras</h3>
      <table className="w-full border text-sm text-center bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Proveedor</th>
            <th className="border p-2">Insumo</th>
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id_compra}>
              <td className="border p-2">{compra.id_compra}</td>
              <td className="border p-2">{compra.proveedor}</td>
              <td className="border p-2">{compra.insumo}</td>
              <td className="border p-2">{compra.cantidad}</td>
              <td className="border p-2">{compra.fecha_compra.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Compras;
