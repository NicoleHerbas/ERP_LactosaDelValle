import axios from 'axios';

export const fetchEmployees = async () => {
  const response = await axios.get('/api/employees');
  return response.data;
};

export const fetchAttendance = async () => {
  const response = await axios.get('/api/attendance');
  return response.data;
};

export const fetchPayroll = async () => {
  const response = await axios.get('/api/payroll');
  return response.data;
};
