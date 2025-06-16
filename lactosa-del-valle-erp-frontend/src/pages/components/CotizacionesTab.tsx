import React, { useEffect, useState } from 'react';
import { fetchLeads, fetchClientes, fetchProductos } from '../../services/api';

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

interface Cotizacion {
  id: number;
  tipo_cliente: 'lead' | 'cliente';
  nombre_cliente: string;
  productos: ProductoCotizado[];
  total: number;
  fecha: string;
  estado: string;
}

const CotizacionesTab: React.FC = () => {
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [productos, setProductos] = useState<ProductoCotizado[]>([]);
  const [tipoCliente, setTipoCliente] = useState<'lead' | 'cliente'>('lead');
  const [leads, setLeads] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  // Cotizaciones simuladas por defecto
  const cotizacionesIniciales: Cotizacion[] = [
    {
      id: 1,
      tipo_cliente: 'cliente',
      nombre_cliente: 'Supermercado 1',
      productos: [
        { id_producto: 1, nombre: 'Leche Entera', cantidad: 10, precio_unitario: 4.5 },
        { id_producto: 2, nombre: 'Yogurt Natural', cantidad: 5, precio_unitario: 3.8 },
      ],
      total: 65.5,
      fecha: '2024-05-28',
      estado: 'pendiente',
    },
    {
      id: 2,
      tipo_cliente: 'lead',
      nombre_cliente: 'Juan Pérez',
      productos: [
        { id_producto: 3, nombre: 'Queso Fresco', cantidad: 3, precio_unitario: 8.9 },
      ],
      total: 26.7,
      fecha: '2024-05-29',
      estado: 'pendiente',
    }
  ];

  useEffect(() => {
    fetchLeads().then(setLeads);
    fetchClientes().then(setClientes);
    fetchProductos().then(data =>
      setProductosDisponibles(data.map((p: Producto) => ({
        ...p,
        precio: typeof p.precio === 'string' ? parseFloat(p.precio) : p.precio
      })))
    );

    const almacenadas = localStorage.getItem('cotizaciones');
    if (almacenadas) {
      setCotizaciones(JSON.parse(almacenadas));
    } else {
      setCotizaciones(cotizacionesIniciales);
      localStorage.setItem('cotizaciones', JSON.stringify(cotizacionesIniciales));
    }
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

  const handleCrearCotizacion = () => {
    const nuevaCotizacion: Cotizacion = {
      id: cotizaciones.length + 1,
      tipo_cliente: tipoCliente,
      nombre_cliente: clienteSeleccionado,
      productos,
      total: calcularTotal(),
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente'
    };

    const actualizadas = [...cotizaciones, nuevaCotizacion];
    setCotizaciones(actualizadas);
    localStorage.setItem('cotizaciones', JSON.stringify(actualizadas));

    setProductos([]);
    setClienteSeleccionado('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Registrar Cotización</h2>

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
            <option key={c.id_cliente || c.id} value={c.nombre}>
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
            <option key={p.id_producto} value={p.id_producto}>
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

      {productos.length > 0 ? (
        <table className="w-full mb-4">
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
      ) : (
        <div className="text-gray-500 italic mb-4">No hay productos agregados.</div>
      )}

      <div className="font-bold mb-4">Total: Bs {calcularTotal().toFixed(2)}</div>

      <button
        className="bg-blue-600 text-white px-4 py-2"
        onClick={handleCrearCotizacion}
        disabled={productos.length === 0 || !clienteSeleccionado}
      >
        Guardar Cotización
      </button>

      <h2 className="text-xl font-bold mt-8 mb-4">Cotizaciones Registradas</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map((c, i) => (
            <tr key={i} className="border-t">
              <td>{c.nombre_cliente}</td>
              <td>{c.tipo_cliente}</td>
              <td>Bs {c.total.toFixed(2)}</td>
              <td>{c.fecha}</td>
              <td>{c.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CotizacionesTab;
