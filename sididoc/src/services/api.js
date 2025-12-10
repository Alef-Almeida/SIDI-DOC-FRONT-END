import axios from 'axios';

const api = axios.create({
  // Ajuste a porta conforme seu backend Java (Spring Boot geralmente é 8080)
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;