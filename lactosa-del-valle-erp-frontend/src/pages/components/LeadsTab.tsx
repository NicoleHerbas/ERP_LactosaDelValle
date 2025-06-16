import React, { useEffect, useState } from 'react';

interface Lead {
  id_lead: number;
  nombre: string;
  correo: string;
  telefono: string;
  fuente: string;
  id_campania: number;
  estado: string;
  campania?: string;
}

interface Campania {
  id_campania: number;
  nombre: string;
}

const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [form, setForm] = useState<Omit<Lead, 'id_lead' | 'estado'>>({
    nombre: '',
    correo: '',
    telefono: '',
    fuente: 'email',
    id_campania: 0,
  });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchLeads = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/leads');
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Respuesta inesperada del servidor de leads");
    }

    setLeads(data);
  } catch (err) {
    console.error('Error al cargar leads:', err);
  }
};


  const fetchCampanias = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/campanias');

    // No vuelvas a leer `res.text()` antes
    const data = await res.json(); // Esto es suficiente

    if (!Array.isArray(data)) {
      throw new Error("Respuesta inesperada del servidor");
    }

    setCampanias(data);
  } catch (err) {
    console.error('Error al cargar campañas:', err);
  }
};



  useEffect(() => {
    fetchLeads();
    fetchCampanias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId
      ? `http://localhost:5000/api/leads/${editId}`
      : 'http://localhost:5000/api/leads';
    const method = editId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({ nombre: '', correo: '', telefono: '', fuente: 'email', id_campania: 0 });
    setEditId(null);
    fetchLeads();
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:5000/api/leads/${id}`, { method: 'DELETE' });
    fetchLeads();
  };

  const handleEdit = (lead: Lead) => {
    setForm({
      nombre: lead.nombre,
      correo: lead.correo,
      telefono: lead.telefono,
      fuente: lead.fuente,
      id_campania: lead.id_campania
    });
    setEditId(lead.id_lead);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Leads</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input className="border p-2 w-full" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input className="border p-2 w-full" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />

        <select className="border p-2 w-full" value={form.fuente} onChange={(e) => setForm({ ...form, fuente: e.target.value })}>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="facebook">Facebook</option>
          <option value="visita">Visita</option>
          <option value="otro">Otro</option>
        </select>

        <select className="border p-2 w-full" value={form.id_campania} onChange={(e) => setForm({ ...form, id_campania: parseInt(e.target.value) })}>
          <option value={0}>Seleccione campaña</option>
          {campanias.map(c => <option key={c.id_campania} value={c.id_campania}>{c.nombre}</option>)}
        </select>

        <button className="bg-blue-600 text-white px-4 py-2">{editId ? 'Actualizar' : 'Agregar'} Lead</button>
      </form>

      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Nombre</th>
            <th className="border px-4 py-2 text-left">Correo</th>
            <th className="border px-4 py-2 text-left">Teléfono</th>
            <th className="border px-4 py-2 text-left">Fuente</th>
            <th className="border px-4 py-2 text-left">Campaña</th>
            <th className="border px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id_lead} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{lead.nombre}</td>
              <td className="border px-4 py-2">{lead.correo}</td>
              <td className="border px-4 py-2">{lead.telefono}</td>
              <td className="border px-4 py-2">{lead.fuente}</td>
              <td className="border px-4 py-2">{lead.campania}</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleEdit(lead)} className="bg-yellow-500 text-white px-2 py-1 mr-2">Editar</button>
                <button onClick={() => handleDelete(lead.id_lead)} className="bg-red-500 text-white px-2 py-1">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTab;
