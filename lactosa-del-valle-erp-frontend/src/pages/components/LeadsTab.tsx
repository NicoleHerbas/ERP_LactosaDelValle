import React, { useEffect, useState } from 'react';

interface Lead {
  id_lead: number;
  nombre: string;
  correo: string;
  telefono: string;
  fuente: string;
  estado: string;
}

const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState<Omit<Lead, 'id_lead' | 'estado'>>({
    nombre: '',
    correo: '',
    telefono: '',
    fuente: 'email'
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchLeads = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leads');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Respuesta inesperada del servidor de leads");
      setLeads(data);
    } catch (err) {
      console.error('Error al cargar leads:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.correo.includes('@')) newErrors.correo = 'Correo inválido';
    if (!/^\d{7,15}$/.test(form.telefono)) newErrors.telefono = 'Teléfono inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const url = editId
      ? `http://localhost:5000/api/leads/${editId}`
      : 'http://localhost:5000/api/leads';
    const method = editId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({ nombre: '', correo: '', telefono: '', fuente: 'email' });
    setEditId(null);
    fetchLeads();
    setErrors({});
  };

  const handleEdit = (lead: Lead) => {
    setForm({
      nombre: lead.nombre,
      correo: lead.correo,
      telefono: lead.telefono,
      fuente: lead.fuente
    });
    setEditId(lead.id_lead);
    setErrors({});
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      await fetch(`http://localhost:5000/api/leads/${deleteId}`, { method: 'DELETE' });
      fetchLeads();
      setDeleteId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Leads</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input className="border p-2 w-full" placeholder="Nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}

        <input className="border p-2 w-full" placeholder="Correo" value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })} />
        {errors.correo && <p className="text-red-500 text-sm">{errors.correo}</p>}

        <input className="border p-2 w-full" placeholder="Teléfono" value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}

        <select className="border p-2 w-full" value={form.fuente}
          onChange={(e) => setForm({ ...form, fuente: e.target.value })}>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="facebook">Facebook</option>
          <option value="visita">Visita</option>
          <option value="otro">Otro</option>
        </select>

        <button className="bg-blue-600 text-white px-4 py-2">
          {editId ? 'Actualizar' : 'Agregar'} Lead
        </button>
      </form>

      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Nombre</th>
            <th className="border px-4 py-2 text-left">Correo</th>
            <th className="border px-4 py-2 text-left">Teléfono</th>
            <th className="border px-4 py-2 text-left">Fuente</th>
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
              <td className="border px-4 py-2">
                <button onClick={() => handleEdit(lead)} className="bg-yellow-500 text-white px-2 py-1 mr-2">Editar</button>
                <button onClick={() => setDeleteId(lead.id_lead)} className="bg-red-500 text-white px-2 py-1">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmación */}
      {deleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <h3 className="text-lg font-semibold mb-4">¿Estás seguro de que deseas eliminar este lead?</h3>
            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">Sí, eliminar</button>
              <button onClick={() => setDeleteId(null)} className="bg-gray-300 text-black px-4 py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;
