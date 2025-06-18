import React, { useEffect, useState } from 'react';
import HistorialModal from './HistorialModal';

interface Cliente {
  id_cliente?: number;
  nombre: string;
  telefono: string;
  correo: string;
  tipo_cliente: string;
  direccion: string;
  volumen?: number;
}

interface Compra {
  id_venta: number;
  fecha_venta: string;
  id_producto: number;
  producto: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

const ClientesTab: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formulario, setFormulario] = useState<Omit<Cliente, 'id_cliente' | 'volumen'>>({
    nombre: '',
    telefono: '',
    correo: '',
    tipo_cliente: 'mayorista',
    direccion: ''
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [historial, setHistorial] = useState<Compra[]>([]);
  const [clienteNombre, setClienteNombre] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroVolumen, setFiltroVolumen] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const res = await fetch('http://localhost:5000/api/clientes1');
    const data = await res.json();
    setClientes(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulario.nombre || !formulario.telefono || !formulario.correo || !formulario.direccion) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const method = editandoId ? 'PUT' : 'POST';
    const url = editandoId
  ? `http://localhost:5000/api/clientes1/${editandoId}`
  : 'http://localhost:5000/api/clientes1'; // <--- comilla simple bien cerrada

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formulario, estado: 'activo' })
    });

    if (res.ok) {
      alert(editandoId ? 'Cliente actualizado' : 'Cliente creado');
      setFormulario({
        nombre: '',
        telefono: '',
        correo: '',
        tipo_cliente: 'mayorista',
        direccion: ''
      });
      setEditandoId(null);
      fetchClientes();
    } else {
      alert('Error al guardar');
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setFormulario({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
      tipo_cliente: cliente.tipo_cliente,
      direccion: cliente.direccion
    });
    setEditandoId(cliente.id_cliente!);
  };

  const handleEliminar = async (id: number) => {
    const confirm = window.confirm('¿Seguro que deseas eliminar este cliente?');
    if (!confirm) return;

    const res = await fetch(`http://localhost:5000/api/clientes1/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Cliente eliminado');
      fetchClientes();
    } else {
      alert('Error al eliminar');
    }
  };

  const verHistorial = async (cliente: Cliente) => {
    try {
      const res = await fetch(`http://localhost:5000/api/clientes1/${cliente.id_cliente}/historial`);
      const data = await res.json();
      setHistorial(data);
      setClienteNombre(cliente.nombre);
      setModalVisible(true);
    } catch (error) {
      alert('Error al cargar historial');
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const coincideTipo = filtroTipo ? c.tipo_cliente === filtroTipo : true;
    const volumenNum = Number(c.volumen ?? 0);
    const coincideVolumen =
      filtroVolumen === 'alto' ? volumenNum > 1000 :
      filtroVolumen === 'medio' ? volumenNum > 500 && volumenNum <= 1000 :
      filtroVolumen === 'bajo' ? volumenNum <= 500 :
      true;
    return coincideTipo && coincideVolumen;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{editandoId ? 'Editar Cliente' : 'Registrar Cliente'}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-8">
        <input name="nombre" placeholder="Nombre" className="border p-2" value={formulario.nombre} onChange={handleChange} required />
        <input name="telefono" placeholder="Teléfono" className="border p-2" value={formulario.telefono} onChange={handleChange} required />
        <input name="correo" placeholder="Correo" className="border p-2" value={formulario.correo} onChange={handleChange} required />
        <select name="tipo_cliente" className="border p-2" value={formulario.tipo_cliente} onChange={handleChange}>
          <option value="mayorista">Mayorista</option>
          <option value="supermercado">Supermercado</option>
          <option value="consumidor">Consumidor</option>
        </select>
        <input name="direccion" placeholder="Dirección" className="border p-2" value={formulario.direccion} onChange={handleChange} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 col-span-2">
          {editandoId ? 'Actualizar' : 'Registrar'}
        </button>
      </form>

      <div className="flex gap-4 mb-4">
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="border p-2">
          <option value="">Todos los Tipos</option>
          <option value="mayorista">Mayorista</option>
          <option value="supermercado">Supermercado</option>
          <option value="consumidor">Consumidor</option>
        </select>
        <select value={filtroVolumen} onChange={(e) => setFiltroVolumen(e.target.value)} className="border p-2">
          <option value="">Todo Volumen</option>
          <option value="alto">Alto (&gt; 1000 Bs)</option>
          <option value="medio">Medio (501 - 1000 Bs)</option>
          <option value="bajo">Bajo (&le; 500 Bs)</option>
        </select>
      </div>

      <h2 className="text-xl font-bold mb-2">Clientes Registrados</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Teléfono</th>
            <th className="border px-2 py-1">Correo</th>
            <th className="border px-2 py-1">Tipo</th>
            <th className="border px-2 py-1">Volumen</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map(c => (
            <tr key={c.id_cliente}>
              <td className="border px-2 py-1">{c.id_cliente}</td>
              <td className="border px-2 py-1">{c.nombre}</td>
              <td className="border px-2 py-1">{c.telefono}</td>
              <td className="border px-2 py-1">{c.correo}</td>
              <td className="border px-2 py-1">{c.tipo_cliente}</td>
              <td className="border px-2 py-1">Bs. {c.volumen ?? 0}</td>
              <td className="border px-2 py-1 text-center">
                <button onClick={() => handleEditar(c)} className="text-yellow-600 hover:underline mr-2">Editar</button>
                <button onClick={() => handleEliminar(c.id_cliente!)} className="text-red-600 hover:underline mr-2">Eliminar</button>
                <button onClick={() => verHistorial(c)} className="text-blue-600 hover:underline">Ver Historial</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <HistorialModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        historial={historial}
        cliente={clienteNombre}
      />
    </div>
  );
};

export default ClientesTab;
