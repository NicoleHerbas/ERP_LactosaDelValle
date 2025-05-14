import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Orden {
  id_orden: number;
  producto: string;
  estado: string;
}

const ControlCalidad: React.FC = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [form, setForm] = useState({
    id_orden: '',
    temperatura: '',
    ph: '',
    observaciones: ''
  });

  // Cargar órdenes de producción activas
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await axios.get('/api/production/ordenes');
        const pendientesOEnProceso = res.data.filter((orden: Orden) =>
          ['pendiente', 'en_proceso'].includes(orden.estado)
        );
        setOrdenes(pendientesOEnProceso);
      } catch (err) {
        console.error('Error al cargar órdenes:', err);
      }
    };
    fetchOrdenes();
  }, []);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/production/control-calidad', form);
      alert('Control de calidad registrado con éxito');
      setForm({ id_orden: '', temperatura: '', ph: '', observaciones: '' });
    } catch (err) {
      console.error('Error al registrar control de calidad:', err);
      alert('Error al registrar control de calidad');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Registrar Control de Calidad</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Orden de Producción:</label>
          <select name="id_orden" value={form.id_orden} onChange={handleChange} required>
            <option value="">Seleccione una orden</option>
            {ordenes.map((orden) => (
              <option key={orden.id_orden} value={orden.id_orden}>
                #{orden.id_orden} - {orden.producto}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Temperatura (°C):</label>
          <input
            type="number"
            step="0.01"
            name="temperatura"
            value={form.temperatura}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>pH:</label>
          <input
            type="number"
            step="0.01"
            name="ph"
            value={form.ph}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Observaciones:</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <button type="submit">Guardar Control</button>
      </form>
    </div>
  );
};

export default ControlCalidad;
