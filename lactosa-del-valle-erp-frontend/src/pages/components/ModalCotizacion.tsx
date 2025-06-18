// src/components/ModalCotizacion.tsx
import React from 'react';

interface ModalCotizacionProps {
  detalle: any;
  onClose: () => void;
  onConvertirVenta: () => void;
}

const ModalCotizacion: React.FC<ModalCotizacionProps> = ({ detalle, onClose, onConvertirVenta }) => {
  if (!detalle) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-xl">
        <h3 className="text-lg font-bold mb-2">Detalle de Cotización #{detalle.id_cotizacion}</h3>
        <p><strong>Cliente:</strong> {detalle.nombre_cliente}</p>
        <p><strong>Fecha:</strong> {new Date(detalle.fecha_cotizacion).toLocaleDateString()}</p>
        <p><strong>Estado:</strong> {detalle.estado}</p>
        <p className="mt-2 font-semibold">Productos:</p>
        <ul className="list-disc list-inside mb-4">
          {detalle.productos.map((p: any, i: number) => (
            <li key={i}>
              {p.nombre} - {p.cantidad} x Bs {parseFloat(p.precio_unitario).toFixed(2)}
            </li>
          ))}
        </ul>
        <p className="font-bold">Total: Bs {parseFloat(detalle.monto_total).toFixed(2)}</p>

        <div className="flex justify-end gap-3 mt-4">
          {detalle.estado === 'pendiente' && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={onConvertirVenta}
            >
              Convertir en Venta
            </button>
          )}
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCotizacion;
