import React, { useState, useEffect } from 'react';
import axios from 'axios';

type StockItem = {
  product: string;
  cantidad: number;
};

const Production = () => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const API_URL = 'http://localhost:5173/api/production';

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await axios.get(`${API_URL}/stock`);
      setStock(res.data);
      if (res.data.length > 0) {
        setSelectedProduct(res.data[0].product); // Selecciona el primero por defecto
      }
    } catch (error) {
      setMessage('Error al cargar el stock');
    }
  };

  const createOrder = async () => {
    try {
      const res = await axios.post(`${API_URL}/create-order`, {
        quantity,
        product: selectedProduct
      });
      setMessage(res.data.message);
      fetchStock();
    } catch (err: any) {
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage('Error al crear la orden');
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '40px'
    }}>
      <h2>Gestión de Producción</h2>

      {message && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px 20px',
          marginBottom: '20px',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}

      <table style={{
        borderCollapse: 'collapse',
        width: '60%',
        marginBottom: '20px',
        textAlign: 'center',
        border: '1px solid #ccc'
      }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Producto</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item.product}>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{item.product}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{item.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ padding: '8px' }}
        >
          {stock.map((item) => (
            <option key={item.product} value={item.product}>{item.product}</option>
          ))}
        </select>

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ padding: '8px', width: '80px' }}
        />

        <button
          onClick={createOrder}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Crear Orden
        </button>
      </div>
    </div>
  );
};

export default Production;
