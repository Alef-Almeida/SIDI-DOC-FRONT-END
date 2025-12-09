import axios from 'axios';

const api = axios.create({
  // Coloque aqui a URL do seu backend Java (ex: Spring Boot)
  baseURL: 'http://localhost:8080' 
});

export default api;