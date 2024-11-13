import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Update with your backend URL if needed

// Register a new user
export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

// Log in an existing user
export const loginUser = async (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};
