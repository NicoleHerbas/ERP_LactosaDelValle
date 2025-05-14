import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Orden {
  id_orden: number;
  producto: string;
  cantidad: number;
  estado: string;
  fechaRegistro: string;
}

interface Detalle {
  orden: Orden;
  control: {
    temperatura?: number;
    ph?: number;
    observaciones?: string;
  } | null;
}

const Ordenes: React.FC = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [detalles, setDetalles] = useState<Detalle | null>(null);
  const [controlForm, setControlForm] = useState({ temperatura: 0, ph: 0, observaciones: '' });
  const [productos, setProductos] = useState<string[]>([]);
  const [nuevaOrden, setNuevaOrden] = useState({ producto: '', cantidad: 0 });

  const [mostrarFormProducto, setMostrarFormProducto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    fecha_caducidad: ''
  });

  const [idEmpleadoActivo] = useState(1); // 👈 Asegúrate de usar el ID del empleado logueado

  useEffect(() => {
    cargarOrdenes();
    cargarProductos();
  }, []);

  const cargarOrdenes = async () => {
    try {
      const res = await axios.get('/api/production/ordenes');
      setOrdenes(res.data);
    } catch {
      alert('Error al cargar órdenes');
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await axios.get('/api/production/productos');
      setProductos(res.data.map((p: any) => p.nombre));
    } catch {
      alert('Error al cargar productos');
    }
  };

  const crearProducto = async () => {
    const { nombre, descripcion, precio, fecha_caducidad } = nuevoProducto;
    if (!nombre || !descripcion || !precio) {
      alert('Completa todos los campos del producto');
      return;
    }

    try {
      await axios.post('/api/production/productos', {
        nombre, descripcion, precio, fecha_caducidad
      });
      await cargarProductos();
      setNuevaOrden({ ...nuevaOrden, producto: nombre });
      alert('Producto creado');
      setMostrarFormProducto(false);
      setNuevoProducto({ nombre: '', descripcion: '', precio: 0, fecha_caducidad: '' });
    } catch {
      alert('Error al crear producto');
    }
  };

  const crearOrden = async () => {
    if (!nuevaOrden.producto || nuevaOrden.cantidad <= 0) {
      alert('Selecciona producto y cantidad válida');
      return;
    }

    try {
      await axios.post('/api/production/create-order', {
        product: nuevaOrden.producto,
        quantity: nuevaOrden.cantidad
      });
      alert('Orden creada');
      setNuevaOrden({ producto: '', cantidad: 0 });
      cargarOrdenes();
    } catch {
      alert('Error al crear orden');
    }
  };

  const cambiarEstado = async (id_orden: number, nuevoEstado: string) => {
    try {
      await axios.put(`/api/production/ordenes/${id_orden}/estado`, {
        nuevoEstado,
        id_empleado: idEmpleadoActivo
      });
      cargarOrdenes();
    } catch {
      alert('Error al actualizar estado');
    }
  };

  const eliminarOrden = async (id_orden: number) => {
    if (confirm('¿Eliminar esta orden?')) {
      try {
        await axios.delete(`/api/production/ordenes/${id_orden}`);
        cargarOrdenes();
        setDetalles(null);
      } catch {
        alert('Error al eliminar orden');
      }
    }
  };

  const verDetalles = async (id_orden: number) => {
    try {
      const res = await axios.get(`/api/production/orden/${id_orden}`);
      setDetalles(res.data);
      setControlForm({ temperatura: 0, ph: 0, observaciones: '' });
    } catch {
      alert('Error al obtener detalles');
    }
  };

  const registrarControl = async () => {
    if (!detalles) return;
    try {
      await axios.post('/api/production/control-calidad', {
        id_orden: detalles.orden.id_orden,
        temperatura: controlForm.temperatura,
        ph: controlForm.ph,
        observaciones: controlForm.observaciones
      });
      alert('Control registrado');
      setControlForm({ temperatura: 0, ph: 0, observaciones: '' });
      verDetalles(detalles.orden.id_orden);
    } catch {
      alert('Error al registrar control de calidad');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100';
      case 'en_proceso': return 'bg-blue-100';
      case 'completada': return 'bg-green-100';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Órdenes de Producción</h2>

      {/* Nueva Orden */}
      <div className="bg-white border p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Nueva Orden</h3>
        <div className="flex gap-4 items-center flex-wrap">
          <select
            className="border px-2 py-1 rounded"
            value={nuevaOrden.producto}
            onChange={(e) => setNuevaOrden({ ...nuevaOrden, producto: e.target.value })}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((prod) => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Cantidad"
            className="border px-2 py-1 rounded w-32"
            value={nuevaOrden.cantidad}
            onChange={(e) => setNuevaOrden({ ...nuevaOrden, cantidad: parseInt(e.target.value) || 0 })}
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={crearOrden}>
            Crear Orden
          </button>

          <button
            className="bg-green-700 text-white px-3 py-1 rounded"
            onClick={() => setMostrarFormProducto(!mostrarFormProducto)}
          >
            + Producto
          </button>
        </div>

        {mostrarFormProducto && (
          <div className="mt-4 p-4 bg-gray-100 rounded shadow w-full">
            <h4 className="font-semibold mb-2">Nuevo Producto</h4>
            <input
              type="text"
              placeholder="Nombre"
              className="border px-2 py-1 rounded w-full mb-2"
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            />
            <input
              type="text"
              placeholder="Descripción"
              className="border px-2 py-1 rounded w-full mb-2"
              value={nuevoProducto.descripcion}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
            />
            <input
              type="number"
              placeholder="Precio"
              className="border px-2 py-1 rounded w-full mb-2"
              value={nuevoProducto.precio}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) || 0 })}
            />
            <input
              type="date"
              className="border px-2 py-1 rounded w-full mb-2"
              value={nuevoProducto.fecha_caducidad}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, fecha_caducidad: e.target.value })}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={crearProducto}>
              Guardar Producto
            </button>
          </div>
        )}
      </div>

      {/* Tabla de Órdenes */}
      <table className="w-full border border-gray-300 shadow text-center bg-white">
        <thead className="bg-blue-100">
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden.id_orden} className="border-b hover:bg-gray-50">
              <td>{orden.id_orden}</td>
              <td>{orden.producto}</td>
              <td>{orden.cantidad}</td>
              <td className={getEstadoColor(orden.estado)}>
                <select
                  value={orden.estado}
                  onChange={(e) => cambiarEstado(orden.id_orden, e.target.value)}
                  className={`border rounded px-1 ${
                    orden.estado === 'completada' ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : ''
                  }`}
                  disabled={orden.estado === 'completada'}
                >
                  <option value="pendiente">pendiente</option>
                  <option value="en_proceso">en_proceso</option>
                  <option value="completada">completada</option>
                </select>
              </td>
              <td>{orden.fechaRegistro.slice(0, 10)}</td>
              <td className="space-x-2">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => verDetalles(orden.id_orden)}
                >
                  Detalles
                </button>
                {orden.estado !== 'completada' && (
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => eliminarOrden(orden.id_orden)}
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detalles de la orden */}
      {detalles && (
        <div className="mt-8 bg-gray-100 p-4 rounded shadow"> 
          <h3 className="text-xl font-bold mb-2">Detalles de Orden #{detalles.orden.id_orden}</h3>
          <p><strong>Producto:</strong> {detalles.orden.producto}</p>
          <p><strong>Cantidad:</strong> {detalles.orden.cantidad}</p>
          <p><strong>Estado:</strong> {detalles.orden.estado}</p>
          <p><strong>Fecha:</strong> {detalles.orden.fechaRegistro.slice(0, 10)}</p>

          {detalles.control ? (
            <>
              <h4 className="mt-4 font-semibold">Control de Calidad</h4>
              <p><strong>Temperatura:</strong> {detalles.control.temperatura}°C</p>
              <p><strong>pH:</strong> {detalles.control.ph}</p>
              <p><strong>Observaciones:</strong> {detalles.control.observaciones}</p>
            </>
          ) : (
            <>
              <p className="text-red-600 mt-4">⚠ No se registró control de calidad para esta orden.</p>
              <div className="mt-4 space-y-2">
                <p className="text-black-600 mt-4">Teperatura</p>
                <input
                  type="number"
                  placeholder="Temperatura (°C)"
                  className="border px-2 py-1 rounded w-full"
                  value={controlForm.temperatura}
                  onChange={(e) => setControlForm({ ...controlForm, temperatura: parseFloat(e.target.value) || 0 })}
                />
                 <p className="text-black-600 mt-4">PH</p>
                <input
                  type="number"
                  placeholder="pH"
                  className="border px-2 py-1 rounded w-full"
                  value={controlForm.ph}
                  onChange={(e) => setControlForm({ ...controlForm, ph: parseFloat(e.target.value) || 0 })}
                />
                 <p className="text-black-600 mt-4">Observaciones</p>
                <textarea
                  placeholder="Observaciones"
                  className="border px-2 py-1 rounded w-full"
                  value={controlForm.observaciones}
                  onChange={(e) => setControlForm({ ...controlForm, observaciones: e.target.value })}
                ></textarea>
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={registrarControl}>
                  Guardar Control de Calidad
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Ordenes;
