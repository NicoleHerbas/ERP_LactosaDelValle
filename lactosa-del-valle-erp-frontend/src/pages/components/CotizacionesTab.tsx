import React, { useEffect, useState } from 'react';
import {
  fetchLeads,
  fetchClientes,
  fetchProductos,
  fetchCotizaciones,
  crearCotizacion,
  crearVentaDirecta
} from '../../services/api';
import ModalCotizacion from '../components/ModalCotizacion';

interface Producto {
  id_producto: number;
  nombre: string;
  precio: number | string;
}

interface ProductoCotizado {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

const CotizacionesTab: React.FC = () => {
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [productos, setProductos] = useState<ProductoCotizado[]>([]);
  const [tipoCliente, setTipoCliente] = useState<'lead' | 'cliente'>('lead');
  const [tipoOperacion, setTipoOperacion] = useState<'cotizacion' | 'venta'>('cotizacion');
  const [leads, setLeads] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<any | null>(null);

  useEffect(() => {
    fetchLeads().then(setLeads);
    fetchClientes().then(setClientes);
    fetchProductos().then(data =>
      setProductosDisponibles(data.map((p: Producto) => ({
        ...p,
        precio: typeof p.precio === 'string' ? parseFloat(p.precio) : p.precio
      })))
    );
    fetchCotizaciones().then(setCotizaciones);
  }, []);

  const agregarProducto = () => {
    if (productoSeleccionado && cantidad > 0) {
      setProductos([
        ...productos,
        {
          id_producto: productoSeleccionado.id_producto,
          nombre: productoSeleccionado.nombre,
          cantidad,
          precio_unitario: Number(productoSeleccionado.precio)
        }
      ]);
      setProductoSeleccionado(null);
      setCantidad(1);
    }
  };

  const calcularTotal = () => {
    return productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
  };

  const handleVerDetalle = async (id: number) => {
    const res = await fetch(`http://localhost:5000/api/cotizaciones/${id}`);
    const detalle = await res.json();
    setDetalleSeleccionado(detalle);
  };

  const convertirEnVenta = async () => {
    if (!detalleSeleccionado) return;
    const confirm = window.confirm('¿Deseas convertir esta cotización en venta?');
    if (!confirm) return;

    const res = await fetch(`http://localhost:5000/api/cotizaciones/${detalleSeleccionado.id_cotizacion}/convertir-a-venta`, {
      method: 'POST'
    });

    if (res.ok) {
      alert('Cotización convertida en venta');
      setDetalleSeleccionado(null);
      fetchCotizaciones().then(setCotizaciones);
    } else {
      alert('Error al convertir. Ver consola');
      console.error(await res.text());
    }
  };

  const handleGuardarOperacion = async () => {
    const lista = tipoCliente === 'lead' ? leads : clientes;
    const entidad = lista.find(c => (c.id_cliente || c.id) === parseInt(clienteSeleccionado));
    if (!entidad) return alert('Debe seleccionar un cliente válido');

    const id_cliente = entidad.id_cliente || entidad.id;

    const data = {
      id_cliente,
      productos,
      fecha_cotizacion: new Date().toISOString().split('T')[0],
      ...(editandoId && { id_cotizacion: editandoId })
    };

    try {
      if (tipoOperacion === 'cotizacion') {
        await crearCotizacion(data);
        alert(editandoId ? 'Cotización actualizada' : 'Cotización registrada');
      } else {
        await crearVentaDirecta(data);
        alert('Venta directa registrada');
      }
      setProductos([]);
      setClienteSeleccionado('');
      setEditandoId(null);
      fetchCotizaciones().then(setCotizaciones);
    } catch (err) {
      alert('Error al guardar operación. Revisa consola.');
      console.error(err);
    }
  };

  const handleEliminarCotizacion = async (id: number) => {
    const confirm = window.confirm(`¿Seguro que deseas eliminar la cotización ${id}?`);
    if (!confirm) return;

    try {
      await fetch(`/api/cotizaciones/${id}`, { method: 'DELETE' });
      alert('Cotización eliminada');
      fetchCotizaciones().then(setCotizaciones);
    } catch (err) {
      alert('Error al eliminar. Revisa consola');
      console.error(err);
    }
  };

  const handleEditar = (c: any) => {
    setEditandoId(c.id_cotizacion);
    setClienteSeleccionado(c.id_cliente.toString());
    setTipoCliente(c.tipo_cliente);
    setTipoOperacion('cotizacion');
    setProductos(c.productos || []);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{editandoId ? 'Editar Cotización' : `Registrar ${tipoOperacion === 'cotizacion' ? 'Cotización' : 'Venta directa'}`}</h2>

      <div className="flex gap-4 mb-4">
        <label><input type="radio" value="cotizacion" checked={tipoOperacion === 'cotizacion'} onChange={() => setTipoOperacion('cotizacion')} /> Cotización</label>
        <label><input type="radio" value="venta" checked={tipoOperacion === 'venta'} onChange={() => setTipoOperacion('venta')} /> Venta directa</label>
      </div>

      <div className="flex gap-4 items-center mb-4">
        <label>
          <input type="radio" value="lead" checked={tipoCliente === 'lead'} onChange={() => setTipoCliente('lead')} /> Lead
        </label>
        <label>
          <input type="radio" value="cliente" checked={tipoCliente === 'cliente'} onChange={() => setTipoCliente('cliente')} /> Cliente
        </label>

        <select
          className="border p-2"
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
        >
          <option value="">Seleccione</option>
          {(tipoCliente === 'lead' ? leads : clientes).map((c) => (
            <option key={`op-${tipoCliente}-${c.id || c.id_cliente || Math.random()}`} value={c.id_cliente || c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Agregar Producto</h3>

        <select
          className="border p-1 mr-2"
          value={productoSeleccionado?.id_producto || ''}
          onChange={(e) => {
            const prod = productosDisponibles.find(p => p.id_producto === parseInt(e.target.value));
            setProductoSeleccionado(prod || null);
          }}
        >
          <option value="">Seleccione producto</option>
          {productosDisponibles.map((p) => (
            <option key={`prod-${p.id_producto}`} value={p.id_producto}>
              {p.nombre} - Bs {parseFloat(p.precio as any).toFixed(2)}
            </option>
          ))}
        </select>

        <input
          className="border p-1 mr-2"
          type="number"
          min={1}
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
        />

        <button className="bg-green-600 text-white px-4 py-1" onClick={agregarProducto}>
          Agregar
        </button>
      </div>

      {productos.length > 0 && (
        <>
          <table className="w-full mb-4 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, i) => (
                <tr key={i}>
                  <td>{p.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>{p.precio_unitario.toFixed(2)}</td>
                  <td>{(p.cantidad * p.precio_unitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="font-bold mb-4">Total: Bs {calcularTotal().toFixed(2)}</div>
        </>
      )}

      <button
        className="bg-blue-600 text-white px-4 py-2"
        onClick={handleGuardarOperacion}
        disabled={productos.length === 0 || !clienteSeleccionado}
      >
        {editandoId ? 'Actualizar Cotización' : `Guardar ${tipoOperacion === 'cotizacion' ? 'Cotización' : 'Venta'}`}
      </button>

      <h2 className="text-xl font-bold mt-8 mb-4">Cotizaciones Registradas</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Cliente</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Fecha</th>
            <th className="border px-2 py-1">Estado</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map((c) => (
            <tr key={`cot-${c.id_cotizacion}`} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{c.id_cotizacion}</td>
              <td className="border px-2 py-1">{c.nombre_cliente}</td>
              <td className="border px-2 py-1">Bs {parseFloat(c.monto_total || '0').toFixed(2)}</td>
              <td className="border px-2 py-1">{c.fecha_cotizacion}</td>
              <td className="border px-2 py-1">{c.estado}</td>
              <td className="border px-2 py-1 text-center">
                <button
                  onClick={() => handleVerDetalle(c.id_cotizacion)}
                  className="text-blue-600 hover:underline mr-2"
                >
                  Ver
                </button>
                <button
                  onClick={() => handleEditar(c)}
                  className="text-yellow-600 hover:underline mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarCotizacion(c.id_cotizacion)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detalleSeleccionado && (
        <ModalCotizacion
          detalle={detalleSeleccionado}
          onClose={() => setDetalleSeleccionado(null)}
          onConvertirVenta={convertirEnVenta}
        />
      )}
    </div>
  );
};

export default CotizacionesTab;
