// src/api.ts
import axios from 'axios';
/* 
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
 */
// ==================== Recursos Humanos ====================
export const fetchEmployees = async () => {
  const res = await api.get('/employees');
  return res.data;
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
/* 
export const crearOrden = (data: { product: string; quantity: number }) =>
  api.post('/orden', data);

export const ejecutarOrden = (data: { product: string; quantity: number }) =>
  api.post('/orden/ejecutar', data);

export const consultarStock = (product: string) =>
  api.get(`/stock/${product}`); */


export const fetchAttendance = async () => {
  const res = await api.get('/attendance');
  return res.data;
};

export const fetchPayroll = async () => {
  const res = await api.get('/payroll');
  return res.data;
};

// ==================== Marketing y Leads ====================
export const fetchLeads = async () => {
  const res = await api.get('/leads');
  return res.data;
};

export const fetchClientes = async () => {
  const res = await axios.get('http://localhost:5000/api/clientes');
  return res.data;
};


export const fetchCampanias = async () => {
  const res = await api.get('/campanias');
  return res.data;
};

export const crearCampania = async (data: any) => {
  const res = await api.post('/campanias', data);
  return res.data;
};

export const eliminarCampania = async (id: number) => {
  const res = await api.delete(`/campanias/${id}`);
  return res.data;
};

// ==================== Producción ====================
export const crearOrden = (data: { product: string; quantity: number }) =>
  axios.post('http://localhost:5000/api/produccion/orden', data);

export const ejecutarOrden = (data: { product: string; quantity: number }) =>
  axios.post('http://localhost:5000/api/produccion/orden/ejecutar', data);

export const consultarStock = (product: string) =>
  axios.get(`http://localhost:5000/api/produccion/stock/${product}`);

// ==================== Cotizaciones ====================
const COTIZACIONES_URL = '/cotizaciones';

export const fetchCotizaciones = async () => {
  const res = await api.get(COTIZACIONES_URL);
  return res.data;
};

export const crearCotizacion = async (cotizacion: any) => {
  const res = await api.post(COTIZACIONES_URL, cotizacion);
  return res.data;
};

export const convertirCotizacionEnVenta = async (id: number) => {
  const res = await api.post(`${COTIZACIONES_URL}/${id}/convertir-a-venta`);
  return res.data;
};

export const fetchProductos = async () => {
  const res = await api.get(`${COTIZACIONES_URL}/productos`);
  return res.data;
};
export const crearVentaDirecta = async (venta: any) => {
  const res = await axios.post('http://localhost:5000/api/ventas/directa', venta);
  return res.data;
};

// Clientes API
export const fetchClientesPanel = async () => {
  const res = await fetch('http://localhost:5000/api/clientes1');
  return await res.json();
};

export const crearCliente = async (data: any) => {
  const res = await fetch('http://localhost:5000/api/clientes1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const actualizarCliente = async (id: number, data: any) => {
  const res = await fetch(`http://localhost:5000/api/clientes1/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const eliminarCliente = async (id: number) => {
  const res = await fetch(`http://localhost:5000/api/clientes1/${id}`, {
    method: 'DELETE',
  });
  return await res.json();
};
export const fetchHistorialPorCliente = async (id_cliente: number) => {
  const res = await axios.get(`http://localhost:5000/api/clientes1/${id_cliente}/historial`);
  return res.data;
};
