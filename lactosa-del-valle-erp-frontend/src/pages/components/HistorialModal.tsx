import React, { useEffect, useState } from 'react';

interface Compra {
  id_venta: number;
  fecha_venta: string;
  id_producto: number;
  producto: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  historial: Compra[];
  cliente: string;
}

const HistorialModal: React.FC<Props> = ({ visible, onClose, historial, cliente }) => {
  if (!visible) return null;

  // Agrupar productos y calcular totales
  const resumenProductos: Record<string, { cantidad: number; total: number }> = {};
  let montoTotal = 0;

  historial.forEach((c) => {
    const subtotal = parseFloat(c.subtotal);
    montoTotal += subtotal;
    if (!resumenProductos[c.producto]) {
      resumenProductos[c.producto] = { cantidad: c.cantidad, total: subtotal };
    } else {
      resumenProductos[c.producto].cantidad += c.cantidad;
      resumenProductos[c.producto].total += subtotal;
    }
  });

  // Encontrar el producto más comprado
  const productoTop = Object.entries(resumenProductos).reduce(
    (max, actual) => (actual[1].cantidad > max[1].cantidad ? actual : max),
    Object.entries(resumenProductos)[0] || ["", { cantidad: 0, total: 0 }]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-3xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">Historial de Compras - {cliente}</h2>

        {historial.length === 0 ? (
          <p>No hay compras registradas.</p>
        ) : (
          <>
            <table className="w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Fecha</th>
                  <th className="border px-2 py-1">Producto</th>
                  <th className="border px-2 py-1">Cantidad</th>
                  <th className="border px-2 py-1">P. Unitario</th>
                  <th className="border px-2 py-1">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((compra, index) => (
                  <tr key={`${compra.id_venta}-${compra.id_producto}-${index}`}>
                    <td className="border px-2 py-1">{compra.fecha_venta.split('T')[0]}</td>
                    <td className="border px-2 py-1">{compra.producto}</td>
                    <td className="border px-2 py-1">{compra.cantidad}</td>
                    <td className="border px-2 py-1">Bs. {parseFloat(compra.precio_unitario).toFixed(2)}</td>
                    <td className="border px-2 py-1">Bs. {parseFloat(compra.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-sm text-gray-700 mb-4">
              <p><strong>Monto Total Acumulado:</strong> Bs. {montoTotal.toFixed(2)}</p>
              <p><strong>Producto más comprado:</strong> {productoTop[0]} ({productoTop[1].cantidad} unidades)</p>
            </div>
          </>
        )}

        <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded">Cerrar</button>
      </div>
    </div>
  );
};

export default HistorialModal;
