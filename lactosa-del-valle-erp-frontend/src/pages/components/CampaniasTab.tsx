import React, { useState, useEffect } from 'react';

interface Campania {
  id_campania: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  presupuesto: number;
  descripcion: string;
  estado: number; // 1 = activo, 0 = inactivo
}

const CampanasTab: React.FC = () => {
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto: 0,
    descripcion: '',
    estado: 1
  });

  const fetchCampanias = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/campanias');
      if (!res.ok) throw new Error('Error al obtener campañas');
      const data = await res.json();
      setCampanias(data);
    } catch (err) {
      console.error('Error al cargar campañas:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/campanias/campanias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      console.log("Datos enviados:", form);
      setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', presupuesto: 0, descripcion: '', estado: 1 });
      await fetchCampanias();
    } catch (err) {
      console.error('Error al enviar campaña:', err);
    }
  };

  useEffect(() => {
    fetchCampanias();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Campañas de Marketing</h2>

      <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-2 max-w-2xl mb-6">
        <input
          className="border p-2"
          placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="border p-2"
          type="number"
          placeholder="Presupuesto (Bs)"
          value={form.presupuesto}
          onChange={e => setForm({ ...form, presupuesto: parseFloat(e.target.value) || 0 })}
          required
        />
        <input
          className="border p-2"
          type="date"
          value={form.fecha_inicio}
          onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
          required
        />
        <input
          className="border p-2"
          type="date"
          value={form.fecha_fin}
          onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
          required
        />
        <textarea
          className="border p-2 col-span-2"
          placeholder="descripcion"
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          required
        />
        <button className="bg-blue-600 text-white py-2 col-span-2" type="submit">
          Agregar Campaña
        </button>
      </form>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th>Nombre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Presupuesto</th>
            <th>descripcion</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {campanias.map(c => (
            <tr key={c.id_campania} className="border-t">
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{new Date(c.fecha_inicio).toLocaleDateString()}</td>
              <td className="p-2">{new Date(c.fecha_fin).toLocaleDateString()}</td>
              <td className="p-2">
                Bs {isNaN(Number(c.presupuesto)) ? 'N/D' : Number(c.presupuesto).toFixed(2)}
              </td>
              <td className="p-2">{c.descripcion}</td>
              <td className="p-2">{c.estado === 1 ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampanasTab;
