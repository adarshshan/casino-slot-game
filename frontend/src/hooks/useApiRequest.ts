
import { useState } from 'react';
import api from '../utils/api'; // Import the intercepted axios instance

const useApiRequest = () => {
  const [loading, setLoading] = useState(false);

  const request = async ({ url, method, body }: { url: string; method: string; body?: any }) => {
    setLoading(true);
    try {
      const response = await api.request({
        url,
        method,
        data: body,
      });
      setLoading(false);
      return response?.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return { request, loading };
};

export default useApiRequest;
