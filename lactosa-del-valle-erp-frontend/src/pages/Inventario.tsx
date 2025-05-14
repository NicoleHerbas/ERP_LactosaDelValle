import React, { useEffect, useState } from 'react';
import axios from 'axios';

type InventarioItem = {
  producto: string;
  almacen: string;
  cantidad: number;
};

type Movimiento = {
  fecha_movimiento: string;
  producto: string;
  almacen: string;
  empleado: string;
  tipo_movimiento: string;
  cantidad: number;
};

const Inventario = () => {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  const fetchData = async () => {
    try {
      const [invRes, movRes] = await Promise.all([
        axios.get('/api/inventario'),
        axios.get('/api/inventario/movimientos')
      ]);
      setInventario(invRes.data);
      setMovimientos(movRes.data);
    } catch (err) {
      alert('Error al cargar datos del inventario');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h3 className="text-xl font-semibold mb-2">Historial de Movimientos</h3>

      <table className="w-full border text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Producto</th>
            <th className="border p-2">Almacén</th>
            <th className="border p-2">Empleado</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m, idx) => (
            <tr key={idx}>
              <td className="border p-2">{m.fecha_movimiento}</td>
              <td className="border p-2">{m.producto}</td>
              <td className="border p-2">{m.almacen}</td>
              <td className="border p-2">{m.empleado}</td>
              <td className="border p-2 capitalize">{m.tipo_movimiento}</td>
              <td className="border p-2">{m.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventario;
