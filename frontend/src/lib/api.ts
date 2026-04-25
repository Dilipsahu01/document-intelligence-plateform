import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// MAKE SURE 'export' IS HERE
export const askChat = async (query: string) => {
  const response = await api.post('chat/', { query });
  return response.data;
};
