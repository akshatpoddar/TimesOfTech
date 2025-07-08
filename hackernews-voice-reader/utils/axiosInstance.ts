import axios from 'axios';
import { HN_API_BASE_URL } from '../constants/api';

const axiosInstance = axios.create({
  baseURL: HN_API_BASE_URL,
});

export default axiosInstance;