import axios from 'axios';

export const fetchEmployees = async () => {
  const response = await axios.get('/api/employees');
  return response.data;
};

const api = axios.create({
  baseURL: 'http://localhost:3001/api/produccion',
});

export const crearOrden = (data: { product: string; quantity: number }) =>
  api.post('/orden', data);

export const ejecutarOrden = (data: { product: string; quantity: number }) =>
  api.post('/orden/ejecutar', data);

export const consultarStock = (product: string) =>
  api.get(`/stock/${product}`);


export const fetchAttendance = async () => {
  const response = await axios.get('/api/attendance');
  return response.data;
};

export const fetchPayroll = async () => {
  const response = await axios.get('/api/payroll');
  return response.data;
};
