import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://ai-internship-frontend2.onrender.com/register',
    baseURL: process.env.REACT_APP_API_URL || 'https://ai-internship-backend2.onrender.com',
    headers: { 'Content-Type': 'application/json' },
  });

// Attach token from localStorage automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/register', data);
export const login    = (data) => API.post('/login', data);

// Profile
export const getProfile    = ()     => API.get('/profile');
export const updateProfile = (data) => API.put('/profile', data);

// Internships
export const getInternships = () => API.get('/internships');

// Recommendations & Matches
export const getRecommendations = () => API.get('/recommendations');
export const getMatches         = ()  => API.get('/matches');

export default API;
