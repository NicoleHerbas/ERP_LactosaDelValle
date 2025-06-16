import React, { useState, useEffect } from 'react';

interface Campana {
  id_campana: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  presupuesto: number;
  objetivo: string;
  estado: string;
}

const CampanasTab: React.FC = () => {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto: 0,
    objetivo: ''
  });

  const fetchCampanas = async () => {
    const res = await fetch('http://localhost:5000/api/campanas');
    const data = await res.json();
    setCampanas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/campanas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', presupuesto: 0, objetivo: '' });
    fetchCampanas();
  };

  useEffect(() => {
    fetchCampanas();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Campañas de Marketing</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-2 max-w-2xl mb-6">
        <input className="border p-2" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
        <input className="border p-2" type="number" placeholder="Presupuesto (Bs)" value={form.presupuesto} onChange={e => setForm({ ...form, presupuesto: parseFloat(e.target.value) })} required />
        <input className="border p-2" type="date" placeholder="Inicio" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} required />
        <input className="border p-2" type="date" placeholder="Fin" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} required />
        <textarea className="border p-2 col-span-2" placeholder="Objetivo" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} required />
        <button className="bg-blue-600 text-white py-2 col-span-2" type="submit">Agregar Campaña</button>
      </form>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th>Nombre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Presupuesto</th>
            <th>Objetivo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {campanas.map(c => (
            <tr key={c.id_campana} className="border-t">
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{new Date(c.fecha_inicio).toLocaleDateString()}</td>
              <td className="p-2">{new Date(c.fecha_fin).toLocaleDateString()}</td>
              <td className="p-2">Bs {c.presupuesto.toFixed(2)}</td>
              <td className="p-2">{c.objetivo}</td>
              <td className="p-2">{c.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampanasTab;
