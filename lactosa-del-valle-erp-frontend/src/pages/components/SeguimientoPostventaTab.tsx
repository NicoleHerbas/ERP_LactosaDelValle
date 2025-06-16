import React, { useEffect, useState } from 'react';

interface Seguimiento {
  id_seguimiento: number;
  id_venta: number;
  id_empleado: number;
  fecha_seguimiento: string;
  comentario: string;
  empleado: string;
}

const SeguimientoPostventaTab: React.FC = () => {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [form, setForm] = useState({
    id_venta: 0,
    id_empleado: 0,
    fecha_seguimiento: '',
    comentario: ''
  });

  const fetchSeguimientos = async () => {
    const res = await fetch('http://localhost:5000/api/seguimiento');
    const data = await res.json();
    setSeguimientos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/seguimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ id_venta: 0, id_empleado: 0, fecha_seguimiento: '', comentario: '' });
    fetchSeguimientos();
  };

  useEffect(() => {
    fetchSeguimientos();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Seguimiento Postventa</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-4 grid-cols-2 max-w-xl">
        <input type="number" value={form.id_venta} onChange={e => setForm({ ...form, id_venta: parseInt(e.target.value) })} placeholder="ID Venta" required className="border p-2" />
        <input type="number" value={form.id_empleado} onChange={e => setForm({ ...form, id_empleado: parseInt(e.target.value) })} placeholder="ID Empleado" required className="border p-2" />
        <input type="date" value={form.fecha_seguimiento} onChange={e => setForm({ ...form, fecha_seguimiento: e.target.value })} required className="border p-2" />
        <input type="text" value={form.comentario} onChange={e => setForm({ ...form, comentario: e.target.value })} placeholder="Comentario" required className="border p-2 col-span-2" />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 col-span-2">Registrar Seguimiento</button>
      </form>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th>ID</th>
            <th>Venta</th>
            <th>Empleado</th>
            <th>Fecha</th>
            <th>Comentario</th>
          </tr>
        </thead>
        <tbody>
          {seguimientos.map(s => (
            <tr key={s.id_seguimiento}>
              <td className="border px-2 py-1">{s.id_seguimiento}</td>
              <td className="border px-2 py-1">{s.id_venta}</td>
              <td className="border px-2 py-1">{s.empleado}</td>
              <td className="border px-2 py-1">{new Date(s.fecha_seguimiento).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{s.comentario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeguimientoPostventaTab;
