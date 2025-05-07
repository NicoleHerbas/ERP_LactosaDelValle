import axios from 'axios';

export const fetchEmployees = async () => {
  const response = await axios.get('/api/employees');
  return response.data;
};
